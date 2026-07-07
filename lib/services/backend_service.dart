import '../models/log_entry.dart';
import '../models/patient_profile.dart';

/// Subscription tier (Stripe-backed in the real app).
enum SubscriptionTier { free, pro, clinic }

extension SubscriptionTierLabel on SubscriptionTier {
  String get label {
    switch (this) {
      case SubscriptionTier.free:
        return 'Free';
      case SubscriptionTier.pro:
        return 'Pro';
      case SubscriptionTier.clinic:
        return 'Clinic';
    }
  }
}

/// STUB cloud layer (Supabase accounts/backup/sync + Stripe subscriptions).
///
/// TODO: replace with real implementation from Alerts/Demo dev.
///   - Supabase client for saveProfileBackup / syncLogEntry
///   - Stripe subscription status for getSubscriptionStatus
/// All calls currently return mock success so the UI's online/synced states
/// can be built without a real backend.
class BackendService {
  const BackendService();

  static const Duration _latency = Duration(milliseconds: 450);

  /// Back up the encrypted profile to the cloud (opportunistic). Returns true
  /// on success. Mock always succeeds.
  Future<bool> saveProfileBackup(PatientProfile profile) async {
    // TODO: replace with real implementation from Alerts/Demo dev.
    await Future.delayed(_latency);
    return true;
  }

  /// Current subscription tier for the signed-in account. Mock: Pro.
  Future<SubscriptionTier> getSubscriptionStatus() async {
    // TODO: replace with real implementation from Alerts/Demo dev.
    await Future.delayed(_latency);
    return SubscriptionTier.pro;
  }

  /// Push a single treatment-log entry to the cloud for multi-device sync.
  /// Returns true on success. Mock always succeeds.
  Future<bool> syncLogEntry(String patientId, LogEntry entry) async {
    // TODO: replace with real implementation from Alerts/Demo dev.
    await Future.delayed(_latency);
    return true;
  }
}
