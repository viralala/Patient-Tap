// ============================================================================
// Real cryptography — AES-256-GCM + salted SHA-256 PIN hashing.
//
// PRD §6.6 F13/F14 + §7 Security:
//   - Profile data is AES-256-GCM encrypted before it is written to the tag.
//   - Tamper / corruption is detected via the GCM auth tag (decrypt throws).
//   - The PIN is never stored in plaintext — we store a salted SHA-256 hash.
//
// WIRE FORMAT — deliberately byte-identical to the Web Crypto build so a tag
// written by the Next.js app decrypts here and vice-versa:
//
//     base64( iv[12] || ciphertext || tag[16] )
//
// Honest demo note: a production system would seal the AES key in the Android
// Keystore and solve responder-side key distribution properly. For a single-app
// demo where the same app plays both patient and responder, we derive one stable
// 256-bit "shared responder key" so any scan can decrypt any tag written here.
// ============================================================================

import 'dart:convert';
import 'dart:math';
import 'dart:typed_data';

import 'package:crypto/crypto.dart' as c;
import 'package:cryptography/cryptography.dart';

/// Thrown when a payload fails its GCM authentication check.
class TamperException implements Exception {
  const TamperException([this.message = 'Data could not be verified']);
  final String message;
  @override
  String toString() => 'TamperException: $message';
}

class CryptoService {
  CryptoService._();

  static final AesGcm _aes = AesGcm.with256bits();
  static final Random _rng = Random.secure();

  /// Fixed seed → the shared responder key. Constant on purpose (see header).
  static const String _sharedKeySeed =
      'patient-tap.v2.shared-responder-key.NTAG215';

  static SecretKey? _cachedKey;

  static SecretKey _keyFromSeed(String seed) =>
      SecretKey(c.sha256.convert(utf8.encode(seed)).bytes);

  static SecretKey _sharedKey() => _cachedKey ??= _keyFromSeed(_sharedKeySeed);

  static Uint8List _randomBytes(int n) =>
      Uint8List.fromList(List<int>.generate(n, (_) => _rng.nextInt(256)));

  // ---- Core primitives -----------------------------------------------------

  static Future<String> _encryptWith(String plaintext, SecretKey key) async {
    final SecretBox box = await _aes.encrypt(
      utf8.encode(plaintext),
      secretKey: key,
      nonce: _randomBytes(12),
    );
    // Pack exactly like SubtleCrypto: iv || ciphertext || tag.
    final BytesBuilder packed = BytesBuilder()
      ..add(box.nonce)
      ..add(box.cipherText)
      ..add(box.mac.bytes);
    return base64.encode(packed.toBytes());
  }

  static Future<String> _decryptWith(String b64, SecretKey key) async {
    late final Uint8List packed;
    try {
      packed = base64.decode(b64);
    } catch (_) {
      throw const TamperException('Payload is not valid base64');
    }
    if (packed.length < 12 + 16) {
      throw const TamperException('Payload is too short to be valid');
    }
    final Uint8List nonce = packed.sublist(0, 12);
    final Uint8List cipherText = packed.sublist(12, packed.length - 16);
    final Uint8List mac = packed.sublist(packed.length - 16);
    try {
      final List<int> clear = await _aes.decrypt(
        SecretBox(cipherText, nonce: nonce, mac: Mac(mac)),
        secretKey: key,
      );
      return utf8.decode(clear);
    } catch (_) {
      // GCM auth-tag mismatch → corruption / tampering (F14).
      throw const TamperException('Auth tag mismatch');
    }
  }

  // ---- Shared-key API (tag payloads + cloud backup) ------------------------

  /// Encrypt a UTF-8 string → base64 of [12-byte IV | ciphertext | tag].
  static Future<String> encryptBytes(String plaintext) =>
      _encryptWith(plaintext, _sharedKey());

  /// Decrypt base64 of [IV | ciphertext | tag] → UTF-8. Throws on tamper.
  static Future<String> decryptBytes(String b64) =>
      _decryptWith(b64, _sharedKey());

  /// Encrypted byte cost of a plaintext, WITHOUT actually encrypting.
  /// AES-GCM: ciphertext == plaintext length, + 16-byte tag, + 12-byte IV.
  /// Feeds the live tag budget meter (F4.4) via `ndefMessageSize`.
  static int encryptedSize(String plaintext) =>
      utf8.encode(plaintext).length + 16 /* tag */ + 12 /* IV */;

  // ---- Per-share keys (secure emergency share links) -----------------------
  // A share link is encrypted with a FRESH random 256-bit key that travels only
  // in the URL fragment (#k=...) and is never sent to the server. The public
  // viewer decrypts client-side. This keeps shares end-to-end encrypted and
  // independently revocable, without exposing the app's shared responder key.

  /// New random 256-bit key, base64.
  static String newShareKeyB64() => base64.encode(_randomBytes(32));

  static Future<String> encryptWithKeyB64(String plaintext, String keyB64) =>
      _encryptWith(plaintext, SecretKey(base64.decode(keyB64)));

  static Future<String> decryptWithKeyB64(String b64, String keyB64) =>
      _decryptWith(b64, SecretKey(base64.decode(keyB64)));

  // ---- PIN hashing (F0.4 / §7: never store the PIN in plaintext) -----------

  static String hashPin(String pin, String salt) =>
      base64.encode(c.sha256.convert(utf8.encode('$salt:$pin')).bytes);

  static String newSalt() => base64.encode(_randomBytes(16));
}
