import 'dart:convert';
import 'dart:typed_data';

import '../models/log_entry.dart';
import '../models/patient_profile.dart';

/// Outcome of a decrypt attempt.
///
/// The real crypto layer uses AES-256-GCM; a failed GCM auth tag means the
/// bytes were tampered with (or corrupted). We surface that explicitly instead
/// of a bare null so the responder UI can show a distinct "tampered" error.
class DecryptResult {
  const DecryptResult({this.profile, this.tampered = false});

  final PatientProfile? profile;
  final bool tampered;

  bool get ok => profile != null && !tampered;

  static const DecryptResult tamperedResult =
      DecryptResult(profile: null, tampered: true);
}

/// STUB crypto layer.
///
/// TODO: replace with real implementation from Backend/Crypto dev.
///   - protobuf serialization of PatientProfile
///   - AES-256-GCM encrypt/decrypt (key from device/keystore)
/// The function signatures below are the integration contract. Keep them
/// stable and the screens won't need to change.
class CryptoService {
  const CryptoService();

  static const Duration _latency = Duration(milliseconds: 350);

  /// Serialize + "encrypt" a profile into tag-ready bytes.
  ///
  /// Mock: JSON-encodes the profile map to UTF-8. Real impl will protobuf +
  /// AES-256-GCM and return the ciphertext (nonce ‖ ct ‖ tag).
  Future<Uint8List> encryptProfile(PatientProfile profile) async {
    // TODO: replace with real implementation from Backend/Crypto dev.
    await Future.delayed(_latency);
    final json = jsonEncode(profile.toMap());
    return Uint8List.fromList(utf8.encode(json));
  }

  /// Decrypt + deserialize tag bytes back into a profile.
  ///
  /// Mock: parses the JSON we wrote in [encryptProfile]. If the bytes don't
  /// parse (corrupt / tampered), returns [DecryptResult.tamperedResult] to
  /// mimic an AES-GCM auth-tag failure.
  Future<DecryptResult> decryptProfile(Uint8List bytes) async {
    // TODO: replace with real implementation from Backend/Crypto dev.
    await Future.delayed(_latency);
    try {
      final map = jsonDecode(utf8.decode(bytes)) as Map<String, dynamic>;
      return DecryptResult(profile: PatientProfile.fromMap(map));
    } catch (_) {
      return DecryptResult.tamperedResult;
    }
  }

  /// Append a new [LogEntry] to an already-encrypted blob and return the new
  /// blob. Real impl decrypts, appends to the protobuf repeated field,
  /// re-encrypts. Mock: round-trips through JSON.
  Future<Uint8List> appendLogEntry(
    Uint8List existingBytes,
    LogEntry entry,
  ) async {
    // TODO: replace with real implementation from Backend/Crypto dev.
    await Future.delayed(_latency);
    final decoded = await decryptProfile(existingBytes);
    final profile = decoded.profile;
    if (profile == null) {
      // Nothing valid to append to — return input unchanged.
      return existingBytes;
    }
    final updated = profile.copyWith(
      treatmentLog: [...profile.treatmentLog, entry],
      updatedAt: DateTime.now(),
    );
    return encryptProfile(updated);
  }
}
