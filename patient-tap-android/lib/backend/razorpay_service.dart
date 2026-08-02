// ============================================================================
// Razorpay checkout.
//
// SECURITY MODEL — the key *secret* never ships in the APK:
//
//   1. App  → Edge Function `razorpay-order`  {tier, cycle}
//      The server looks the price up in its OWN table (a tampered client
//      cannot buy Premium for ₹1), creates the Razorpay order, and returns
//      {orderId, amount, currency, keyId}.
//   2. App  → native Razorpay checkout sheet with that orderId.
//   3. App  → Edge Function `razorpay-verify` {orderId, paymentId, signature}
//      The server recomputes HMAC-SHA256(orderId|paymentId, keySecret) and
//      only then activates the subscription.
//   4. Razorpay → Edge Function `razorpay-webhook` is the async source of
//      truth for captures, failures and refunds.
//
// Step 3 is a convenience so the UI updates immediately; step 4 is what makes
// the state correct even if the app is killed mid-payment.
// ============================================================================

import 'dart:async';

import 'package:razorpay_flutter/razorpay_flutter.dart';

import '../config/app_config.dart';
import 'supabase_client.dart';

class CheckoutResult {
  const CheckoutResult({
    required this.ok,
    this.simulated = false,
    this.cancelled = false,
    this.message,
  });

  final bool ok;
  final bool simulated;
  final bool cancelled;
  final String? message;
}

class RazorpayService {
  RazorpayService._();

  /// Runs the full order → pay → verify round trip.
  /// Resolves only once the payment has been verified server-side.
  static Future<CheckoutResult> checkout({
    required Tier tier,
    required BillingCycle cycle,
    required String userEmail,
    required String userName,
    String? userPhone,
  }) async {
    // ---- Demo mode: no keys, so simulate a successful upgrade locally. ----
    if (!AppConfig.hasRazorpay) {
      return CheckoutResult(
        ok: true,
        simulated: true,
        message: 'Upgraded to ${kTiers[tier]!.displayName} (demo)',
      );
    }

    // ---- 1. Create the order server-side ----
    late final Map<String, dynamic> order;
    try {
      order = await Db.invoke('razorpay-order', body: <String, dynamic>{
        'tier': tier.key,
        'cycle': cycle.name,
      });
    } on BackendException catch (e) {
      return CheckoutResult(ok: false, message: e.message);
    }

    final String? orderId = order['orderId'] as String?;
    final int? amount = (order['amount'] as num?)?.toInt();
    if (orderId == null || amount == null) {
      return const CheckoutResult(
          ok: false, message: 'Could not create the payment order');
    }

    // ---- 2. Open the native checkout sheet ----
    final Razorpay razorpay = Razorpay();
    final Completer<CheckoutResult> done = Completer<CheckoutResult>();

    void finish(CheckoutResult r) {
      if (!done.isCompleted) done.complete(r);
    }

    razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS,
        (PaymentSuccessResponse response) async {
      // ---- 3. Verify server-side before trusting anything ----
      try {
        final Map<String, dynamic> res =
            await Db.invoke('razorpay-verify', body: <String, dynamic>{
          'razorpay_order_id': response.orderId,
          'razorpay_payment_id': response.paymentId,
          'razorpay_signature': response.signature,
        });
        finish(CheckoutResult(
          ok: res['ok'] == true,
          message: res['ok'] == true
              ? 'Payment verified — ${kTiers[tier]!.displayName} active'
              : (res['error'] as String?) ?? 'Verification failed',
        ));
      } on BackendException catch (e) {
        finish(CheckoutResult(
          ok: false,
          message: 'Payment taken but not verified: ${e.message}',
        ));
      }
    });

    razorpay.on(Razorpay.EVENT_PAYMENT_ERROR,
        (PaymentFailureResponse response) {
      final bool cancelled = response.code == Razorpay.PAYMENT_CANCELLED;
      finish(CheckoutResult(
        ok: false,
        cancelled: cancelled,
        message: cancelled
            ? 'Payment cancelled'
            : (response.message ?? 'Payment failed'),
      ));
    });

    razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET,
        (ExternalWalletResponse response) {
      // The wallet app takes over; the webhook will settle the final state.
      finish(const CheckoutResult(
        ok: false,
        message: 'Continue in your wallet app — we\'ll update once it settles',
      ));
    });

    razorpay.open(<String, dynamic>{
      'key': AppConfig.razorpayKeyId,
      'order_id': orderId,
      'amount': amount, // paise, echoed from the order for display only
      'currency': (order['currency'] as String?) ?? 'INR',
      'name': 'Patient-Tap',
      'description': '${kTiers[tier]!.displayName} · '
          '${cycle == BillingCycle.monthly ? 'Monthly' : 'Yearly'}',
      'timeout': 300,
      'prefill': <String, dynamic>{
        'email': userEmail,
        'name': userName,
        if (userPhone != null && userPhone.isNotEmpty) 'contact': userPhone,
      },
      'theme': <String, dynamic>{'color': '#3ec9a7'},
      'retry': <String, dynamic>{'enabled': true, 'max_count': 2},
    });

    try {
      return await done.future.timeout(
        const Duration(minutes: 10),
        onTimeout: () => const CheckoutResult(
            ok: false, message: 'Checkout timed out'),
      );
    } finally {
      razorpay.clear();
    }
  }

  /// Cancel an active subscription (no auto-renew). Demo: drop to free.
  static Future<CheckoutResult> cancelSubscription() async {
    if (!AppConfig.hasRazorpay) {
      return const CheckoutResult(
        ok: true,
        simulated: true,
        message: 'Subscription cancelled (demo)',
      );
    }
    try {
      final Map<String, dynamic> res = await Db.invoke('razorpay-cancel');
      return CheckoutResult(
        ok: res['ok'] == true,
        message: (res['message'] as String?) ?? 'Subscription cancelled',
      );
    } on BackendException catch (e) {
      return CheckoutResult(ok: false, message: e.message);
    }
  }
}
