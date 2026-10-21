// ============================================================================
// Monoline outline icons (PRD §9.6) — the exact SVG path data from the web
// build's components/ui/Icons.tsx, rendered through flutter_svg so the icon
// set is pixel-identical rather than approximated with Material glyphs.
//
// Usage:  AppIcon(Ico.nfc, size: 20, color: C.accent)
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../theme/tokens.dart';

/// The `d`/shape body of each 24x24 icon. Stroke attributes are applied by
/// [AppIcon] so every icon shares one consistent monoline treatment.
class Ico {
  Ico._();

  static const String search =
      '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>';
  static const String bell =
      '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>'
      '<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>';
  static const String plus = '<path d="M12 5v14M5 12h14"/>';
  static const String chevronRight = '<path d="m9 6 6 6-6 6"/>';
  static const String chevronLeft = '<path d="m15 6-6 6 6 6"/>';
  static const String home =
      '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>';
  static const String pill =
      '<rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(45 12 12)"/>'
      '<path d="m8.5 8.5 7 7"/>';
  static const String nfc = '<path d="M4 8a12 12 0 0 1 0 8"/>'
      '<path d="M8 6a18 18 0 0 1 0 12"/>'
      '<path d="M20 8a12 12 0 0 0 0 8"/>'
      '<path d="M16 6a18 18 0 0 0 0 12"/>';
  static const String stethoscope = '<path d="M4 3v5a5 5 0 0 0 10 0V3"/>'
      '<path d="M9 18a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="13" r="2"/>';
  static const String settings = '<circle cx="12" cy="12" r="3"/>'
      '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>';
  static const String shield =
      '<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/>';
  static const String alert =
      '<path d="M12 3 2 20h20z"/><path d="M12 10v5M12 18h.01"/>';
  static const String check = '<path d="M20 6 9 17l-5-5"/>';
  static const String checkCircle =
      '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-4.8"/>';
  static const String x = '<path d="M18 6 6 18M6 6l12 12"/>';
  static const String camera =
      '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>';
  static const String contact =
      '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>';
  static const String drop =
      '<path d="M12 3s6 6.5 6 10.5a6 6 0 0 1-12 0C6 9.5 12 3 12 3z"/>';
  static const String clock =
      '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>';
  static const String lock =
      '<rect x="5" y="11" width="14" height="9" rx="2"/>'
      '<path d="M8 11V8a4 4 0 0 1 8 0v3"/>';
  static const String fingerprint =
      '<path d="M12 10a2 2 0 0 1 2 2c0 3-1 5-1 5"/>'
      '<path d="M8.5 8.2A5 5 0 0 1 17 12c0 1 0 2-.3 3"/>'
      '<path d="M6 12a6 6 0 0 1 1.4-3.9"/>'
      '<path d="M9 20c-.7-1-1-2.5-1-4a4 4 0 0 1 4-4"/>';
  static const String edit =
      '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m14 6 4 4"/>';
  static const String trash =
      '<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/>';
  static const String doc = '<path d="M6 3h8l4 4v14H6z"/>'
      '<path d="M14 3v4h4M9 13h6M9 17h6"/>';
  static const String heart =
      '<path d="M12 20s-7-4.5-9-9a4.5 4.5 0 0 1 9-2 4.5 4.5 0 0 1 9 2c-2 4.5-9 9-9 9z"/>';
  static const String map =
      '<path d="M12 21s6-5.7 6-10a6 6 0 0 0-12 0c0 4.3 6 10 6 10z"/>'
      '<circle cx="12" cy="11" r="2.2"/>';
  static const String phone =
      '<path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>';
  static const String message = '<path d="M4 5h16v11H8l-4 4z"/>';
  static const String scan =
      '<path d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3M4 12h16"/>';
  static const String arrowSwap =
      '<path d="M7 4 3 8l4 4M3 8h13M17 20l4-4-4-4M21 16H8"/>';
  static const String wifi =
      '<path d="M2 8a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0"/>'
      '<path d="M12 19h.01"/>';
  static const String info =
      '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>';
  static const String eye =
      '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>'
      '<circle cx="12" cy="12" r="3"/>';
  static const String key = '<circle cx="8" cy="8" r="4"/>'
      '<path d="m11 11 8 8M16 16l2-2M14 18l2-2"/>';
  static const String sparkle =
      '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>';
  static const String share =
      '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/>'
      '<circle cx="18" cy="19" r="3"/>'
      '<path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>';
  static const String copy =
      '<rect x="9" y="9" width="11" height="11" rx="2"/>'
      '<path d="M5 15V5a2 2 0 0 1 2-2h8"/>';
}

/// A monoline icon rendered from the shared 24x24 path set.
class AppIcon extends StatelessWidget {
  const AppIcon(
    this.path, {
    super.key,
    this.size = 24,
    this.color = C.textPrimary,
    this.strokeWidth = 2,
  });

  final String path;
  final double size;
  final Color color;
  final double strokeWidth;

  /// Built SVG documents, so a rebuild reuses the same string (and therefore
  /// flutter_svg's parsed-picture cache) instead of re-formatting it.
  static final Map<(String, double, int, double), String> _docs =
      <(String, double, int, double), String>{};

  String get _svg => _docs.putIfAbsent(
      (path, size, color.toARGB32(), strokeWidth),
      () => '<svg xmlns="http://www.w3.org/2000/svg" '
          'width="$size" height="$size" viewBox="0 0 24 24" fill="none" '
          'stroke="${_hex(color)}" stroke-opacity="${_opacity(color)}" '
          'stroke-width="$strokeWidth" stroke-linecap="round" '
          'stroke-linejoin="round">$path</svg>');

  static String _hex(Color c) =>
      '#${((c.r * 255).round() << 16 | (c.g * 255).round() << 8 | (c.b * 255).round()).toRadixString(16).padLeft(6, '0')}';

  static String _opacity(Color c) => c.a.toStringAsFixed(3);

  @override
  Widget build(BuildContext context) => SvgPicture.string(
        _svg,
        width: size,
        height: size,
      );
}

/// Google's four-colour "G" mark, inline so it works offline / under CSP.
class GoogleG extends StatelessWidget {
  const GoogleG({super.key, this.size = 20});
  final double size;

  static const String _svg = '''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
<path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
<path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
<path fill="#4CAF50" d="M24 44c5.5 0 10.5-2.1 14.3-5.6l-6.6-5.6C29.6 34.5 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
<path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.6 5.6C40.9 36.3 44 30.7 44 24c0-1.3-.1-2.3-.4-3.5z"/>
</svg>''';

  @override
  Widget build(BuildContext context) =>
      SvgPicture.string(_svg, width: size, height: size);
}
