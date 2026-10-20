// Local persistence + compact serialization for the tag payload.
// Offline-first (PRD §7): everything lives in SharedPreferences, no network.

import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../config/app_config.dart';
import '../models/patient_profile.dart';
import 'crypto_service.dart';

class AuthRecord {
  const AuthRecord({required this.salt, required this.hash});
  final String salt;
  final String hash;
}

class LocalStore {
  LocalStore._();

  static const String _kProfile = 'patienttap.profile';
  static const String _kAuth = 'patienttap.auth'; // {salt,hash} — never the PIN
  static const String _kTag = 'patienttap.tag'; // last payload we wrote/read
  static const String _kCloudPref = 'patienttap.pref.cloudBackup';
  static const String _kAlertsPref = 'patienttap.pref.alerts';
  static const String _kDemoSession = 'patienttap.demo.session';
  static const String _kDemoTier = 'patienttap.demo.tier';
  static const String _kDemoBackup = 'patienttap.demo.backup';
  static const String _kDemoScans = 'patienttap.demo.scans';
  static const String _kDemoContacts = 'patienttap.demo.contacts';

  static late SharedPreferences _prefs;

  /// Must be awaited once during bootstrap, before anything reads the store.
  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  static Map<String, dynamic>? _decodeMap(String? raw) {
    if (raw == null || raw.isEmpty) return null;
    try {
      final Object? v = jsonDecode(raw);
      return v is Map<String, dynamic> ? v : null;
    } catch (_) {
      return null;
    }
  }

  // ---- Profile -------------------------------------------------------------
  static PatientProfile loadProfile() {
    final Map<String, dynamic>? j = _decodeMap(_prefs.getString(_kProfile));
    return j == null ? emptyProfile() : PatientProfile.fromJson(j);
  }

  static Future<void> saveProfile(PatientProfile p) =>
      _prefs.setString(_kProfile, jsonEncode(p.toJson()));

  // ---- Auth (PIN) ----------------------------------------------------------
  static AuthRecord? loadAuth() {
    final Map<String, dynamic>? j = _decodeMap(_prefs.getString(_kAuth));
    if (j == null) return null;
    return AuthRecord(
      salt: (j['salt'] ?? '') as String,
      hash: (j['hash'] ?? '') as String,
    );
  }

  static Future<void> saveAuth(AuthRecord rec) => _prefs.setString(
      _kAuth, jsonEncode(<String, String>{'salt': rec.salt, 'hash': rec.hash}));

  static bool hasPin() => loadAuth() != null;

  static Future<void> clearAuth() => _prefs.remove(_kAuth);

  // ---- Last-known tag payload ---------------------------------------------
  // The physical NTAG215 is the source of truth. This mirror lets the app show
  // "tag synced" state and lets Responder mode work in a no-NFC fallback.
  static String? readTagRaw() => _prefs.getString(_kTag);

  static Future<void> writeTagRaw(String b64) => _prefs.setString(_kTag, b64);

  static Future<void> clearTag() => _prefs.remove(_kTag);

  static bool tagIsSetUp() => readTagRaw() != null;

  // ---- Preferences ---------------------------------------------------------
  static bool get cloudBackup => _prefs.getBool(_kCloudPref) ?? false;
  static Future<void> setCloudBackup(bool v) => _prefs.setBool(_kCloudPref, v);

  static bool get alertsEnabled => _prefs.getBool(_kAlertsPref) ?? false;
  static Future<void> setAlertsEnabled(bool v) =>
      _prefs.setBool(_kAlertsPref, v);

  // ---- Demo-mode backend mirrors ------------------------------------------
  static String? get demoSession => _prefs.getString(_kDemoSession);
  static Future<void> setDemoSession(String? v) => v == null
      ? _prefs.remove(_kDemoSession)
      : _prefs.setString(_kDemoSession, v);

  static String get demoTier => _prefs.getString(_kDemoTier) ?? 'free';
  static Future<void> setDemoTier(String v) => _prefs.setString(_kDemoTier, v);

  static String? get demoBackup => _prefs.getString(_kDemoBackup);
  static Future<void> setDemoBackup(String v) =>
      _prefs.setString(_kDemoBackup, v);

  static List<dynamic> get demoScans {
    final String? raw = _prefs.getString(_kDemoScans);
    if (raw == null) return <dynamic>[];
    try {
      return jsonDecode(raw) as List<dynamic>;
    } catch (_) {
      return <dynamic>[];
    }
  }

  static Future<void> setDemoScans(List<dynamic> v) =>
      _prefs.setString(_kDemoScans, jsonEncode(v));

  static Future<void> setDemoContacts(List<ContactRef> v) => _prefs.setString(
      _kDemoContacts,
      jsonEncode(v.map((ContactRef c) => c.toJson()).toList()));
}

// ===========================================================================
// Tag payload projection
// ===========================================================================

/// Compact projection of a profile down to only the selected categories.
/// Short keys keep the JSON small so more fits on the tag.
Map<String, dynamic> projectForWrite(PatientProfile p, WriteSelection sel) {
  final Map<String, dynamic> out = <String, dynamic>{'v': 2};
  if (sel.basic) {
    out['id'] = p.patientId;
    out['n'] = p.name;
    out['bt'] = p.bloodType;
  }
  if (sel.allergies) out['a'] = p.allergies;
  if (sel.medications) {
    out['m'] = p.medications
        .map((MedEntry m) => <String>[m.name, m.dose, m.frequency])
        .toList();
  }
  if (sel.dnr) out['dnr'] = p.dnrFlag ? 1 : 0;
  if (sel.contacts) {
    out['c'] = p.emergencyContacts
        .map((ContactRef c) => <String>[c.name, c.phone])
        .toList();
  }
  if (sel.log) {
    out['l'] = p.treatmentLog
        .map((LogEntry e) =>
            <dynamic>[e.timestamp, e.responderId, e.action])
        .toList();
  }
  return out;
}

String serializeForWrite(PatientProfile p, WriteSelection sel) =>
    jsonEncode(projectForWrite(p, sel));

/// Bytes of the NDEF message written for an encrypted payload of
/// [binaryLen] bytes. The card stores the payload as base64 text inside one
/// MIME record, so this is what has to fit — not the raw binary size.
int ndefMessageSize(int binaryLen) {
  final int payload = 4 * ((binaryLen + 2) ~/ 3); // padded base64
  final int type = utf8.encode(kTagMimeType).length;
  // Header byte + type length + payload length (1 byte for a short record,
  // 4 once the payload passes 255 bytes).
  final int header = 1 + 1 + (payload > 255 ? 4 : 1);
  return header + type + payload;
}

/// Live on-tag size for the current selection (F4.4 budget meter).
int estimateWriteSize(PatientProfile p, WriteSelection sel) =>
    ndefMessageSize(CryptoService.encryptedSize(serializeForWrite(p, sel)));

/// Rebuild a partial PatientProfile from a decrypted tag payload.
PatientProfile deserializeFromTag(String jsonStr) {
  Map<String, dynamic> o;
  try {
    final Object? v = jsonDecode(jsonStr);
    o = v is Map<String, dynamic> ? v : <String, dynamic>{};
  } catch (_) {
    o = <String, dynamic>{};
  }

  final PatientProfile p = emptyProfile();
  if (o['id'] != null) p.patientId = o['id'].toString();
  if (o['n'] != null) p.name = o['n'].toString();
  if (o['bt'] != null) p.bloodType = o['bt'].toString();

  if (o['a'] is List) {
    p.allergies =
        (o['a'] as List<dynamic>).map((dynamic e) => e.toString()).toList();
  }
  if (o['m'] is List) {
    p.medications = (o['m'] as List<dynamic>).map((dynamic e) {
      final List<dynamic> x = e as List<dynamic>;
      return MedEntry(
        name: x.isNotEmpty ? x[0].toString() : '',
        dose: x.length > 1 ? x[1].toString() : '',
        frequency: x.length > 2 ? x[2].toString() : '',
      );
    }).toList();
  }
  if (o['dnr'] != null) p.dnrFlag = o['dnr'] == 1 || o['dnr'] == true;
  if (o['c'] is List) {
    p.emergencyContacts = (o['c'] as List<dynamic>).map((dynamic e) {
      final List<dynamic> x = e as List<dynamic>;
      return ContactRef(
        name: x.isNotEmpty ? x[0].toString() : '',
        phone: x.length > 1 ? x[1].toString() : '',
      );
    }).toList();
  }
  if (o['l'] is List) {
    p.treatmentLog = (o['l'] as List<dynamic>).map((dynamic e) {
      final List<dynamic> x = e as List<dynamic>;
      return LogEntry(
        timestamp: x.isNotEmpty && x[0] is int
            ? x[0] as int
            : DateTime.now().millisecondsSinceEpoch,
        responderId: x.length > 1 ? x[1].toString() : '',
        action: x.length > 2 ? x[2].toString() : '',
      );
    }).toList();
  }
  return p;
}

/// Convenience re-export so screens don't need to import app_config for this.
const int tagLimitBytes = kTagLimitBytes;
