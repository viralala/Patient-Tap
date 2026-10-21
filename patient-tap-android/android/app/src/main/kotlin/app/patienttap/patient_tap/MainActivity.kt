package app.patienttap.patient_tap

import android.content.Context
import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

/**
 * Hosts the "patient_tap/feedback" channel: a real vibration pattern plus a
 * short beep, so a responder feels and hears the moment a card is read even
 * with gloves on or the phone face-down. Flutter's HapticFeedback is a light
 * UI tick that many phones mute, which is why this lives natively.
 */
class MainActivity : FlutterActivity() {
    private var tones: ToneGenerator? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "patient_tap/feedback")
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "pulse" -> {
                        val timings = call.argument<List<Int>>("timings") ?: listOf(0, 60)
                        val tone = call.argument<Int>("tone") ?: -1
                        vibrate(timings.map { it.toLong() }.toLongArray())
                        if (tone >= 0) beep(tone, call.argument<Int>("toneMs") ?: 120)
                        result.success(null)
                    }
                    else -> result.notImplemented()
                }
            }
    }

    private fun vibrate(timings: LongArray) {
        val vibrator: Vibrator? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            (getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager)?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        }
        if (vibrator == null || !vibrator.hasVibrator()) return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // Full amplitude on every "on" segment; zeros are the gaps.
            val amps = IntArray(timings.size) { i -> if (i % 2 == 1) 255 else 0 }
            vibrator.vibrate(VibrationEffect.createWaveform(timings, amps, -1))
        } else {
            @Suppress("DEPRECATION")
            vibrator.vibrate(timings, -1)
        }
    }

    private fun beep(tone: Int, durationMs: Int) {
        try {
            val gen = tones ?: ToneGenerator(AudioManager.STREAM_NOTIFICATION, 90).also { tones = it }
            gen.startTone(tone, durationMs)
        } catch (_: RuntimeException) {
            // No audio route (or the generator was reclaimed) — vibration still fired.
            tones = null
        }
    }

    override fun onDestroy() {
        tones?.release()
        tones = null
        super.onDestroy()
    }
}
