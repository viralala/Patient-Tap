# ============================================================================
# Patient-Tap — R8/ProGuard keep rules for the release build.
# ============================================================================

# ---- Razorpay ----
# The checkout SDK resolves classes reflectively and reads annotated fields.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepattributes JavascriptInterface
-keepattributes *Annotation*
-dontwarn com.razorpay.**
-keep class com.razorpay.** { *; }
-optimizations !method/inlining/*
-keepclasseswithmembers class * {
  public void onPayment*(...);
}

# ---- Google ML Kit (on-device text recognition) ----
# Only the Latin script bundle is used; silence the optional language models.
-keep class com.google.mlkit.** { *; }
-dontwarn com.google.mlkit.vision.text.chinese.**
-dontwarn com.google.mlkit.vision.text.devanagari.**
-dontwarn com.google.mlkit.vision.text.japanese.**
-dontwarn com.google.mlkit.vision.text.korean.**
-keep class com.google.android.gms.internal.mlkit_vision_text_common.** { *; }

# ---- Google Sign-In / Play Services auth ----
-keep class com.google.android.gms.auth.** { *; }
-dontwarn com.google.android.gms.**

# ---- flutter_local_notifications ----
# Scheduled notifications are restored from serialised state after a reboot.
-keep class com.dexterous.** { *; }
-keepclassmembers class com.dexterous.** { *; }
-dontwarn com.dexterous.**

# ---- androidx biometric (local_auth) ----
-keep class androidx.biometric.** { *; }

# ---- Flutter engine plumbing ----
-keep class io.flutter.embedding.** { *; }
-keep class io.flutter.plugin.** { *; }

# Flutter's engine references Play Core's split-install APIs for deferred
# components (dynamic feature modules) even though this app doesn't use any —
# it's compiled into every Flutter app's embedding. Since we never call that
# code path, missing classes here are safe to ignore rather than keep.
-dontwarn com.google.android.play.core.**

# Keep line numbers so release crash reports stay readable.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
