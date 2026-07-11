import 'dart:typed_data';

import 'package:cryptography/cryptography.dart';

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

/// Phase 2 (Crypto Layer) crypto service.
///
/// Wraps the Phase 1 protobuf bytes (see [PatientProfile.toProtoBytes] /
/// [PatientProfile.fromProtoBytes]) in AES-256-GCM authenticated encryption
/// before they're written to (or read from) the NFC tag.
///
/// On-tag payload layout (everything after the version byte is
/// produced/consumed by the `cryptography` package's [AesGcm]
/// implementation):
///
/// ```
/// byte 0        : version tag (0x01)
/// bytes 1..12   : 12-byte random nonce (GCM IV)
/// bytes 13..N-16: ciphertext (same length as the plaintext protobuf bytes)
/// bytes N-16..N : 16-byte GCM authentication tag
/// ```
///
/// The version byte lets this format evolve later (e.g. a KDF change or a
/// different AEAD) without breaking the ability to at least recognize old
/// payloads.
///
/// Key management: this class is handed (or lazily generates) a single
/// symmetric [SecretKey] shared between the patient's write flow and any
/// responder's read flow — the same way the physical NFC tag itself is the
/// shared secret carrier in this system. Wiring that key to a real per-device
/// secure keystore / provisioning flow is a separate concern from the AEAD
/// implementation itself and is intentionally kept out of this file; see
/// [CryptoService.withKey] for how a caller would inject a real key.
class CryptoService {
  /// Creates a crypto service using an in-memory demo key.
  ///
  /// This constructor exists so the public API (`const CryptoService()`)
  /// used by `nfc_service.dart`, `responder_controller.dart`, and
  /// `patient_controller.dart` keeps working unchanged. In a real deployment
  /// the key would come from secure storage / device provisioning; see
  /// [CryptoService.withKey].
  const CryptoService() : _injectedKeyBytes = null;

  /// Creates a crypto service backed by an explicit 32-byte AES-256 key.
  ///
  /// Intended for tests and for a future integration point where the key is
  /// sourced from secure device storage rather than the in-memory demo key.
  const CryptoService.withKey(List<int> keyBytes)
      : _injectedKeyBytes = keyBytes;

  final List<int>? _injectedKeyBytes;

  static final AesGcm _algorithm = AesGcm.with256bits();

  /// Current on-tag payload format version.
  static const int _version = 0x01;

  /// GCM nonce length in bytes (96-bit, the standard/recommended IV size).
  static const int _nonceLength = 12;

  /// GCM authentication tag length in bytes.
  static const int _macLength = 16;

  /// Lazily-generated, process-wide demo key.
  ///
  /// All [CryptoService] instances created via the default constructor share
  /// this key so that a profile encrypted during "Write to Tag" (patient
  /// flow) can be decrypted during "Scan" (responder flow) within the same
  /// app run, without requiring a real key-exchange / provisioning system
  /// that's out of scope for this phase.
  static SecretKey? _demoKey;

  Future<SecretKey> _resolveKey() async {
    final injected = _injectedKeyBytes;
    if (injected != null) {
      return SecretKey(injected);
    }
    final existing = _demoKey;
    if (existing != null) return existing;
    final generated = await _algorithm.newSecretKey();
    _demoKey = generated;
    return generated;
  }

  /// Serialize + encrypt a profile into tag-ready bytes.
  ///
  /// Protobuf-encodes [profile] (see [PatientProfile.toProtoBytes]), then
  /// AES-256-GCM encrypts it with a freshly generated random nonce. Returns
  /// `version ‖ nonce ‖ ciphertext ‖ tag`.
  Future<Uint8List> encryptProfile(PatientProfile profile) async {
    final plaintext = profile.toProtoBytes();
    final key = await _resolveKey();
    final nonce = _algorithm.newNonce();

    final box = await _algorithm.encrypt(
      plaintext,
      secretKey: key,
      nonce: nonce,
    );

    final out = BytesBuilder(copy: false);
    out.addByte(_version);
    out.add(box.nonce);
    out.add(box.cipherText);
    out.add(box.mac.bytes);
    return out.toBytes();
  }

  /// Decrypt + deserialize tag bytes back into a profile.
  ///
  /// Verifies the GCM authentication tag before attempting to parse the
  /// protobuf payload. Any failure — wrong version byte, too-short payload,
  /// a bad auth tag, or a plaintext that doesn't parse as the expected
  /// protobuf schema — is treated as tampering/corruption and reported via
  /// [DecryptResult.tamperedResult] rather than throwing.
  Future<DecryptResult> decryptProfile(Uint8List bytes) async {
    try {
      final plaintext = await _decryptToBytes(bytes);
      if (plaintext == null) return DecryptResult.tamperedResult;
      return DecryptResult(profile: PatientProfile.fromProtoBytes(plaintext));
    } catch (_) {
      return DecryptResult.tamperedResult;
    }
  }

  /// Core AEAD decrypt: parses the `version ‖ nonce ‖ ciphertext ‖ tag`
  /// layout, verifies the tag, and returns the recovered plaintext protobuf
  /// bytes — or `null` if the payload is malformed or fails authentication.
  Future<Uint8List?> _decryptToBytes(Uint8List bytes) async {
    final minLength = 1 + _nonceLength + _macLength;
    if (bytes.length < minLength) return null;
    if (bytes[0] != _version) return null;

    final nonce = bytes.sublist(1, 1 + _nonceLength);
    final cipherText = bytes.sublist(
      1 + _nonceLength,
      bytes.length - _macLength,
    );
    final macBytes = bytes.sublist(bytes.length - _macLength);

    final key = await _resolveKey();
    final box = SecretBox(cipherText, nonce: nonce, mac: Mac(macBytes));

    try {
      final plaintext = await _algorithm.decrypt(box, secretKey: key);
      return Uint8List.fromList(plaintext);
    } on SecretBoxAuthenticationError {
      // GCM tag mismatch — corrupted or tampered payload.
      return null;
    }
  }

  /// Append a new [LogEntry] to an already-encrypted blob and return the new
  /// encrypted blob.
  ///
  /// Decrypts [existingBytes], verifying its auth tag; appends [entry] to the
  /// protobuf repeated `treatment_log` field; then re-encrypts with a brand
  /// new random nonce (nonces are never reused across encryptions, which is
  /// required for GCM's security guarantees).
  Future<Uint8List> appendLogEntry(
    Uint8List existingBytes,
    LogEntry entry,
  ) async {
    final decoded = await decryptProfile(existingBytes);
    final profile = decoded.profile;
    if (profile == null) {
      // Nothing valid to append to (tampered/corrupt) — return input
      // unchanged; callers should already be checking `decoded.tampered`
      // via decryptProfile before reaching this path in normal use.
      return existingBytes;
    }
    final updated = profile.copyWith(
      treatmentLog: [...profile.treatmentLog, entry],
      updatedAt: DateTime.now(),
    );
    return encryptProfile(updated);
  }
}
