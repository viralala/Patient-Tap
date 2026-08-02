// ============================================================================
// Emergency-contact alert (F12) — real GPS fix + SMS hand-off.
//
// Android will not let an app send an SMS silently without the (Play-Store
// restricted) SEND_SMS permission, so we do what a responsible app does:
// capture a genuine high-accuracy GPS fix, compose the exact message, and open
// the device SMS app pre-filled so the responder sends it with one tap.
// Server-side alerting to the patient's own contacts (email/SMS via the Edge
// Function) runs in parallel — see backend/backend_service.dart.
// ============================================================================

import 'package:geolocator/geolocator.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/patient_profile.dart';

class GeoFix {
  const GeoFix({required this.lat, required this.lng, this.accuracy});
  final double lat;
  final double lng;
  final double? accuracy;

  String get mapsUrl =>
      'https://maps.google.com/?q=${lat.toStringAsFixed(5)},${lng.toStringAsFixed(5)}';
}

class AlertResult {
  const AlertResult({
    required this.contact,
    required this.body,
    required this.sentAt,
    this.fix,
  });

  final ContactRef contact;
  final String body;
  final DateTime sentAt;
  final GeoFix? fix;

  String? get mapsUrl => fix?.mapsUrl;
}

class AlertService {
  AlertService._();

  /// Request location permission and take a real fix. Returns null if the user
  /// denies permission, location services are off, or the fix times out.
  static Future<GeoFix?> getLocation({
    Duration timeout = const Duration(seconds: 8),
  }) async {
    try {
      if (!await Geolocator.isLocationServiceEnabled()) return null;

      LocationPermission perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) {
        perm = await Geolocator.requestPermission();
      }
      if (perm == LocationPermission.denied ||
          perm == LocationPermission.deniedForever) {
        return null;
      }

      final Position pos = await Geolocator.getCurrentPosition(
        locationSettings: AndroidSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: timeout,
        ),
      );
      return GeoFix(
        lat: pos.latitude,
        lng: pos.longitude,
        accuracy: pos.accuracy,
      );
    } catch (_) {
      return null;
    }
  }

  static String composeBody(String patientName, GeoFix? fix) {
    final String who = patientName.trim().isEmpty ? 'A patient' : patientName;
    final String where = fix != null
        ? ' Location: ${fix.mapsUrl}'
        : ' Location unavailable.';
    return "PATIENT-TAP ALERT: $who's emergency tag was just scanned by a "
        'first responder.$where';
  }

  /// Build the alert for a contact, taking a GPS fix along the way.
  static Future<AlertResult> prepare(
    ContactRef contact,
    String patientName,
  ) async {
    final GeoFix? fix = await getLocation();
    return AlertResult(
      contact: contact,
      body: composeBody(patientName, fix),
      sentAt: DateTime.now(),
      fix: fix,
    );
  }

  // ---- Hand-offs -----------------------------------------------------------

  static String _digits(String phone) => phone.replaceAll(RegExp(r'[^\d+]'), '');

  /// Open the SMS app with the recipient and body pre-filled.
  static Future<bool> openSms(String phone, String body) => _launch(
        Uri(
          scheme: 'sms',
          path: _digits(phone),
          queryParameters: <String, String>{'body': body},
        ),
      );

  /// Place a call to an emergency contact.
  static Future<bool> openDialer(String phone) =>
      _launch(Uri(scheme: 'tel', path: _digits(phone)));

  static Future<bool> openMaps(GeoFix fix) =>
      _launch(Uri.parse(fix.mapsUrl), external: true);

  static Future<bool> openUrl(String url) =>
      _launch(Uri.parse(url), external: true);

  static Future<bool> _launch(Uri uri, {bool external = false}) async {
    try {
      if (!await canLaunchUrl(uri)) return false;
      return await launchUrl(
        uri,
        mode: external
            ? LaunchMode.externalApplication
            : LaunchMode.externalNonBrowserApplication,
      );
    } catch (_) {
      return false;
    }
  }
}
