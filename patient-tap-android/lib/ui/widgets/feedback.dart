// ============================================================================
// Controls & feedback — Flutter ports of .banner .sheet .toast .meter .switch
// .segmented .nfc-ripple .scanning-pulse .ring .pin-dots .keypad
// ============================================================================

import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../theme/tokens.dart';
import '../../theme/type.dart';
import '../icons.dart';
import 'base.dart' as w;

// --------------------------------------------------------------- banners ----

enum BannerKind { danger, amber, green, blue }

/// `.banner` — left colour rule, tinted fill. Not an alert-box template.
class Banner extends StatelessWidget {
  const Banner({
    super.key,
    required this.kind,
    required this.title,
    this.body,
    this.bodyWidget,
    this.icon,
    this.titleSize = 14,
    this.bodySize = 13,
    this.margin = const EdgeInsets.only(bottom: 10),
  });

  final BannerKind kind;
  final String title;
  final String? body;
  final Widget? bodyWidget;
  final String? icon;
  final double titleSize;
  final double bodySize;
  final EdgeInsets margin;

  Color get _rule => switch (kind) {
        BannerKind.danger => C.danger,
        BannerKind.amber => C.caution,
        BannerKind.green => C.accent,
        BannerKind.blue => C.info,
      };

  Color get _bg => switch (kind) {
        BannerKind.danger => C.dangerSoft,
        BannerKind.amber => C.cautionSoft,
        BannerKind.green => C.accentSoft,
        BannerKind.blue => const Color(0x1A7AA79F),
      };

  Color get _ink => switch (kind) {
        BannerKind.danger => C.dangerInk,
        BannerKind.amber => C.cautionInk,
        BannerKind.green => C.accentBannerInk,
        BannerKind.blue => C.infoInk,
      };

  String get _defaultIcon => switch (kind) {
        BannerKind.danger => Ico.alert,
        BannerKind.amber => Ico.clock,
        BannerKind.green => Ico.checkCircle,
        BannerKind.blue => Ico.info,
      };

  @override
  Widget build(BuildContext context) => Container(
        margin: margin,
        decoration: BoxDecoration(
          color: _bg,
          borderRadius: BorderRadius.circular(10),
        ),
        child: IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              // The 3px left rule.
              Container(
                width: 3,
                decoration: BoxDecoration(
                  color: _rule,
                  borderRadius: const BorderRadius.horizontal(
                    left: Radius.circular(3),
                  ),
                ),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(13, 12, 14, 12),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Padding(
                        padding: const EdgeInsets.only(top: 1),
                        child: AppIcon(
                          icon ?? _defaultIcon,
                          size: titleSize >= 16 ? 22 : 20,
                          color: _rule,
                        ),
                      ),
                      const SizedBox(width: 11),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: <Widget>[
                            Text(
                              title,
                              style: T.bannerTitle(
                                  color: _rule, size: titleSize),
                            ),
                            if (bodyWidget != null) ...<Widget>[
                              const SizedBox(height: 2),
                              DefaultTextStyle(
                                style: T.bannerBody(
                                    color: _ink, size: bodySize),
                                child: bodyWidget!,
                              ),
                            ] else if (body != null && body!.isNotEmpty) ...<Widget>[
                              const SizedBox(height: 2),
                              Text(
                                body!,
                                style: T.bannerBody(
                                    color: _ink, size: bodySize),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      );
}

// ---------------------------------------------------------------- switch ----

/// `.switch` — the Material 3 switch, sized to match the CSS exactly
/// (50x30 track, 14px knob off / 20px knob on).
class AppSwitch extends StatelessWidget {
  const AppSwitch({super.key, required this.value, required this.onChanged});

  final bool value;
  final ValueChanged<bool>? onChanged;

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onChanged == null ? null : () => onChanged!(!value),
        behavior: HitTestBehavior.opaque,
        child: Opacity(
          opacity: onChanged == null ? 0.4 : 1,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            curve: Curves.easeOut,
            width: 50,
            height: 30,
            decoration: BoxDecoration(
              color: value ? C.accent : C.surface2,
              borderRadius: BorderRadius.circular(999),
              border: Border.all(
                color: value ? C.accent : C.textMuted,
                width: 2,
              ),
            ),
            child: Stack(
              children: <Widget>[
                AnimatedPositioned(
                  duration: const Duration(milliseconds: 180),
                  curve: Curves.easeOut,
                  left: value ? 21 : 3,
                  top: value ? 3 : 6,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    curve: Curves.easeOut,
                    width: value ? 20 : 14,
                    height: value ? 20 : 14,
                    decoration: BoxDecoration(
                      color: value ? C.accentInk : C.textSecondary,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
}

// ------------------------------------------------------------- segmented ----

class SegmentOption<V> {
  const SegmentOption(this.value, this.label);
  final V value;
  final String label;
}

/// `.segmented`
class Segmented<V> extends StatelessWidget {
  const Segmented({
    super.key,
    required this.options,
    required this.value,
    required this.onChanged,
  });

  final List<SegmentOption<V>> options;
  final V value;
  final ValueChanged<V> onChanged;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: C.surfaceAlt,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: C.border),
        ),
        child: Row(
          children: options.map((SegmentOption<V> o) {
            final bool active = o.value == value;
            return Expanded(
              child: GestureDetector(
                onTap: () => onChanged(o.value),
                behavior: HitTestBehavior.opaque,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  height: 34,
                  margin: const EdgeInsets.symmetric(horizontal: 1),
                  decoration: BoxDecoration(
                    color: active ? C.surface2 : Colors.transparent,
                    borderRadius: BorderRadius.circular(9),
                  ),
                  child: Center(
                    child: Text(
                      o.label,
                      style: T.segmented(
                        color: active ? C.textPrimary : C.textMuted,
                      ),
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      );
}

// ----------------------------------------------------------------- sheet ----

/// `.sheet` — the modal bottom sheet with grabber + optional titled header.
Future<V?> showAppSheet<V>({
  required BuildContext context,
  String? title,
  required Widget Function(BuildContext context) builder,
}) =>
    showModalBottomSheet<V>(
      context: context,
      backgroundColor: Colors.transparent,
      barrierColor: const Color(0xAD030605),
      isScrollControlled: true,
      builder: (BuildContext ctx) => _SheetShell(title: title, child: builder(ctx)),
    );

class _SheetShell extends StatelessWidget {
  const _SheetShell({this.title, required this.child});
  final String? title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final double bottomInset = MediaQuery.of(context).viewInsets.bottom;
    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.88,
      ),
      decoration: const BoxDecoration(
        color: C.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
        border: Border(top: BorderSide(color: C.borderStrong)),
      ),
      child: SingleChildScrollView(
        padding: EdgeInsets.fromLTRB(18, 10, 18, 24 + bottomInset),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            Center(
              child: Container(
                width: 36,
                height: 4,
                margin: const EdgeInsets.only(top: 6, bottom: 14),
                decoration: BoxDecoration(
                  color: C.borderStrong,
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
            ),
            if (title != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: <Widget>[
                    Expanded(child: Text(title!, style: T.headline)),
                    w.IconBtn(
                      icon: Ico.x,
                      onTap: () => Navigator.of(context).pop(),
                    ),
                  ],
                ),
              ),
            child,
          ],
        ),
      ),
    );
  }
}

// ----------------------------------------------------------------- toast ----

/// `.toast` — a top-anchored transient message.
class Toast extends StatelessWidget {
  const Toast({super.key, required this.message, this.icon, this.iconColor});

  final String message;
  final String? icon;
  final Color? iconColor;

  @override
  Widget build(BuildContext context) => Align(
        alignment: Alignment.topCenter,
        child: Padding(
          padding: EdgeInsets.only(
            top: MediaQuery.of(context).padding.top + 12,
          ),
          child: Material(
            color: Colors.transparent,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFF1C211E),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: C.borderStrong),
                boxShadow: Shadows.soft,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  if (icon != null) ...<Widget>[
                    AppIcon(icon!,
                        size: 16, color: iconColor ?? C.textPrimary),
                    const SizedBox(width: 8),
                  ],
                  Flexible(
                    child: Text(
                      message,
                      style: T.body.copyWith(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
}

// ---------------------------------------------------------- budget meter ----

/// `.meter` — the live 504-byte payload budget (F4.4).
class BudgetMeter extends StatelessWidget {
  const BudgetMeter({super.key, required this.used, required this.limit});
  final int used;
  final int limit;

  @override
  Widget build(BuildContext context) {
    final double pct = (used / limit).clamp(0, 1).toDouble();
    final bool over = used > limit;
    final Color color = over
        ? C.danger
        : pct > 0.8
            ? C.caution
            : C.accent;

    return Padding(
      padding: const EdgeInsets.only(top: 10, bottom: 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              value: pct,
              minHeight: 8,
              backgroundColor: C.surface2,
              valueColor: AlwaysStoppedAnimation<Color>(color),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: <Widget>[
              Text('$used bytes encrypted',
                  style: T.mono(size: 12, color: C.textSecondary)),
              Text(
                '${over ? '${used - limit} over' : '${limit - used} left'} / $limit',
                style: T.mono(size: 12, weight: 700, color: color),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ------------------------------------------------------------------ ring ----

class RingSegment {
  const RingSegment(this.value, this.color);
  final double value;
  final Color color;
}

/// The adherence donut. Arcs are separated by a small gap, like the reference.
class Ring extends StatelessWidget {
  const Ring({
    super.key,
    required this.segments,
    this.size = 200,
    this.stroke = 20,
    this.centerLabel,
    this.centerValue,
  });

  final List<RingSegment> segments;
  final double size;
  final double stroke;
  final String? centerLabel;
  final String? centerValue;

  @override
  Widget build(BuildContext context) => SizedBox(
        width: size,
        height: size,
        child: Stack(
          alignment: Alignment.center,
          children: <Widget>[
            CustomPaint(
              size: Size(size, size),
              painter: _RingPainter(segments: segments, stroke: stroke),
            ),
            Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                if (centerLabel != null)
                  Text(centerLabel!, style: T.caption()),
                if (centerValue != null)
                  Text(centerValue!, style: T.display(size: 34)),
              ],
            ),
          ],
        ),
      );
}

class _RingPainter extends CustomPainter {
  _RingPainter({required this.segments, required this.stroke});
  final List<RingSegment> segments;
  final double stroke;

  @override
  void paint(Canvas canvas, Size size) {
    final double r = (size.width - stroke) / 2;
    final Offset c = Offset(size.width / 2, size.height / 2);
    final Rect rect = Rect.fromCircle(center: c, radius: r);

    canvas.drawCircle(
      c,
      r,
      Paint()
        ..color = C.surface2
        ..style = PaintingStyle.stroke
        ..strokeWidth = stroke,
    );

    final double total = segments.fold<double>(
        0, (double s, RingSegment x) => s + x.value);
    if (total <= 0) return;

    const double gap = 0.04 * 2 * math.pi; // matches the CSS 4% dash gap
    double start = -math.pi / 2;

    for (final RingSegment seg in segments) {
      final double sweep = (seg.value / total) * 2 * math.pi;
      final double drawn = math.max(0, sweep - gap);
      if (drawn > 0) {
        canvas.drawArc(
          rect,
          start,
          drawn,
          false,
          Paint()
            ..color = seg.color
            ..style = PaintingStyle.stroke
            ..strokeWidth = stroke
            ..strokeCap = StrokeCap.round,
        );
      }
      start += sweep;
    }
  }

  @override
  bool shouldRepaint(covariant _RingPainter old) =>
      old.segments != segments || old.stroke != stroke;
}

// ------------------------------------------------------- NFC animations -----

/// `.nfc-ripple` — the concentric pulse shown while waiting for a tag.
class NfcRipple extends StatefulWidget {
  const NfcRipple({super.key, this.size = 120, this.iconSize = 56});
  final double size;
  final double iconSize;

  @override
  State<NfcRipple> createState() => _NfcRippleState();
}

class _NfcRippleState extends State<NfcRipple>
    with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1800),
  )..repeat();

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => SizedBox(
        width: widget.size * 1.6,
        height: widget.size * 1.6,
        child: AnimatedBuilder(
          animation: _c,
          builder: (BuildContext context, Widget? child) => Stack(
            alignment: Alignment.center,
            children: <Widget>[
              _ripple(_c.value),
              _ripple((_c.value + 0.5) % 1.0),
              Container(
                width: widget.size,
                height: widget.size,
                decoration: const BoxDecoration(
                  color: C.accentSoft,
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: AppIcon(Ico.nfc,
                      size: widget.iconSize, color: C.accent),
                ),
              ),
            ],
          ),
        ),
      );

  Widget _ripple(double t) {
    // 0.6 → 1.6 scale, opacity 0.9 → 0 (matches @keyframes ripple)
    final double scale = 0.6 + t * 1.0;
    final double opacity = (0.9 * (1 - t)).clamp(0.0, 1.0);
    return Opacity(
      opacity: opacity,
      child: Container(
        width: widget.size * scale,
        height: widget.size * scale,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: const Color(0x733EC9A7), width: 2),
        ),
      ),
    );
  }
}

/// `.scanning-pulse` — the breathing icon shown during OCR.
class ScanningPulse extends StatefulWidget {
  const ScanningPulse({super.key, required this.child});
  final Widget child;

  @override
  State<ScanningPulse> createState() => _ScanningPulseState();
}

class _ScanningPulseState extends State<ScanningPulse>
    with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1200),
  )..repeat(reverse: true);

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AnimatedBuilder(
        animation: _c,
        builder: (BuildContext context, Widget? child) {
          final double t = Curves.easeInOut.transform(_c.value);
          return Opacity(
            opacity: 0.4 + 0.6 * t,
            child: Transform.scale(scale: 0.94 + 0.12 * t, child: child),
          );
        },
        child: widget.child,
      );
}

/// A large glyph tile — the lock shield, the "tag written" tick.
class GlyphTile extends StatelessWidget {
  const GlyphTile({
    super.key,
    required this.icon,
    this.size = 60,
    this.iconSize = 34,
    this.color = C.accent,
    this.background = C.surfaceAlt,
  });

  final String icon;
  final double size;
  final double iconSize;
  final Color color;
  final Color background;

  @override
  Widget build(BuildContext context) => Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: background,
          borderRadius: BorderRadius.circular(size * 0.3),
          border: Border.all(color: C.border),
        ),
        child: Center(child: AppIcon(icon, size: iconSize, color: color)),
      );
}
