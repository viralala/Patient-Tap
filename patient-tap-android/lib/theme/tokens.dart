// ============================================================================
// Design tokens — a 1:1 port of the `:root` custom properties in the web
// build's app/globals.css.
//
// Direction: "field equipment" medical — warm green-tinted charcoal surfaces,
// a single surgical-teal accent, mono micro-labels for machine data (IDs,
// bytes, timestamps), squircle icon tiles, subtle grain. Semantic colour only:
// red = danger, amber = caution, teal = brand/success.
// ============================================================================

import 'package:flutter/material.dart';

class C {
  C._();

  // Surfaces — one gray family, tinted toward the accent.
  static const Color background = Color(0xFF0C0F0E);
  static const Color surface = Color(0xFF141816);
  static const Color surface2 = Color(0xFF1D2320);
  static const Color surfaceAlt = Color(0xFF171C19);
  static const Color border = Color(0xFF252C28);
  static const Color borderStrong = Color(0xFF313A35);

  /// The page behind the app frame (`html/body` in the web build).
  static const Color shell = Color(0xFF060807);

  // Ink
  static const Color textPrimary = Color(0xFFEEF2EF);
  static const Color textSecondary = Color(0xFF98A29C);
  static const Color textMuted = Color(0xFF5D6660);

  // One accent. Everything brand/success/interactive is teal.
  static const Color accent = Color(0xFF3EC9A7);
  static const Color accentDim = Color(0xFF2B9B81);
  static const Color accentInk = Color(0xFF052A21); // dark text on teal fills
  static const Color accentSoft = Color(0x213EC9A7); // rgba(62,201,167,.13)

  // Semantic states (not decoration)
  static const Color danger = Color(0xFFF0685C);
  static const Color dangerSoft = Color(0x21F0685C); // .13
  static const Color caution = Color(0xFFE5B04E);
  static const Color cautionSoft = Color(0x1FE5B04E); // .12

  /// Muted info — same family, lower voice (was --accent-blue).
  static const Color info = Color(0xFF7AA79F);
  static const Color infoSoft = Color(0x217AA79F);

  // Banner body inks
  static const Color dangerInk = Color(0xFFF6C9C4);
  static const Color cautionInk = Color(0xFFEEDBB4);
  static const Color accentBannerInk = Color(0xFFBFE9DC);
  static const Color infoInk = Color(0xFFC3D4D0);

  static const Color avatarTop = Color(0xFF2B9B81);
  static const Color avatarBottom = Color(0xFF1B5A4B);
}

/// Tint pairs for the squircle row-icon tiles (`.t-purple`, `.t-coral`, …).
class Tint {
  const Tint(this.bg, this.fg);
  final Color bg;
  final Color fg;

  /// Legacy `.t-purple` / `.t-green` — both alias to the teal accent.
  static const Tint accent = Tint(C.accentSoft, C.accent);
  static const Tint info = Tint(C.infoSoft, C.info);
  static const Tint danger = Tint(C.dangerSoft, C.danger);
  static const Tint caution = Tint(C.cautionSoft, C.caution);
  static const Tint neutral = Tint(C.surface2, C.textSecondary);
}

class R {
  R._();
  static const double card = 20;
  static const double row = 12;
  static const double btn = 14;
  static const double pill = 999;
  static const double iconTile = 40;

  static BorderRadius get cardR => BorderRadius.circular(card);
  static BorderRadius get rowR => BorderRadius.circular(row);
  static BorderRadius get btnR => BorderRadius.circular(btn);
  static BorderRadius get pillR => BorderRadius.circular(pill);
}

class Sp {
  Sp._();

  /// Horizontal padding of the scrolling screen body (`.screen`).
  static const double screenH = 18;

  /// Bottom padding so content clears the tab bar.
  static const double screenBottom = 24;
  static const double tabBarHeight = 72;
}

class Shadows {
  Shadows._();
  static const List<BoxShadow> soft = <BoxShadow>[
    BoxShadow(
      color: Color(0x73040806),
      blurRadius: 32,
      offset: Offset(0, 10),
    ),
  ];
  static const List<BoxShadow> accentGlow = <BoxShadow>[
    BoxShadow(
      color: Color(0x593EC9A7),
      blurRadius: 16,
      offset: Offset(0, 4),
    ),
  ];
}

/// The hero card's layered background (radial teal wash over a dark gradient).
BoxDecoration heroDecoration() => BoxDecoration(
      borderRadius: R.cardR,
      border: Border.all(color: C.border),
      gradient: const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: <Color>[Color(0xFF1B201D), Color(0xFF121614)],
        stops: <double>[0.0, 0.72],
      ),
    );
