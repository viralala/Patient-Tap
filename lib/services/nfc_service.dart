import 'dart:math';
import 'dart:typed_data';

import 'crypto_service.dart';
import 'mock_data.dart';

/// Why a write to the tag failed. Drives the specific error copy on the
/// "Write to Tag" screen.
enum TagWriteError {
  moved, // "Tag moved — try again"
  full, // "Tag full — trim entries"
  unknown,
}

extension TagWriteErrorCopy on TagWriteError {
  String get message {
    switch (this) {
      case TagWriteError.moved:
        return 'Tag moved — hold the phone steady on the wristband and try again.';
      case TagWriteError.full:
        return 'Tag full — trim old treatment-log entries to free space.';
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

/// STUB NFC hardware layer.
///
/// TODO: replace with real implementation from NFC/Hardware dev.
///   - nfc_manager session start/stop
///   - NTAG215 read/write (504 usable bytes)
class NfcService {
  NfcService({Random? random}) : _random = random ?? Random();

  final Random _random;

  /// Usable capacity of an NTAG215 in bytes (matches the real hardware target).
  static const int tagCapacityBytes = 504;

  static const Duration _scanLatency = Duration(milliseconds: 1400);
  static const Duration _writeLatency = Duration(milliseconds: 1600);

  /// Write bytes to the tag. Randomly fails ~20% of the time so the UI's
  /// error states can be exercised during development.
  Future<TagWriteResult> writeToTag(Uint8List bytes) async {
    // TODO: replace with real implementation from NFC/Hardware dev.
    await Future.delayed(_writeLatency);

    if (bytes.length > tagCapacityBytes) {
      return const TagWriteResult.failure(TagWriteError.full);
    }

    // ~20% simulated hardware failure.
    if (_random.nextDouble() < 0.20) {
      return const TagWriteResult.failure(TagWriteError.moved);
    }
    return const TagWriteResult.success();
  }

  /// Read raw bytes from a tag. Returns null if no tag was present / the read
  /// was aborted. In the mock it returns a freshly-"encrypted" demo patient so
  /// the responder flow has something to decrypt.
  Future<Uint8List?> readFromTag() async {
    // TODO: replace with real implementation from NFC/Hardware dev.
    await Future.delayed(_scanLatency);

    // ~10% "no tag detected" to exercise the empty/error scan state.
    if (_random.nextDouble() < 0.10) {
      return null;
    }

    // Produce realistic encrypted bytes for the demo patient.
    const crypto = CryptoService();
    return crypto.encryptProfile(MockData.scannedPatient());
  }
}
