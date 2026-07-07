import '../models/contact_ref.dart';
import '../models/geo_location.dart';

/// STUB opportunistic-alert layer.
///
/// TODO: replace with real implementation from Alerts/Demo dev.
///   - detect connectivity, if online send SMS with GPS deep-link
///   - otherwise queue and retry when signal returns
class AlertService {
  const AlertService();

  static const Duration _latency = Duration(milliseconds: 500);

  /// Fire an SMS alert to [contact] with the patient's [location].
  ///
  /// Non-blocking by design: the responder UI shows a toast and moves on; it
  /// never waits on delivery. Mock just logs and resolves.
  Future<void> sendAlert(ContactRef contact, GeoLocation location) async {
    // TODO: replace with real implementation from Alerts/Demo dev.
    await Future.delayed(_latency);
    // ignore: avoid_print
    print(
      '[alert_service] (mock) SMS -> ${contact.name} <${contact.phone}> '
      'with location ${location.pretty}',
    );
  }
}
