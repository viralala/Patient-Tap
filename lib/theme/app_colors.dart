import 'package:flutter/material.dart';

/// Central color palette for Patient-Tap.
///
/// Design direction: light / clinical, one strong royal-blue accent, black
/// primary text, soft gray secondary text. Life-safety red is reserved for
/// DNR / allergy warnings only.
class AppColors {
  AppColors._();

  // Backgrounds
  static const Color background = Color(0xFFF5F6FA); // off-white app canvas
  static const Color surface = Color(0xFFFFFFFF); // white floating cards

  // Accent / brand
  static const Color accent = Color(0xFF2F5FE0); // royal blue
  static const Color accentSoft = Color(0xFFE9EEFC); // blue tint for chips/fills

  // Text
  static const Color textPrimary = Color(0xFF111318); // near-black
  static const Color textSecondary = Color(0xFF8A90A0); // muted gray labels

  // Status
  static const Color danger = Color(0xFFE23744); // DNR / allergy warning red
  static const Color dangerSoft = Color(0xFFFCE8EA); // red tint background
  static const Color success = Color(0xFF1FB57A); // write success / ok
  static const Color successSoft = Color(0xFFE4F6EF);
  static const Color warning = Color(0xFFF5A623);

  // Lines / dividers
  static const Color border = Color(0xFFE6E8EF);
  static const Color shadow = Color(0x14111318); // ~8% soft drop shadow

  // Bottom-nav pill
  static const Color navBar = Color(0xFF111318);
  static const Color navInactive = Color(0xFF9AA0AE);
}
