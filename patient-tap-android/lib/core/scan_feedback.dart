// ============================================================================
// Scan feedback — the buzz and beep that tell you a card was read.
//
// A full-strength vibration pattern and a tone from MainActivity's
// "patient_tap/feedback" channel. Each moment has its own signature so it can
// be told apart without looking at the screen:
//   detected — one firm buzz + beep      ("got the card, keep holding")
//   success  — two buzzes + rising tone  ("done, you can pull away")
//   failure  — one long buzz + low tone  ("didn't work")
// Falls back to Flutter's haptics where the channel isn't there (tests, web).
// ============================================================================

import 'package:flutter/services.dart';

class ScanFeedback {
  ScanFeedback._();

  static const MethodChannel _ch = MethodChannel('patient_tap/feedback');

  // android.media.ToneGenerator constants.
  static const int _toneBeep = 24; // TONE_PROP_BEEP
  static const int _toneAck = 25; // TONE_PROP_ACK
  static const int _toneNack = 26; // TONE_PROP_NACK

  static Future<void> detected() =>
      _pulse(<int>[0, 70], _toneBeep, 90, HapticFeedback.heavyImpact);

  static Future<void> success() => _pulse(
      <int>[0, 80, 90, 80], _toneAck, 160, HapticFeedback.mediumImpact);

  static Future<void> failure() =>
      _pulse(<int>[0, 320], _toneNack, 220, HapticFeedback.vibrate);

  static Future<void> _pulse(
    List<int> timings,
    int tone,
    int toneMs,
    Future<void> Function() fallback,
  ) async {
    try {
      await _ch.invokeMethod<void>('pulse', <String, Object>{
        'timings': timings,
        'tone': tone,
        'toneMs': toneMs,
      });
    } catch (_) {
      try {
        await fallback();
      } catch (_) {
        /* no haptics at all — the on-screen state still changes */
      }
    }
  }
}
