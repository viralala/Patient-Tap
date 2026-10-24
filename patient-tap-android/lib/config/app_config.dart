// ============================================================================
// Central backend configuration + feature flags.
//
// DUAL MODE: when the Supabase / Razorpay values below are empty the app runs
// in a self-contained DEMO mode (local persistence, simulated auth + billing).
// The moment real credentials are supplied it flips to the live backend.
//
// Values come from --dart-define at build time so no secret is ever committed:
//   flutter build apk --dart-define=SUPABASE_URL=https://xxx.supabase.co ...
// See SETUP.md for the full list and how to obtain each one.
// ============================================================================

class AppConfig {
  AppConfig._();

  // ---- Supabase ------------------------------------------------------------
  static const String supabaseUrl = String.fromEnvironment('SUPABASE_URL');
  static const String supabaseAnonKey =
      String.fromEnvironment('SUPABASE_ANON_KEY');

  /// True when a real Supabase project is configured.
  static bool get hasSupabase =>
      supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty;

  // ---- Google sign-in ------------------------------------------------------
  /// OAuth **Web** client id — Supabase validates the ID token against this,
  /// and Android's native sign-in needs it as the `serverClientId`.
  static const String googleServerClientId =
      String.fromEnvironment('GOOGLE_SERVER_CLIENT_ID');

  /// OAuth **Android** client id (optional; usually resolved from the SHA-1
  /// fingerprint registered in the Google Cloud console).
  static const String googleAndroidClientId =
      String.fromEnvironment('GOOGLE_ANDROID_CLIENT_ID');

  static bool get hasGoogle => googleServerClientId.isNotEmpty;

  // ---- Razorpay ------------------------------------------------------------
  /// Publishable key id (`rzp_test_…` / `rzp_live_…`). The *secret* never
  /// ships in the app — orders are created and verified in an Edge Function.
  static const String razorpayKeyId = String.fromEnvironment('RAZORPAY_KEY_ID');

  static bool get hasRazorpay => razorpayKeyId.isNotEmpty && hasSupabase;

  // ---- Public site (share links) -------------------------------------------
  /// Base URL of the public share-link viewer.
  static const String siteUrl = String.fromEnvironment(
    'SITE_URL',
    defaultValue: 'https://patient-tap.app',
  );

  /// True when every live integration is wired.
  static bool get isLive => hasSupabase;

  /// Human-readable summary for the Settings screen.
  static String get modeLabel => isLive ? 'Live backend' : 'Demo mode';
}

// ============================================================================
// Subscription tiers (prices in INR — Razorpay is an Indian gateway)
// ============================================================================

enum Tier { free, pro, clinic }

enum BillingCycle { monthly, yearly }

extension TierKey on Tier {
  String get key => name;

  static Tier fromKey(String? k) {
    switch (k) {
      case 'pro':
        return Tier.pro;
      case 'clinic':
        return Tier.clinic;
      default:
        return Tier.free;
    }
  }
}

class TierMeta {
  const TierMeta({
    required this.tier,
    required this.displayName,
    required this.blurb,
    required this.monthlyInr,
    required this.yearlyInr,
    required this.features,
  });

  final Tier tier;
  final String displayName;
  final String blurb;

  /// Rupees (not paise). Converted to paise when the order is created.
  final int monthlyInr;
  final int yearlyInr;
  final List<String> features;

  int priceFor(BillingCycle cycle) =>
      cycle == BillingCycle.monthly ? monthlyInr : yearlyInr;
}

const Map<Tier, TierMeta> kTiers = <Tier, TierMeta>{
  Tier.free: TierMeta(
    tier: Tier.free,
    displayName: 'Freemium',
    blurb: 'Your medical card, on-device and encrypted.',
    monthlyInr: 0,
    yearlyInr: 0,
    features: <String>[
      'Encrypted on-device profile',
      'Write to NFC tag',
      'Responder scan & decrypt',
      'Local medication reminders',
    ],
  ),
  Tier.pro: TierMeta(
    tier: Tier.pro,
    displayName: 'Premium',
    blurb: 'Cloud backup, sync & emergency alerts.',
    monthlyInr: 999,
    yearlyInr: 10789, // 999 x 12 x 0.9
    features: <String>[
      'Everything in Freemium',
      'E2E-encrypted cloud backup & multi-device sync',
      'Emergency-contact alerts on scan',
      'Secure shareable emergency link',
      'Access / chain-of-custody audit log',
    ],
  ),
  Tier.clinic: TierMeta(
    tier: Tier.clinic,
    displayName: 'B2B / Clinic',
    blurb: 'For hospitals, clinics & responder teams.',
    monthlyInr: 1999,
    yearlyInr: 21589, // 1999 x 12 x 0.9
    features: <String>[
      'Everything in Premium',
      'Verified responder accounts',
      'Team audit dashboard',
      'Bulk NTAG215 provisioning',
      'Priority support & SLA',
    ],
  ),
};

const List<Tier> kTierOrder = <Tier>[Tier.free, Tier.pro, Tier.clinic];

int tierRank(Tier t) => kTierOrder.indexOf(t);

// ============================================================================
// Platform facts (this build is the Android read/write target)
// ============================================================================
const String kPlatformLabel = 'Android';

/// Android is the full read **and** write platform for NTAG215 (PRD §7).
const bool kCanWriteTag = true;

/// Largest NDEF message an NTAG215 can hold — the ceiling for a tag write.
/// The chip has 504 bytes of user memory, but its capability container
/// declares a 496-byte NDEF data area, and the NDEF TLV wrapper takes 4 of
/// those (1 tag byte + 3-byte length once the message passes 254 bytes).
const int kTagLimitBytes = 492;

/// MIME type of the Patient-Tap NDEF record written to the card.
const String kTagMimeType = 'application/x-patient-tap';
