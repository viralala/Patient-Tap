// ============================================================================
// NFC read/write layer — REAL NTAG215 access via Android NDEF.
//
// This is the headline upgrade over the web build: instead of a simulated tag
// in localStorage, we hold a session open, wait for a physical card, and read
// or overwrite its NDEF message for real.
//
// Payload layout on the card:
//   NDEF message
//     └── 1 record, TNF = media (MIME)
//           type    = "application/x-patient-tap"
//           payload = base64( AES-256-GCM iv|ciphertext|tag )   ← core/crypto
//
// PRD: F13 encrypt-before-write, F15 auto-retry up to 3x, F16 clear error states.
// ============================================================================

import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:nfc_manager/ndef_record.dart';
import 'package:nfc_manager/nfc_manager.dart';
import 'package:nfc_manager/nfc_manager_android.dart';
import 'package:nfc_manager_ndef/nfc_manager_ndef.dart';

import '../config/app_config.dart';
import 'crypto_service.dart';
import 'local_store.dart';

enum TagErrorCode {
  outOfRange,
  tagFull,
  writeFailed,
  notSetUp,
  payloadTooLarge,
  tampered,
  notNdef,
  notWritable,
  nfcDisabled,
  nfcUnsupported,
  cancelled,
  timeout,
}

class TagError implements Exception {
  const TagError(this.code, [String? message])
      : _message = message;

  final TagErrorCode code;
  final String? _message;

  String get message => _message ?? tagErrorCopy[code]!;

  @override
  String toString() => message;
}

const Map<TagErrorCode, String> tagErrorCopy = <TagErrorCode, String>{
  TagErrorCode.outOfRange:
      'Tag moved out of range. Hold the device steady over the tag.',
  TagErrorCode.tagFull: 'Tag is full. Deselect some categories and try again.',
  TagErrorCode.writeFailed: 'Write failed after 3 attempts. Try again.',
  TagErrorCode.notSetUp: "This tag hasn't been set up yet.",
  TagErrorCode.payloadTooLarge:
      'Selection exceeds the $kTagLimitBytes-byte tag limit.',
  TagErrorCode.tampered:
      'Tag data is corrupted or tampered with and could not be verified.',
  TagErrorCode.notNdef:
      'This card is not NDEF-compatible. Use an NTAG215 wristband or sticker.',
  TagErrorCode.notWritable:
      'This tag is locked read-only and can no longer be written to.',
  TagErrorCode.nfcDisabled:
      'NFC is turned off. Enable it in Settings ▸ Connected devices ▸ NFC.',
  TagErrorCode.nfcUnsupported: 'This device has no NFC hardware.',
  TagErrorCode.cancelled: 'Scan cancelled.',
  TagErrorCode.timeout: 'No tag detected. Try again and hold the card steady.',
};

class NfcService {
  NfcService._();

  static bool _sessionOpen = false;

  /// Whether a scan/write session is currently waiting for a card.
  static bool get isSessionOpen => _sessionOpen;

  static Future<NfcAvailability> availability() async {
    try {
      return await NfcManager.instance.checkAvailability();
    } catch (_) {
      return NfcAvailability.unsupported;
    }
  }

  static Future<bool> isEnabled() async =>
      (await availability()) == NfcAvailability.enabled;

  // -------------------------------------------------------------------------
  // Session plumbing: bridge the callback-based API to a Future.
  // -------------------------------------------------------------------------
  static Future<T> _withTag<T>(
    Future<T> Function(NfcTag tag) action, {
    Duration timeout = const Duration(seconds: 60),
  }) async {
    final NfcAvailability avail = await availability();
    if (avail == NfcAvailability.unsupported) {
      throw const TagError(TagErrorCode.nfcUnsupported);
    }
    if (avail == NfcAvailability.disabled) {
      throw const TagError(TagErrorCode.nfcDisabled);
    }

    final Completer<T> completer = Completer<T>();
    _sessionOpen = true;

    Future<void> finish() async {
      _sessionOpen = false;
      try {
        await NfcManager.instance.stopSession();
      } catch (_) {
        /* session already gone */
      }
    }

    try {
      await NfcManager.instance.startSession(
        pollingOptions: <NfcPollingOption>{
          NfcPollingOption.iso14443, // NTAG215 is ISO 14443-A
          NfcPollingOption.iso15693,
        },
        onDiscovered: (NfcTag tag) async {
          if (completer.isCompleted) return;
          try {
            completer.complete(await action(tag));
          } catch (e) {
            completer.completeError(
              e is TagError ? e : TagError(TagErrorCode.writeFailed, '$e'),
            );
          }
        },
      );
    } catch (e) {
      await finish();
      throw TagError(TagErrorCode.writeFailed, '$e');
    }

    try {
      return await completer.future.timeout(
        timeout,
        onTimeout: () => throw const TagError(TagErrorCode.timeout),
      );
    } finally {
      await finish();
    }
  }

  /// Abort a session the user backed out of.
  static Future<void> cancel() async {
    if (!_sessionOpen) return;
    _sessionOpen = false;
    try {
      await NfcManager.instance.stopSession();
    } catch (_) {
      /* nothing to stop */
    }
  }

  // -------------------------------------------------------------------------
  // Record helpers
  // -------------------------------------------------------------------------
  static NdefMessage _buildMessage(String base64Payload) => NdefMessage(
        records: <NdefRecord>[
          NdefRecord(
            typeNameFormat: TypeNameFormat.media,
            type: Uint8List.fromList(utf8.encode(kTagMimeType)),
            identifier: Uint8List(0),
            payload: Uint8List.fromList(utf8.encode(base64Payload)),
          ),
        ],
      );

  /// Pull our base64 payload out of a message, tolerating other records the
  /// card may already carry (e.g. a URL record from the manufacturer).
  static String? _extractPayload(NdefMessage? msg) {
    if (msg == null) return null;
    for (final NdefRecord r in msg.records) {
      final String type = utf8.decode(r.type, allowMalformed: true);
      if (r.typeNameFormat == TypeNameFormat.media && type == kTagMimeType) {
        return utf8.decode(r.payload, allowMalformed: true);
      }
    }
    // Fall back to the first non-empty record — lets us read a card written by
    // an older build that used a different record type.
    for (final NdefRecord r in msg.records) {
      if (r.payload.isNotEmpty) {
        return utf8.decode(r.payload, allowMalformed: true);
      }
    }
    return null;
  }

  // -------------------------------------------------------------------------
  // WRITE (F13 encrypt-before-write, F15 retry)
  // -------------------------------------------------------------------------

  /// Encrypt [plaintext] and write it to a physical tag. Resolves once the
  /// card has been written and returns the NDEF bytes it took; throws
  /// [TagError] with a user-facing message.
  static Future<int> writeToTag(String plaintext) async {
    final String b64 = await CryptoService.encryptBytes(plaintext);

    // Budget against the bytes actually written: the base64 text plus the
    // record header, not the raw encrypted size.
    final NdefMessage message = _buildMessage(b64);
    if (message.byteLength > kTagLimitBytes) {
      throw const TagError(TagErrorCode.payloadTooLarge);
    }

    await _withTag<void>((NfcTag tag) async {
      final Ndef? ndef = Ndef.from(tag);

      if (ndef == null) {
        // Blank card that has never been NDEF-formatted — format it in place.
        final NdefFormatableAndroid? formatable =
            NdefFormatableAndroid.from(tag);
        if (formatable == null) throw const TagError(TagErrorCode.notNdef);
        await formatable.format(message);
        return;
      }

      if (!ndef.isWritable) throw const TagError(TagErrorCode.notWritable);
      if (message.byteLength > ndef.maxSize) {
        throw const TagError(TagErrorCode.tagFull);
      }

      // F15 — auto-retry up to 3x; a hand shifting mid-write is the common case.
      Object? lastErr;
      for (int attempt = 1; attempt <= 3; attempt++) {
        try {
          await ndef.write(message: message);
          return;
        } catch (e) {
          lastErr = e;
          await Future<void>.delayed(Duration(milliseconds: 220 * attempt));
        }
      }
      throw TagError(TagErrorCode.writeFailed, 'Write failed: $lastErr');
    });

    // Mirror locally so the app can show "tag synced" and Responder mode has a
    // fallback when the card isn't at hand.
    await LocalStore.writeTagRaw(b64);
    return message.byteLength;
  }

  // -------------------------------------------------------------------------
  // READ
  // -------------------------------------------------------------------------

  /// Wait for a card, read its NDEF message and decrypt the payload.
  /// Returns the plaintext JSON. Throws [TagError] on empty / tampered tag.
  static Future<String> readFromTag() async {
    final String b64 = await _withTag<String>((NfcTag tag) async {
      final Ndef? ndef = Ndef.from(tag);
      if (ndef == null) throw const TagError(TagErrorCode.notNdef);

      NdefMessage? msg;
      try {
        msg = await ndef.read();
      } catch (_) {
        msg = ndef.cachedMessage;
      }
      msg ??= ndef.cachedMessage;

      final String? payload = _extractPayload(msg);
      if (payload == null || payload.isEmpty) {
        throw const TagError(TagErrorCode.notSetUp);
      }
      return payload;
    });

    await LocalStore.writeTagRaw(b64);
    return _decryptOrThrow(b64);
  }

  /// Decrypt the last payload this device saw, with no card present.
  /// Used by Responder mode's offline fallback.
  static Future<String> readFromMirror() async {
    final String? raw = LocalStore.readTagRaw();
    if (raw == null) throw const TagError(TagErrorCode.notSetUp);
    return _decryptOrThrow(raw);
  }

  static Future<String> _decryptOrThrow(String b64) async {
    try {
      return await CryptoService.decryptBytes(b64);
    } on TamperException {
      throw const TagError(TagErrorCode.tampered);
    } catch (_) {
      throw const TagError(TagErrorCode.tampered);
    }
  }

  /// Erase our record from a physical card by writing an empty NDEF message.
  static Future<void> wipeTag() async {
    await _withTag<void>((NfcTag tag) async {
      final Ndef? ndef = Ndef.from(tag);
      if (ndef == null) throw const TagError(TagErrorCode.notNdef);
      if (!ndef.isWritable) throw const TagError(TagErrorCode.notWritable);
      await ndef.write(message: const NdefMessage(records: <NdefRecord>[]));
    });
    await LocalStore.clearTag();
  }

  /// Read a card's technical details without decrypting — used by the
  /// "Tag & platform" diagnostics in Settings.
  static Future<({int maxSize, bool writable, int used, String type})>
      inspectTag() async {
    return _withTag<({int maxSize, bool writable, int used, String type})>(
        (NfcTag tag) async {
      final Ndef? ndef = Ndef.from(tag);
      if (ndef == null) throw const TagError(TagErrorCode.notNdef);
      final NdefAndroid? a = NdefAndroid.from(tag);
      return (
        maxSize: ndef.maxSize,
        writable: ndef.isWritable,
        used: ndef.cachedMessage?.byteLength ?? 0,
        type: a?.type ?? 'unknown',
      );
    });
  }
}
