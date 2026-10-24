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
import 'scan_feedback.dart';

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
  TagErrorCode.payloadTooLarge: 'Selection exceeds the 504-byte tag limit.',
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

/// What the card is doing mid-session, for screens that show it live.
enum NfcStage {
  /// A card is in the field and being read/written — keep holding.
  detected,

  /// The card left before we finished. The session stays open; tap again.
  lost,
}

typedef NfcProgress = void Function(NfcStage stage);

class NfcService {
  NfcService._();

  /// The session currently waiting for a card, if any. Completing it with
  /// [TagErrorCode.cancelled] is how [cancel] unblocks a waiting caller.
  static Completer<Object?>? _active;

  /// Whether a scan/write session is currently waiting for a card.
  static bool get isSessionOpen => _active != null;

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
  //
  // Two things make a scan feel solid rather than fiddly:
  //  • A card that slips away mid-read is not a failure. Any error that isn't
  //    a [TagError] (TagLostException, IOException…) keeps the session open
  //    and reports [NfcStage.lost], so the user just taps again.
  //  • Every stage buzzes and beeps (core/scan_feedback), so you know the card
  //    registered without watching the screen.
  // -------------------------------------------------------------------------
  static Future<T> _withTag<T>(
    Future<T> Function(NfcTag tag) action, {
    Duration timeout = const Duration(seconds: 60),
    NfcProgress? onProgress,
    TagErrorCode lostCode = TagErrorCode.outOfRange,
  }) async {
    final NfcAvailability avail = await availability();
    if (avail == NfcAvailability.unsupported) {
      throw const TagError(TagErrorCode.nfcUnsupported);
    }
    if (avail == NfcAvailability.disabled) {
      throw const TagError(TagErrorCode.nfcDisabled);
    }

    // One session at a time — a new scan supersedes a forgotten one.
    await cancel();

    final Completer<Object?> completer = Completer<Object?>();
    _active = completer;
    bool working = false;
    Object? lastLoss;

    Future<void> finish() async {
      // Only tear down the platform session if it is still ours; a cancelled
      // session must not stop the one that replaced it.
      if (!identical(_active, completer)) return;
      _active = null;
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
        // Our own beep replaces the system click, so each stage sounds distinct.
        noPlatformSoundsAndroid: true,
        onDiscovered: (NfcTag tag) async {
          if (completer.isCompleted || working) return;
          working = true;
          onProgress?.call(NfcStage.detected);
          unawaited(ScanFeedback.detected());
          try {
            final T result = await action(tag);
            if (!completer.isCompleted) completer.complete(result);
          } on TagError catch (e) {
            // Card-level problem another tap won't fix (locked, not NDEF…).
            if (!completer.isCompleted) completer.completeError(e);
          } catch (e) {
            lastLoss = e;
            if (!completer.isCompleted) {
              onProgress?.call(NfcStage.lost);
              unawaited(ScanFeedback.failure());
            }
          } finally {
            working = false;
          }
        },
      );
    } catch (e) {
      await finish();
      throw TagError(TagErrorCode.writeFailed, '$e');
    }

    try {
      final Object? result = await completer.future.timeout(
        timeout,
        onTimeout: () => throw TagError(
          lastLoss != null ? lostCode : TagErrorCode.timeout,
        ),
      );
      unawaited(ScanFeedback.success());
      return result as T;
    } on TagError catch (e) {
      if (e.code != TagErrorCode.cancelled) unawaited(ScanFeedback.failure());
      rethrow;
    } finally {
      await finish();
    }
  }

  /// Abort a session the user backed out of. The waiting caller gets a
  /// [TagErrorCode.cancelled] error straight away instead of hanging until
  /// the timeout.
  static Future<void> cancel() async {
    final Completer<Object?>? c = _active;
    if (c == null) return;
    _active = null;
    if (!c.isCompleted) {
      c.completeError(const TagError(TagErrorCode.cancelled));
    }
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
  /// card has been written; throws [TagError] with a user-facing message.
  ///
  /// The write is read back and compared before it counts as done, so a card
  /// pulled away half-written is caught and simply re-tapped.
  static Future<int> writeToTag(
    String plaintext, {
    NfcProgress? onProgress,
  }) async {
    final String b64 = await CryptoService.encryptBytes(plaintext);

    // Budget against the encrypted binary size, not the base64 expansion.
    final int binLen = base64.decode(b64).length;
    if (binLen > kTagLimitBytes) {
      throw const TagError(TagErrorCode.payloadTooLarge);
    }

    final NdefMessage message = _buildMessage(b64);

    await _withTag<void>(onProgress: onProgress,
        lostCode: TagErrorCode.writeFailed, (NfcTag tag) async {
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
          final NdefMessage? back = await ndef.read();
          if (_extractPayload(back) == b64) return;
          lastErr = 'verification mismatch';
        } catch (e) {
          lastErr = e;
        }
        await Future<void>.delayed(Duration(milliseconds: 120 * attempt));
      }
      // Not a TagError: the session stays open and the user can tap again.
      throw StateError('Write failed: $lastErr');
    });

    // Mirror locally so the app can show "tag synced" and Responder mode has a
    // fallback when the card isn't at hand.
    await LocalStore.writeTagRaw(b64);
    return binLen;
  }

  // -------------------------------------------------------------------------
  // READ
  // -------------------------------------------------------------------------

  /// Wait for a card, read its NDEF message and decrypt the payload.
  /// Returns the plaintext JSON. Throws [TagError] on empty / tampered tag.
  ///
  /// Decryption happens inside the session so the success buzz only fires
  /// once the data is actually readable.
  static Future<String> readFromTag({NfcProgress? onProgress}) async {
    late String b64;
    final String plain =
        await _withTag<String>(onProgress: onProgress, (NfcTag tag) async {
      final Ndef? ndef = Ndef.from(tag);
      if (ndef == null) throw const TagError(TagErrorCode.notNdef);

      // Android already read the NDEF message when the card was discovered;
      // using that copy means no further radio traffic, so a quick tap that
      // is already moving away still succeeds.
      String? payload = _extractPayload(ndef.cachedMessage);
      if (payload == null || payload.isEmpty) {
        // Fresh read, retried — throws (→ "tap again") if the card is gone.
        Object? lastErr;
        for (int attempt = 1; attempt <= 3; attempt++) {
          try {
            payload = _extractPayload(await ndef.read());
            lastErr = null;
            break;
          } catch (e) {
            lastErr = e;
            await Future<void>.delayed(Duration(milliseconds: 80 * attempt));
          }
        }
        if (lastErr != null) throw StateError('Read failed: $lastErr');
      }

      if (payload == null || payload.isEmpty) {
        throw const TagError(TagErrorCode.notSetUp);
      }
      b64 = payload;
      return _decryptOrThrow(payload);
    });

    await LocalStore.writeTagRaw(b64);
    return plain;
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
