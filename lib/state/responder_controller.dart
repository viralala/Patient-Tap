import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';

import '../models/geo_location.dart';
import '../models/log_entry.dart';
import '../models/patient_profile.dart';
import '../services/alert_service.dart';
import '../services/backend_service.dart';
import '../services/crypto_service.dart';
import '../services/mock_data.dart';
import '../services/nfc_service.dart';

/// Status of the responder scan flow.
enum ScanStatus {
  idle,
  scanning,
  decrypting,
  success,
  noTag, // read returned null
  tampered, // decrypt auth-tag failure
}

/// Status of saving a new treatment-log entry back to the tag.
enum LogWriteStatus { idle, saving, success, error }

/// Owns Responder-mode data: the scan lifecycle, the decrypted profile, the
/// opportunistic alert banner, and appending treatment-log entries.
class ResponderController extends ChangeNotifier {
  ResponderController({
    CryptoService? crypto,
    NfcService? nfc,
    AlertService? alert,
    BackendService? backend,
    bool seedScanned = false,
  })  : _crypto = crypto ?? const CryptoService(),
        _nfc = nfc ?? NfcService(),
        _alert = alert ?? const AlertService(),
        _backend = backend ?? const BackendService() {
    if (seedScanned) {
      // Demo/screenshot hook: start with a patient already scanned in.
      final demo = MockData.scannedPatient();
      _profile = demo;
      _rawBytes = Uint8List.fromList(utf8.encode(jsonEncode(demo.toMap())));
      _scanStatus = ScanStatus.success;
    }
  }

  final CryptoService _crypto;
  final NfcService _nfc;
  final AlertService _alert;
  final BackendService _backend;

  ScanStatus _scanStatus = ScanStatus.idle;
  PatientProfile? _profile;
  Uint8List? _rawBytes; // last-read encrypted blob (for append/re-write)
  String? _scanErrorMessage;

  bool _alertSent = false; // drives the non-blocking "contact alerted" banner
  String? _alertedContactName;

  LogWriteStatus _logWriteStatus = LogWriteStatus.idle;
  String? _logWriteError;

  ScanStatus get scanStatus => _scanStatus;
  PatientProfile? get profile => _profile;
  String? get scanErrorMessage => _scanErrorMessage;
  bool get hasProfile => _profile != null;

  bool get alertSent => _alertSent;
  String? get alertedContactName => _alertedContactName;

  LogWriteStatus get logWriteStatus => _logWriteStatus;
  String? get logWriteError => _logWriteError;

  // --- Scan ------------------------------------------------------------------

  /// Tap-to-scan: read the tag, decrypt it, and — if a record came back —
  /// fire an opportunistic alert to the first emergency contact (non-blocking).
  Future<void> scan() async {
    _resetAlert();
    _scanErrorMessage = null;
    _setScan(ScanStatus.scanning);

    final Uint8List? bytes = await _nfc.readFromTag();
    if (bytes == null) {
      _scanErrorMessage =
          'No tag detected. Hold the phone flat against the wristband.';
      _setScan(ScanStatus.noTag);
      return;
    }

    _setScan(ScanStatus.decrypting);
    final result = await _crypto.decryptProfile(bytes);

    if (result.tampered || result.profile == null) {
      _scanErrorMessage =
          'Record failed integrity check — data may be tampered or corrupt.';
      _setScan(ScanStatus.tampered);
      return;
    }

    _rawBytes = bytes;
    _profile = result.profile;
    _setScan(ScanStatus.success);

    // Opportunistic alert — fire and forget, responder never waits on it.
    unawaited(_maybeAlertContacts());
  }

  Future<void> _maybeAlertContacts() async {
    final p = _profile;
    if (p == null || p.emergencyContacts.isEmpty) return;
    final contact = p.emergencyContacts.first;
    final GeoLocation location = MockData.demoLocation();
    await _alert.sendAlert(contact, location);
    _alertSent = true;
    _alertedContactName = contact.name;
    notifyListeners();
  }

  /// Called by the UI once the alert banner has been shown, so it doesn't
  /// re-appear on rebuilds.
  void acknowledgeAlert() {
    _alertSent = false;
    notifyListeners();
  }

  void resetScan() {
    _profile = null;
    _rawBytes = null;
    _scanErrorMessage = null;
    _resetAlert();
    _setScan(ScanStatus.idle);
  }

  // --- Append treatment-log entry -------------------------------------------

  /// Append [entry] to the decrypted record, re-encrypt, and re-write the tag.
  /// Also syncs the entry to the cloud (best-effort).
  Future<void> saveLogEntry(LogEntry entry) async {
    final base = _rawBytes;
    final current = _profile;
    if (base == null || current == null) {
      _logWriteError = 'No active record. Scan a tag first.';
      _setLogWrite(LogWriteStatus.error);
      return;
    }

    _logWriteError = null;
    _setLogWrite(LogWriteStatus.saving);

    // 1) crypto: append into a new encrypted blob
    final Uint8List newBytes = await _crypto.appendLogEntry(base, entry);

    // 2) nfc: re-write the tag
    final writeResult = await _nfc.writeToTag(newBytes);
    if (!writeResult.ok) {
      _logWriteError = writeResult.error?.message ?? 'Re-write failed.';
      _setLogWrite(LogWriteStatus.error);
      return;
    }

    // 3) update in-memory record + cloud sync (best-effort)
    _rawBytes = newBytes;
    _profile = current.copyWith(
      treatmentLog: [...current.treatmentLog, entry],
      updatedAt: DateTime.now(),
    );
    unawaited(_backend.syncLogEntry(current.patientId, entry));

    _setLogWrite(LogWriteStatus.success);
  }

  void resetLogWrite() => _setLogWrite(LogWriteStatus.idle);

  // --- internal --------------------------------------------------------------

  void _resetAlert() {
    _alertSent = false;
    _alertedContactName = null;
  }

  void _setScan(ScanStatus status) {
    _scanStatus = status;
    notifyListeners();
  }

  void _setLogWrite(LogWriteStatus status) {
    _logWriteStatus = status;
    notifyListeners();
  }
}
