import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:nfc_manager/nfc_manager.dart';
import 'package:nfc_manager_ndef/nfc_manager_ndef.dart';

/// MIME type used for the single NDEF record that holds the encrypted
/// patient-profile payload. Using a generic MIME record (rather than an
/// app-specific external type) keeps the tag readable by any NDEF tool for
/// debugging, while `CryptoService` remains the only thing that ever needs
/// to make sense of the bytes themselves.
const String _payloadMimeType = 'application/octet-stream';

/// How long we wait for a tag to be presented before giving up and treating
/// the attempt as a user-cancelled scan. `nfc_manager`'s session has no
/// built-in "user cancelled" signal on Android (there's no system scan
/// sheet like iOS), so a timeout is the practical way to detect "the user
/// walked away" instead of hanging forever.
const Duration _scanTimeout = Duration(seconds: 30);

/// Why a write to the tag failed. Drives the specific error copy on the
/// "Write to Tag" screen.
enum TagWriteError {
  moved, // tag lost contact mid-write (moved / lifted too early)
  full, // payload larger than the tag's usable capacity
  unavailable, // device has no NFC radio
  disabled, // device has NFC but it's turned off in Settings
  cancelled, // no tag was presented before the scan timed out
  unsupportedTag, // tag isn't NDEF-capable or isn't writable
  unknown,
}

extension TagWriteErrorCopy on TagWriteError {
  String get message {
    switch (this) {
      case TagWriteError.moved:
        return 'Tag moved — hold the phone steady on the wristband and try again.';
      case TagWriteError.full:
        return 'Tag full — trim old treatment-log entries to free space.';
      case TagWriteError.unavailable:
        return 'This device doesn\'t have NFC hardware.';
      case TagWriteError.disabled:
        return 'NFC is turned off — enable it in Settings and try again.';
      case TagWriteError.cancelled:
        return 'Scan cancelled — hold the phone against the wristband to try again.';
      case TagWriteError.unsupportedTag:
        return 'This tag isn\'t supported — use a blank NTAG215 wristband tag.';
      case TagWriteError.unknown:
        return 'Write failed — try again.';
    }
  }
}

/// Result of a tag write attempt.
class TagWriteResult {
  const TagWriteResult.success()
      : ok = true,
        error = null;
  const TagWriteResult.failure(this.error) : ok = false;

  final bool ok;
  final TagWriteError? error;
}

/// Real NFC hardware layer, built on `nfc_manager` + `nfc_manager_ndef`.
///
/// Patient-Tap stores the encrypted protobuf payload produced by
/// `CryptoService` as the payload of a single NDEF MIME record. NDEF (rather
/// than raw MIFARE Ultralight page writes) is used because it's supported
/// identically across Android and iOS by `nfc_manager`, and every NTAG21x
/// tag ships pre-formatted as NDEF out of the box.
///
/// Capacity: an NTAG215 exposes 504 usable bytes for user data
/// ([tagCapacityBytes]). `CryptoService`'s output is checked against this
/// before a session is even opened, so oversized payloads fail fast with
/// [TagWriteError.full] instead of prompting the user to scan first.
///
/// This class has no dependency on physical hardware being present at
/// compile or analysis time — `nfc_manager` is a normal Flutter plugin, so
/// the project builds and runs fine on a device/emulator without NFC; the
/// hardware is only touched once [writeToTag] or [readFromTag] is actually
/// called, and [NfcManager.checkAvailability] is checked first in both.
class NfcService {
  const NfcService();

  /// Usable capacity of an NTAG215 in bytes.
  static const int tagCapacityBytes = 504;

  /// Write [bytes] (the encrypted payload from `CryptoService`) to the next
  /// tag the user presents. See the [TagWriteError] cases for everything
  /// this handles: unavailable/disabled radios, a scan that times out
  /// (treated as user-cancelled), tags that aren't NDEF/writable, tags that
  /// are pulled away mid-write, and payloads that don't fit.
  Future<TagWriteResult> writeToTag(Uint8List bytes) async {
    if (bytes.length > tagCapacityBytes) {
      return const TagWriteResult.failure(TagWriteError.full);
    }

    final availabilityError = await _checkAvailabilityError();
    if (availabilityError != null) {
      return TagWriteResult.failure(availabilityError);
    }

    final completer = Completer<TagWriteResult>();
    void complete(TagWriteResult result) {
      if (!completer.isCompleted) completer.complete(result);
    }

    try {
      await NfcManager.instance.startSession(
        pollingOptions: {NfcPollingOption.iso14443},
        onDiscovered: (NfcTag tag) async {
          try {
            final ndef = Ndef.from(tag);
            if (ndef == null || !ndef.isWritable) {
              complete(const TagWriteResult.failure(TagWriteError.unsupportedTag));
              return;
            }

            final record = NdefRecord(
              typeNameFormat: TypeNameFormat.media,
              type: Uint8List.fromList(utf8.encode(_payloadMimeType)),
              identifier: Uint8List(0),
              payload: bytes,
            );

            await ndef.write(message: NdefMessage(records: [record]));
            complete(const TagWriteResult.success());
          } catch (_) {
            // The most common cause here is the tag losing contact with the
            // reader mid-write (lifted or shifted too soon).
            complete(const TagWriteResult.failure(TagWriteError.moved));
          } finally {
            await _safeStopSession();
          }
        },
      );
    } catch (_) {
      // Session failed to start at all (adapter busy, permission revoked,
      // etc). Not one of the specific cases above, so surface as unknown.
      complete(const TagWriteResult.failure(TagWriteError.unknown));
    }

    return completer.future.timeout(
      _scanTimeout,
      onTimeout: () {
        unawaited(_safeStopSession());
        return const TagWriteResult.failure(TagWriteError.cancelled);
      },
    );
  }

  /// Read the raw bytes stored on the next tag the user presents, for
  /// `CryptoService.decryptProfile` to consume. Returns null for every
  /// "there is nothing to decrypt" case — no tag was presented before the
  /// scan timed out, NFC is unavailable/disabled, the tag isn't NDEF, or the
  /// read otherwise failed — matching the existing contract the responder
  /// flow already handles as `ScanStatus.noTag`.
  Future<Uint8List?> readFromTag() async {
    final availabilityError = await _checkAvailabilityError();
    if (availabilityError != null) {
      return null;
    }

    final completer = Completer<Uint8List?>();
    void complete(Uint8List? result) {
      if (!completer.isCompleted) completer.complete(result);
    }

    try {
      await NfcManager.instance.startSession(
        pollingOptions: {NfcPollingOption.iso14443},
        onDiscovered: (NfcTag tag) async {
          try {
            final ndef = Ndef.from(tag);
            if (ndef == null) {
              complete(null);
              return;
            }

            final message = ndef.cachedMessage ?? await ndef.read();
            if (message == null || message.records.isEmpty) {
              complete(null);
              return;
            }

            complete(Uint8List.fromList(message.records.first.payload));
          } catch (_) {
            complete(null);
          } finally {
            await _safeStopSession();
          }
        },
      );
    } catch (_) {
      complete(null);
    }

    return completer.future.timeout(
      _scanTimeout,
      onTimeout: () {
        unawaited(_safeStopSession());
        return null;
      },
    );
  }

  /// Maps `nfc_manager`'s hardware-availability check onto the specific
  /// write-error cases we can report before a session even starts. Returns
  /// null when NFC is enabled and ready to use.
  Future<TagWriteError?> _checkAvailabilityError() async {
    try {
      final availability = await NfcManager.instance.checkAvailability();
      if (availability == NfcAvailability.enabled) return null;
      if (availability == NfcAvailability.disabled) {
        return TagWriteError.disabled;
      }
      return TagWriteError.unavailable;
    } catch (_) {
      return TagWriteError.unavailable;
    }
  }

  Future<void> _safeStopSession() async {
    try {
      await NfcManager.instance.stopSession();
    } catch (_) {
      // Session may already be stopped/torn down; nothing to do.
    }
  }
}
