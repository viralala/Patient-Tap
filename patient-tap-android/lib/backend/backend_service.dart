// ============================================================================
// High-level backend API — the ONE module UI code talks to.
//
// DUAL MODE (see config/app_config.dart):
//   • Real  — Supabase Auth/Postgres/RLS + Edge Functions + Razorpay.
//   • Demo  — self-contained local persistence + simulated auth/billing, so
//             the app is fully usable before any credentials are supplied.
//
// Medical data stays END-TO-END ENCRYPTED here (core/crypto_service) before it
// ever leaves the device; the server only ever receives ciphertext.
// ============================================================================

import 'dart:async';
import 'dart:convert';

import 'package:google_sign_in/google_sign_in.dart';
import 'package:supabase_flutter/supabase_flutter.dart' as sb;

import '../config/app_config.dart';
import '../core/crypto_service.dart';
import '../core/local_store.dart';
import '../models/patient_profile.dart';
import 'razorpay_service.dart';
import 'supabase_client.dart';

// ---- Shapes ----------------------------------------------------------------

class AppUser {
  const AppUser({
    required this.id,
    required this.email,
    required this.name,
    this.avatarUrl,
  });

  final String id;
  final String email;
  final String name;
  final String? avatarUrl;

  String get initial => name.isNotEmpty ? name[0].toUpperCase() : 'U';
}

class AppSession {
  const AppSession({required this.user});
  final AppUser user;
}

class SubscriptionInfo {
  const SubscriptionInfo({
    this.tier = Tier.free,
    this.status,
    this.currentPeriodEnd,
    this.cancelAtPeriodEnd = false,
  });

  final Tier tier;
  final String? status;
  final DateTime? currentPeriodEnd;
  final bool cancelAtPeriodEnd;

  bool get isPaid => tier != Tier.free;
}

class ShareLink {
  const ShareLink({
    required this.url,
    required this.token,
    required this.expiresAt,
  });

  final String url;
  final String token;
  final DateTime? expiresAt;
}

class AlertOutcome {
  const AlertOutcome({
    required this.ok,
    this.sent = 0,
    this.contacts = 0,
    this.simulated = false,
    this.message,
  });

  final bool ok;
  final int sent;
  final int contacts;
  final bool simulated;
  final String? message;
}

class ScanEvent {
  const ScanEvent({
    required this.at,
    this.responderId,
    this.responderLabel,
    this.lat,
    this.lng,
  });

  final DateTime at;
  final String? responderId;
  final String? responderLabel;
  final double? lat;
  final double? lng;
}

// ============================================================================

class BackendService {
  BackendService._();

  static const AppUser _demoUser = AppUser(
    id: 'demo-user',
    email: 'demo@patient-tap.app',
    name: 'Demo User',
  );

  /// True when the live backend is wired; false → demo mode.
  static bool get isLive => Db.isLive;

  // Demo-mode auth changes have no server to push events, so we fan them out.
  static final StreamController<AppSession?> _demoAuth =
      StreamController<AppSession?>.broadcast();

  // ==========================================================================
  // AUTH
  // ==========================================================================

  static AppUser _mapUser(sb.User u) {
    final Map<String, dynamic> meta = u.userMetadata ?? <String, dynamic>{};
    final String email = u.email ?? '';

    final String? metaName =
        (meta['full_name'] ?? meta['name']) as String?;
    final String fallback =
        email.contains('@') ? email.split('@').first : 'User';

    return AppUser(
      id: u.id,
      email: email,
      name: (metaName != null && metaName.isNotEmpty) ? metaName : fallback,
      avatarUrl: (meta['avatar_url'] ?? meta['picture']) as String?,
    );
  }

  /// Google sign-in.
  ///
  /// Real mode uses the **native** Android account picker (no browser bounce),
  /// then trades the Google ID token for a Supabase session.
  /// Demo mode flips a local session instantly.
  static Future<AppSession?> signInWithGoogle() async {
    if (!Db.isLive) {
      await LocalStore.setDemoSession(jsonEncode(<String, String>{
        'id': _demoUser.id,
        'email': _demoUser.email,
        'name': _demoUser.name,
      }));
      final AppSession s = const AppSession(user: _demoUser);
      _demoAuth.add(s);
      return s;
    }

    if (!AppConfig.hasGoogle) {
      throw const BackendException(
          'Google sign-in is not configured (GOOGLE_SERVER_CLIENT_ID missing)');
    }

    final GoogleSignIn google = GoogleSignIn.instance;
    await google.initialize(
      serverClientId: AppConfig.googleServerClientId,
      clientId: AppConfig.googleAndroidClientId.isEmpty
          ? null
          : AppConfig.googleAndroidClientId,
    );

    final GoogleSignInAccount account = await google.authenticate();
    final String? idToken = account.authentication.idToken;
    if (idToken == null) {
      throw const BackendException('Google did not return an ID token');
    }

    final sb.AuthResponse res = await Db.auth!.signInWithIdToken(
      provider: sb.OAuthProvider.google,
      idToken: idToken,
    );
    final sb.User? u = res.user;
    return u == null ? null : AppSession(user: _mapUser(u));
  }

  static Future<void> signOut() async {
    if (!Db.isLive) {
      await LocalStore.setDemoSession(null);
      _demoAuth.add(null);
      return;
    }
    try {
      await GoogleSignIn.instance.signOut();
    } catch (_) {
      /* not signed in natively — fine */
    }
    await Db.auth!.signOut();
  }

  static Future<AppSession?> getSession() async {
    if (!Db.isLive) {
      final String? raw = LocalStore.demoSession;
      if (raw == null) return null;
      final Map<String, dynamic> j = jsonDecode(raw) as Map<String, dynamic>;
      return AppSession(
        user: AppUser(
          id: j['id'] as String,
          email: j['email'] as String,
          name: j['name'] as String,
        ),
      );
    }
    final sb.User? u = Db.user;
    return u == null ? null : AppSession(user: _mapUser(u));
  }

  /// Emits on every sign-in / sign-out.
  static Stream<AppSession?> authChanges() {
    if (!Db.isLive) return _demoAuth.stream;
    return Db.auth!.onAuthStateChange.map((sb.AuthState s) {
      final sb.User? u = s.session?.user;
      return u == null ? null : AppSession(user: _mapUser(u));
    });
  }

  // ==========================================================================
  // SUBSCRIPTION / BILLING (Razorpay)
  // ==========================================================================

  static Future<SubscriptionInfo> getSubscription() async {
    if (!Db.isLive) {
      final Tier t = TierKey.fromKey(LocalStore.demoTier);
      return SubscriptionInfo(
        tier: t,
        status: t == Tier.free ? null : 'active',
      );
    }
    try {
      final Map<String, dynamic>? row = await Db.client!
          .from('subscriptions')
          .select('tier,status,current_period_end,cancel_at_period_end')
          .maybeSingle();
      if (row == null) return const SubscriptionInfo();
      return SubscriptionInfo(
        tier: TierKey.fromKey(row['tier'] as String?),
        status: row['status'] as String?,
        currentPeriodEnd: row['current_period_end'] == null
            ? null
            : DateTime.tryParse(row['current_period_end'] as String),
        cancelAtPeriodEnd: (row['cancel_at_period_end'] ?? false) as bool,
      );
    } catch (_) {
      return const SubscriptionInfo(); // offline — keep the UI usable
    }
  }

  /// Begin an upgrade. Resolves once payment is verified (or demo-simulated).
  static Future<CheckoutResult> upgrade({
    required Tier tier,
    required BillingCycle cycle,
    required AppSession session,
  }) async {
    final CheckoutResult r = await RazorpayService.checkout(
      tier: tier,
      cycle: cycle,
      userEmail: session.user.email,
      userName: session.user.name,
    );
    if (r.ok && r.simulated) await LocalStore.setDemoTier(tier.key);
    return r;
  }

  static Future<CheckoutResult> cancelSubscription() async {
    final CheckoutResult r = await RazorpayService.cancelSubscription();
    if (r.ok && r.simulated) await LocalStore.setDemoTier('free');
    return r;
  }

  // ==========================================================================
  // E2E CLOUD BACKUP + SYNC
  // ==========================================================================

  /// Encrypt + back up the whole profile. Server stores ciphertext only.
  static Future<bool> saveProfileBackup(PatientProfile profile) async {
    final String ciphertext =
        await CryptoService.encryptBytes(jsonEncode(profile.toJson()));

    if (!Db.isLive) {
      await LocalStore.setDemoBackup(ciphertext);
      return true;
    }
    final String? uid = Db.userId;
    if (uid == null) return false;
    try {
      await Db.client!.from('patient_backups').upsert(<String, dynamic>{
        'user_id': uid,
        'ciphertext': ciphertext,
        'patient_public_id': profile.patientId,
        'version': 2,
      });
      return true;
    } catch (_) {
      return false;
    }
  }

  /// Fetch + decrypt the cloud backup → PatientProfile, or null if none.
  static Future<PatientProfile?> restoreProfileBackup() async {
    String? ciphertext;
    if (!Db.isLive) {
      ciphertext = LocalStore.demoBackup;
    } else {
      try {
        final Map<String, dynamic>? row = await Db.client!
            .from('patient_backups')
            .select('ciphertext')
            .maybeSingle();
        ciphertext = row?['ciphertext'] as String?;
      } catch (_) {
        return null;
      }
    }
    if (ciphertext == null) return null;
    try {
      final String json = await CryptoService.decryptBytes(ciphertext);
      return PatientProfile.fromJson(jsonDecode(json) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  /// Push one treatment-log entry to the cloud (E2E) for multi-device sync.
  static Future<bool> syncLogEntry(
      String patientPublicId, LogEntry entry) async {
    if (!Db.isLive) return true; // demo: nothing to sync to
    final String? uid = Db.userId;
    if (uid == null) return false;
    try {
      await Db.client!.from('treatment_log').insert(<String, dynamic>{
        'patient_owner_id': uid,
        'patient_public_id': patientPublicId,
        'responder_id': entry.responderId,
        'action_ciphertext': await CryptoService.encryptBytes(entry.action),
        'occurred_at': entry.time.toUtc().toIso8601String(),
        'source': 'app',
      });
      return true;
    } catch (_) {
      return false;
    }
  }

  // ==========================================================================
  // EMERGENCY CONTACTS (server-side, opt-in — needed to actually send alerts)
  // ==========================================================================

  static Future<bool> saveEmergencyContacts(List<ContactRef> contacts) async {
    if (!Db.isLive) {
      await LocalStore.setDemoContacts(contacts);
      return true;
    }
    final String? uid = Db.userId;
    if (uid == null) return false;
    try {
      await Db.client!.from('emergency_contacts').delete().eq('user_id', uid);
      if (contacts.isNotEmpty) {
        await Db.client!.from('emergency_contacts').insert(
              contacts
                  .map((ContactRef c) => <String, dynamic>{
                        'user_id': uid,
                        'name': c.name,
                        'phone': c.phone,
                        'email': c.email,
                      })
                  .toList(),
            );
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  // ==========================================================================
  // AUDIT — record a scan/access event (works for anonymous responders)
  // ==========================================================================

  static Future<bool> logScanEvent({
    required String patientPublicId,
    String? responderId,
    String? responderLabel,
    double? lat,
    double? lng,
  }) async {
    if (!Db.isLive) {
      final List<dynamic> arr = LocalStore.demoScans;
      arr.insert(0, <String, dynamic>{
        'patientPublicId': patientPublicId,
        'responderId': responderId,
        'responderLabel': responderLabel,
        'lat': lat,
        'lng': lng,
        'created_at': DateTime.now().toIso8601String(),
      });
      await LocalStore.setDemoScans(arr.take(50).toList());
      return true;
    }
    try {
      await Db.invoke('audit-scan', body: <String, dynamic>{
        'patientPublicId': patientPublicId,
        'responderId': responderId,
        'responderLabel': responderLabel,
        'lat': lat,
        'lng': lng,
      });
      return true;
    } catch (_) {
      return false;
    }
  }

  /// The patient's own access history (chain of custody).
  static Future<List<ScanEvent>> recentScans({int limit = 20}) async {
    if (!Db.isLive) {
      return LocalStore.demoScans.take(limit).map((dynamic e) {
        final Map<String, dynamic> m = e as Map<String, dynamic>;
        return ScanEvent(
          at: DateTime.tryParse(m['created_at'] as String? ?? '') ??
              DateTime.now(),
          responderId: m['responderId'] as String?,
          responderLabel: m['responderLabel'] as String?,
          lat: (m['lat'] as num?)?.toDouble(),
          lng: (m['lng'] as num?)?.toDouble(),
        );
      }).toList();
    }
    try {
      final List<dynamic> rows = await Db.client!
          .from('scan_events')
          .select('responder_id,responder_label,lat,lng,created_at')
          .order('created_at', ascending: false)
          .limit(limit);
      return rows.map((dynamic e) {
        final Map<String, dynamic> m = e as Map<String, dynamic>;
        return ScanEvent(
          at: DateTime.tryParse(m['created_at'] as String? ?? '') ??
              DateTime.now(),
          responderId: m['responder_id'] as String?,
          responderLabel: m['responder_label'] as String?,
          lat: (m['lat'] as num?)?.toDouble(),
          lng: (m['lng'] as num?)?.toDouble(),
        );
      }).toList();
    } catch (_) {
      return <ScanEvent>[];
    }
  }

  // ==========================================================================
  // ALERTS — notify emergency contacts (email/SMS via the Edge Function)
  // ==========================================================================

  static Future<AlertOutcome> notifyEmergencyContacts({
    required String patientPublicId,
    String? patientName,
    required String message,
    double? lat,
    double? lng,
  }) async {
    if (!Db.isLive) {
      return const AlertOutcome(
        ok: true,
        simulated: true,
        message: 'Alert simulated (demo)',
      );
    }
    try {
      final Map<String, dynamic> res =
          await Db.invoke('alerts-notify', body: <String, dynamic>{
        'patientPublicId': patientPublicId,
        'patientName': patientName,
        'message': message,
        'lat': lat,
        'lng': lng,
      });
      return AlertOutcome(
        ok: res['ok'] == true,
        sent: (res['sent'] as num?)?.toInt() ?? 0,
        contacts: (res['contacts'] as num?)?.toInt() ?? 0,
        simulated: res['simulated'] == true,
        message: res['message'] as String?,
      );
    } on BackendException catch (e) {
      return AlertOutcome(ok: false, message: e.message);
    }
  }

  // ==========================================================================
  // SECURE SHARE LINK — revocable, time-limited, E2E (key rides in #fragment)
  // ==========================================================================

  /// Create a share link for a projected emergency card. A fresh random key
  /// encrypts the payload; that key lives ONLY in the URL fragment, so the
  /// server stores ciphertext it can never read.
  static Future<ShareLink?> createShareLink(
    Map<String, dynamic> card, {
    int expiresInHours = 24,
    String label = 'Emergency card',
  }) async {
    final String keyB64 = CryptoService.newShareKeyB64();
    final String ciphertext =
        await CryptoService.encryptWithKeyB64(jsonEncode(card), keyB64);
    final DateTime expiresAt =
        DateTime.now().add(Duration(hours: expiresInHours));

    if (!Db.isLive) {
      // Demo — fully self-contained link (ciphertext + key both in fragment).
      final String frag = '#k=${Uri.encodeComponent(keyB64)}'
          '&d=${Uri.encodeComponent(ciphertext)}';
      return ShareLink(
        url: '${AppConfig.siteUrl}/share/demo$frag',
        token: 'demo',
        expiresAt: expiresAt,
      );
    }

    try {
      final Map<String, dynamic> res =
          await Db.invoke('share-create', body: <String, dynamic>{
        'ciphertext': ciphertext,
        'expiresInHours': expiresInHours,
        'label': label,
      });
      final String? token = res['token'] as String?;
      if (token == null) return null;
      return ShareLink(
        url: '${AppConfig.siteUrl}/share/$token'
            '#k=${Uri.encodeComponent(keyB64)}',
        token: token,
        expiresAt: expiresAt,
      );
    } catch (_) {
      return null;
    }
  }

  /// Revoke a previously issued share link.
  static Future<bool> revokeShareLink(String token) async {
    if (!Db.isLive) return true;
    try {
      await Db.client!
          .from('share_links')
          .update(<String, dynamic>{'revoked': true}).eq('token', token);
      return true;
    } catch (_) {
      return false;
    }
  }
}
