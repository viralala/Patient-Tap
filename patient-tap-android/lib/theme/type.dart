// ============================================================================
// Typography — a 1:1 port of the web build's type scale.
//
// Both families are bundled VARIABLE fonts, so weight is applied through
// FontVariation('wght', …) as well as fontWeight. Setting only fontWeight on a
// variable font gives you synthetic (smeared) bolding; the axis gives you the
// real designed weight.
// ============================================================================

import 'package:flutter/material.dart';

import 'tokens.dart';

class F {
  F._();
  static const String sans = 'Manrope';
  static const String display = 'SpaceGrotesk';

  /// Android's built-in monospace — used for machine data (IDs, bytes,
  /// timestamps). Not bundled, so it costs nothing in APK size.
  static const String mono = 'monospace';
}

/// Build a text style with the real variable-font weight axis applied.
TextStyle _t({
  String family = F.sans,
  double size = 15,
  int weight = 400,
  double? letterSpacing,
  double? height,
  Color color = C.textPrimary,
  FontStyle? fontStyle,
}) =>
    TextStyle(
      fontFamily: family,
      fontSize: size,
      color: color,
      letterSpacing: letterSpacing,
      height: height,
      fontStyle: fontStyle,
      fontWeight: FontWeight.values[(weight ~/ 100) - 1],
      // Monospace is not a bundled variable font — the axis would be ignored.
      fontVariations: family == F.mono
          ? null
          : <FontVariation>[FontVariation('wght', weight.toDouble())],
    );

class T {
  T._();

  // ---- Display / headings --------------------------------------------------

  /// `.display` — 34px Space Grotesk, the hero name.
  static TextStyle display({double size = 34, Color color = C.textPrimary}) =>
      _t(
        family: F.display,
        size: size,
        weight: 600,
        letterSpacing: -0.8,
        height: 1.08,
        color: color,
      );

  /// `.large-title` — screen titles ("Settings", "Reminders").
  static TextStyle get largeTitle => _t(
        family: F.display,
        size: 26,
        weight: 600,
        letterSpacing: -0.4,
      );

  /// `.nav-title` — top app bar.
  static TextStyle get navTitle =>
      _t(size: 19, weight: 600, letterSpacing: -0.2);

  /// `.headline` — card headers.
  static TextStyle get headline =>
      _t(size: 17, weight: 700, letterSpacing: -0.2);

  /// `.section-title h2`
  static TextStyle get sectionTitle =>
      _t(size: 16, weight: 700, letterSpacing: -0.2);

  // ---- Body ----------------------------------------------------------------

  static TextStyle get body => _t(size: 15);

  /// `.caption` — secondary explanatory copy.
  static TextStyle caption({Color color = C.textSecondary}) =>
      _t(size: 13, height: 1.45, color: color);

  static TextStyle get captionMuted => caption(color: C.textMuted);

  // ---- List rows -----------------------------------------------------------

  static TextStyle get rowTitle => _t(size: 15, weight: 600);

  static TextStyle get rowSub =>
      _t(size: 13, height: 1.4, color: C.textSecondary);

  static TextStyle get rowValue => _t(size: 15, weight: 700);

  static TextStyle get rowTime =>
      _t(family: F.mono, size: 12, color: C.textMuted);

  // ---- Machine data (mono) -------------------------------------------------

  /// `.eyebrow` — the signature mono micro-label. Caller uppercases the text.
  static TextStyle get eyebrow => _t(
        family: F.mono,
        size: 11,
        weight: 500,
        letterSpacing: 1.6,
        color: C.textMuted,
      );

  /// `.badge`
  static TextStyle badge({Color color = C.textSecondary}) => _t(
        family: F.mono,
        size: 11,
        weight: 600,
        letterSpacing: 0.3,
        color: color,
      );

  /// `.mono` — inline machine values.
  static TextStyle mono({
    double size = 13,
    int weight = 400,
    Color color = C.textPrimary,
  }) =>
      _t(
        family: F.mono,
        size: size,
        weight: weight,
        letterSpacing: -0.2,
        color: color,
      );

  /// `.b-sub` — the brand line's mono subtitle.
  static TextStyle get brandSub => _t(
        family: F.mono,
        size: 11,
        letterSpacing: 0.4,
        color: C.textMuted,
      );

  /// `.b-name`
  static TextStyle get brandName =>
      _t(family: F.display, size: 16, weight: 600, letterSpacing: -0.2);

  // ---- Controls ------------------------------------------------------------

  /// `.btn`
  static TextStyle button({Color color = C.textPrimary, double size = 15}) =>
      _t(size: size, weight: 700, letterSpacing: -0.1, color: color);

  /// `.tab`
  static TextStyle tab({Color color = C.textMuted}) =>
      _t(size: 10.5, weight: 600, letterSpacing: 0.2, color: color);

  /// `.field label`
  static TextStyle get fieldLabel => _t(
        size: 12,
        weight: 600,
        letterSpacing: 0.2,
        color: C.textSecondary,
      );

  /// `.chip`
  static TextStyle chip({Color color = C.textPrimary}) =>
      _t(size: 13, weight: 600, color: color);

  /// `.pill-cta`
  static TextStyle get pillCta => _t(size: 13, weight: 700, color: C.accent);

  /// `.banner-title`
  static TextStyle bannerTitle({required Color color, double size = 14}) =>
      _t(size: size, weight: 700, letterSpacing: -0.1, color: color);

  /// `.banner-body`
  static TextStyle bannerBody({required Color color, double size = 13}) =>
      _t(size: size, height: 1.45, color: color);

  /// `.keypad button`
  static TextStyle get keypad =>
      _t(family: F.display, size: 24, weight: 500);

  /// `.segmented button`
  static TextStyle segmented({required Color color}) =>
      _t(size: 13, weight: 600, color: color);

  /// `.link`
  static TextStyle get link => _t(size: 15, weight: 700, color: C.accent);
}
