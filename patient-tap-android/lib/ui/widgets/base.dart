// ============================================================================
// Design-system primitives — Flutter ports of the web build's CSS components:
// .screen .navbar .card .card-alt .hero .row .row-icon .badge .btn .pill-cta
// .chip .field .section-title .divider
// ============================================================================

import 'package:flutter/material.dart';

import '../../theme/tokens.dart';
import '../../theme/type.dart';
import '../icons.dart';

// ---------------------------------------------------------------- layout ----

/// `.screen` — the scrolling body of a screen.
class Screen extends StatelessWidget {
  const Screen({
    super.key,
    required this.children,
    this.padTop = 4,
    this.padBottom = 24,
    this.controller,
  });

  final List<Widget> children;
  final double padTop;
  final double padBottom;
  final ScrollController? controller;

  @override
  Widget build(BuildContext context) => ListView(
        controller: controller,
        physics: const BouncingScrollPhysics(
          parent: AlwaysScrollableScrollPhysics(),
        ),
        padding: EdgeInsets.fromLTRB(
          Sp.screenH,
          padTop,
          Sp.screenH,
          padBottom + MediaQuery.of(context).padding.bottom,
        ),
        children: children,
      );
}

/// A non-scrolling screen body (used by centred states).
class ScreenPad extends StatelessWidget {
  const ScreenPad({super.key, required this.child, this.padTop = 4});
  final Widget child;
  final double padTop;

  @override
  Widget build(BuildContext context) => Padding(
        padding: EdgeInsets.fromLTRB(Sp.screenH, padTop, Sp.screenH, 16),
        child: child,
      );
}

/// `.navbar` — Material top app bar: back arrow, left-aligned title, action.
class NavHeader extends StatelessWidget {
  const NavHeader({
    super.key,
    required this.title,
    required this.onBack,
    this.trailing,
  });

  final String title;
  final VoidCallback onBack;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(Sp.screenH, 10, Sp.screenH, 6),
        child: Row(
          children: <Widget>[
            _NavBack(onTap: onBack),
            const SizedBox(width: 12),
            Expanded(
              child: Text(title,
                  style: T.navTitle,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis),
            ),
            ?trailing,
          ],
        ),
      );
}

class _NavBack extends StatelessWidget {
  const _NavBack({required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Material(
        color: C.surfaceAlt,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: const SizedBox(
            width: 38,
            height: 38,
            child: Center(child: AppIcon(Ico.chevronLeft, size: 24)),
          ),
        ),
      );
}

/// `.section-title` — heading with an optional trailing action.
class SectionTitle extends StatelessWidget {
  const SectionTitle(this.title, {super.key, this.trailing, this.top = 24});
  final String title;
  final Widget? trailing;
  final double top;

  @override
  Widget build(BuildContext context) => Padding(
        padding: EdgeInsets.fromLTRB(2, top, 2, 10),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: <Widget>[
            Text(title, style: T.sectionTitle),
            ?trailing,
          ],
        ),
      );
}

/// `.eyebrow` — mono machine-label. Text is uppercased for you.
class Eyebrow extends StatelessWidget {
  const Eyebrow(this.text, {super.key});
  final String text;

  @override
  Widget build(BuildContext context) =>
      Text(text.toUpperCase(), style: T.eyebrow);
}

/// `.divider`
class Hr extends StatelessWidget {
  const Hr({super.key, this.margin = 14});
  final double margin;

  @override
  Widget build(BuildContext context) => Container(
        height: 1,
        margin: EdgeInsets.symmetric(vertical: margin),
        color: C.border,
      );
}

// ----------------------------------------------------------------- cards ----

/// `.card` — the primary container. Elevation via tone, not border+shadow.
class Card extends StatelessWidget {
  const Card({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.onTap,
    this.color = C.surface,
    this.radius,
    this.borderColor,
  });

  final Widget child;
  final EdgeInsets padding;
  final VoidCallback? onTap;
  final Color color;
  final double? radius;
  final Color? borderColor;

  @override
  Widget build(BuildContext context) {
    final BorderRadius br = BorderRadius.circular(radius ?? R.card);
    final Widget body = Padding(padding: padding, child: child);
    return Material(
      color: color,
      borderRadius: br,
      child: onTap == null
          ? Container(
              decoration: BoxDecoration(
                borderRadius: br,
                border: borderColor == null
                    ? null
                    : Border.all(color: borderColor!),
              ),
              child: body,
            )
          : InkWell(
              onTap: onTap,
              borderRadius: br,
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: br,
                  border: borderColor == null
                      ? null
                      : Border.all(color: borderColor!),
                ),
                child: body,
              ),
            ),
    );
  }
}

/// `.card-alt` — the lighter, tighter inner container.
class CardAlt extends StatelessWidget {
  const CardAlt({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(14),
    this.onTap,
    this.borderColor,
  });

  final Widget child;
  final EdgeInsets padding;
  final VoidCallback? onTap;
  final Color? borderColor;

  @override
  Widget build(BuildContext context) => Card(
        color: C.surfaceAlt,
        radius: R.row,
        padding: padding,
        onTap: onTap,
        borderColor: borderColor,
        child: child,
      );
}

// ------------------------------------------------------------------ rows ----

/// `.row-icon` — the squircle tint tile.
class IconTile extends StatelessWidget {
  const IconTile(
    this.icon, {
    super.key,
    this.tint = Tint.accent,
    this.size = R.iconTile,
    this.iconSize = 20,
  });

  final String icon;
  final Tint tint;
  final double size;
  final double iconSize;

  @override
  Widget build(BuildContext context) => Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: tint.bg,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Center(
          child: AppIcon(icon, size: iconSize, color: tint.fg),
        ),
      );
}

/// `.row` — icon · title/sub · trailing. Titles ellipsize, subtitles wrap.
class RowTile extends StatelessWidget {
  const RowTile({
    super.key,
    this.icon,
    this.tint = Tint.accent,
    required this.title,
    this.subtitle,
    this.subtitleWidget,
    this.trailing,
    this.onTap,
    this.divider = true,
    this.titleWraps = false,
    this.padding = const EdgeInsets.symmetric(vertical: 11, horizontal: 2),
  });

  final String? icon;
  final Tint tint;
  final String title;
  final String? subtitle;
  final Widget? subtitleWidget;
  final Widget? trailing;
  final VoidCallback? onTap;
  final bool divider;
  final bool titleWraps;
  final EdgeInsets padding;

  @override
  Widget build(BuildContext context) {
    final Widget content = Padding(
      padding: padding,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: <Widget>[
          if (icon != null) ...<Widget>[
            IconTile(icon!, tint: tint),
            const SizedBox(width: 12),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                Text(
                  title,
                  style: T.rowTitle,
                  maxLines: titleWraps ? 3 : 1,
                  overflow:
                      titleWraps ? TextOverflow.clip : TextOverflow.ellipsis,
                ),
                if (subtitleWidget != null) ...<Widget>[
                  const SizedBox(height: 1),
                  subtitleWidget!,
                ] else if (subtitle != null && subtitle!.isNotEmpty) ...<Widget>[
                  const SizedBox(height: 1),
                  Text(subtitle!, style: T.rowSub),
                ],
              ],
            ),
          ),
          if (trailing != null) ...<Widget>[
            const SizedBox(width: 12),
            trailing!,
          ],
        ],
      ),
    );

    final Widget row = onTap == null
        ? content
        : InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(8),
            child: content,
          );

    if (!divider) return row;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        row,
        Container(height: 1, color: C.border),
      ],
    );
  }
}

/// A list of [RowTile]s inside a card, with the last divider removed.
class Rows extends StatelessWidget {
  const Rows({super.key, required this.children});
  final List<Widget> children;

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: children,
      );
}

/// `.row-right` — right-aligned value + mono timestamp.
class RowRight extends StatelessWidget {
  const RowRight({super.key, required this.value, this.time});
  final String value;
  final String? time;

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Text(value, style: T.rowValue),
          if (time != null) ...<Widget>[
            const SizedBox(height: 1),
            Text(time!, style: T.rowTime),
          ],
        ],
      );
}

/// Empty-state copy used inside cards.
class EmptyNote extends StatelessWidget {
  const EmptyNote(this.text, {super.key});
  final String text;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 2),
        child: Text(text, style: T.captionMuted),
      );
}

// ---------------------------------------------------------------- badges ----

/// `.badge` — mono pill for machine data / status.
class Badge extends StatelessWidget {
  const Badge(
    this.label, {
    super.key,
    this.tint = Tint.neutral,
    this.icon,
  });

  final String label;
  final Tint tint;
  final String? icon;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
        decoration: BoxDecoration(
          color: tint.bg,
          borderRadius: BorderRadius.circular(7),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            if (icon != null) ...<Widget>[
              AppIcon(icon!, size: 13, color: tint.fg),
              const SizedBox(width: 6),
            ],
            Text(label, style: T.badge(color: tint.fg)),
          ],
        ),
      );
}

// --------------------------------------------------------------- buttons ----

enum BtnKind { primary, secondary, danger, ghost }

/// `.btn` — 52px tall, full width by default, with the CSS press-scale.
class Btn extends StatefulWidget {
  const Btn({
    super.key,
    required this.label,
    this.onTap,
    this.kind = BtnKind.primary,
    this.icon,
    this.small = false,
    this.expand = true,
    this.color,
    this.busy = false,
  });

  final String label;
  final VoidCallback? onTap;
  final BtnKind kind;
  final String? icon;
  final bool small;
  final bool expand;

  /// Overrides the label/icon colour (used for the coral ghost buttons).
  final Color? color;
  final bool busy;

  @override
  State<Btn> createState() => _BtnState();
}

class _BtnState extends State<Btn> {
  bool _down = false;

  bool get _enabled => widget.onTap != null && !widget.busy;

  Color get _bg => switch (widget.kind) {
        BtnKind.primary => C.accent,
        BtnKind.secondary => C.surface2,
        BtnKind.danger => C.danger,
        BtnKind.ghost => Colors.transparent,
      };

  Color get _fg =>
      widget.color ??
      switch (widget.kind) {
        BtnKind.primary => C.accentInk,
        BtnKind.secondary => C.textPrimary,
        BtnKind.danger => const Color(0xFF2B0A07),
        BtnKind.ghost => C.accent,
      };

  @override
  Widget build(BuildContext context) {
    final double h = widget.small ? 40 : 52;

    final Widget content = Row(
      mainAxisSize: widget.expand ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        if (widget.busy)
          SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(strokeWidth: 2, color: _fg),
          )
        else if (widget.icon != null)
          AppIcon(widget.icon!, size: widget.small ? 16 : 18, color: _fg),
        if (widget.busy || widget.icon != null) const SizedBox(width: 8),
        Flexible(
          child: Text(
            widget.label,
            style: T.button(color: _fg, size: widget.small ? 14 : 15),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );

    return Opacity(
      opacity: _enabled ? 1 : 0.4,
      child: GestureDetector(
        onTapDown: _enabled ? (_) => setState(() => _down = true) : null,
        onTapUp: _enabled ? (_) => setState(() => _down = false) : null,
        onTapCancel: _enabled ? () => setState(() => _down = false) : null,
        onTap: _enabled ? widget.onTap : null,
        child: AnimatedScale(
          scale: _down ? 0.98 : 1,
          duration: const Duration(milliseconds: 120),
          child: Container(
            height: h,
            width: widget.expand ? double.infinity : null,
            padding: widget.expand
                ? null
                : const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: _bg,
              borderRadius: BorderRadius.circular(R.btn),
              border: widget.kind == BtnKind.secondary
                  ? Border.all(color: C.borderStrong)
                  : null,
            ),
            child: Center(child: content),
          ),
        ),
      ),
    );
  }
}

/// `.pill-cta` — the small teal-tinted inline action.
class PillCta extends StatelessWidget {
  const PillCta({super.key, required this.label, this.icon, this.onTap});
  final String label;
  final String? icon;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) => Material(
        color: C.accentSoft,
        borderRadius: BorderRadius.circular(10),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(10),
          child: Container(
            height: 36,
            padding: const EdgeInsets.symmetric(horizontal: 14),
            alignment: Alignment.center,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                if (icon != null) ...<Widget>[
                  AppIcon(icon!, size: 16, color: C.accent),
                  const SizedBox(width: 6),
                ],
                Text(label, style: T.pillCta),
              ],
            ),
          ),
        ),
      );
}

/// `.icon-btn` — 40px squircle icon button with an optional notification dot.
class IconBtn extends StatelessWidget {
  const IconBtn({
    super.key,
    required this.icon,
    this.onTap,
    this.dot = false,
    this.size = 40,
    this.iconSize = 20,
  });

  final String icon;
  final VoidCallback? onTap;
  final bool dot;
  final double size;
  final double iconSize;

  @override
  Widget build(BuildContext context) => SizedBox(
        width: size,
        height: size,
        child: Stack(
          clipBehavior: Clip.none,
          children: <Widget>[
            Material(
              color: C.surfaceAlt,
              borderRadius: BorderRadius.circular(13),
              child: InkWell(
                onTap: onTap,
                borderRadius: BorderRadius.circular(13),
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(13),
                    border: Border.all(color: C.border),
                  ),
                  child: Center(child: AppIcon(icon, size: iconSize)),
                ),
              ),
            ),
            if (dot)
              Positioned(
                top: 8,
                right: 9,
                child: Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: C.caution,
                    shape: BoxShape.circle,
                    border: Border.all(color: C.surfaceAlt, width: 2),
                  ),
                ),
              ),
          ],
        ),
      );
}

// ----------------------------------------------------------------- chips ----

/// `.chip` — selectable tag. [onDelete] renders the trailing ×.
class Chip extends StatelessWidget {
  const Chip({
    super.key,
    required this.label,
    this.onTap,
    this.onDelete,
    this.selected = false,
    this.background,
    this.foreground,
  });

  final String label;
  final VoidCallback? onTap;
  final VoidCallback? onDelete;
  final bool selected;
  final Color? background;
  final Color? foreground;

  @override
  Widget build(BuildContext context) {
    final Color bg =
        background ?? (selected ? C.accentSoft : C.surfaceAlt);
    final Color fg =
        foreground ?? (selected ? C.accent : C.textPrimary);
    final Color bd = selected ? C.accent : C.border;

    return Material(
      color: bg,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: EdgeInsets.fromLTRB(12, 8, onDelete != null ? 8 : 12, 8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: bd),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Text(label, style: T.chip(color: fg)),
              if (onDelete != null) ...<Widget>[
                const SizedBox(width: 6),
                GestureDetector(
                  onTap: onDelete,
                  behavior: HitTestBehavior.opaque,
                  child: const AppIcon(Ico.x, size: 14, color: C.textMuted),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------- inputs ----

/// `.field` — label + input.
class Field extends StatelessWidget {
  const Field({
    super.key,
    required this.label,
    required this.child,
    this.bottom = 14,
  });

  final String label;
  final Widget child;
  final double bottom;

  @override
  Widget build(BuildContext context) => Padding(
        padding: EdgeInsets.only(bottom: bottom),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.only(left: 2, bottom: 6),
              child: Text(label, style: T.fieldLabel),
            ),
            child,
          ],
        ),
      );
}

/// `.input` — 48px tall, teal focus ring.
class Input extends StatelessWidget {
  const Input({
    super.key,
    this.controller,
    this.hint,
    this.keyboardType,
    this.onChanged,
    this.onSubmitted,
    this.autofocus = false,
    this.maxLines = 1,
    this.minLines,
    this.readOnly = false,
    this.onTap,
  });

  final TextEditingController? controller;
  final String? hint;
  final TextInputType? keyboardType;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final bool autofocus;
  final int maxLines;
  final int? minLines;
  final bool readOnly;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final bool multiline = maxLines > 1;
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      onChanged: onChanged,
      onSubmitted: onSubmitted,
      autofocus: autofocus,
      maxLines: maxLines,
      minLines: minLines,
      readOnly: readOnly,
      onTap: onTap,
      cursorColor: C.accent,
      style: T.body.copyWith(height: multiline ? 1.55 : null),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: T.body.copyWith(color: C.textMuted),
        filled: true,
        fillColor: C.surfaceAlt,
        isDense: true,
        contentPadding: EdgeInsets.symmetric(
          horizontal: 14,
          vertical: multiline ? 12 : 14,
        ),
        constraints: multiline
            ? const BoxConstraints(minHeight: 96)
            : const BoxConstraints(minHeight: 48),
        border: _border(C.border),
        enabledBorder: _border(C.border),
        focusedBorder: _border(C.accent),
      ),
    );
  }

  OutlineInputBorder _border(Color c) => OutlineInputBorder(
        borderRadius: BorderRadius.circular(R.row),
        borderSide: BorderSide(color: c),
      );
}

// ----------------------------------------------------------------- misc -----

/// `.avatar` — squircle gradient tile with initials (or a photo).
class Avatar extends StatelessWidget {
  const Avatar({
    super.key,
    required this.initials,
    this.photoUrl,
    this.size = 40,
  });

  final String initials;
  final String? photoUrl;
  final double size;

  @override
  Widget build(BuildContext context) => Container(
        width: size,
        height: size,
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(size * 0.325),
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: <Color>[C.avatarTop, C.avatarBottom],
          ),
        ),
        child: photoUrl != null && photoUrl!.isNotEmpty
            ? Image.network(
                photoUrl!,
                fit: BoxFit.cover,
                errorBuilder: (_, _, _) => _initials(),
              )
            : _initials(),
      );

  Widget _initials() => Center(
        child: Text(
          initials,
          style: TextStyle(
            fontFamily: F.sans,
            fontSize: size * 0.35,
            fontWeight: FontWeight.w700,
            color: const Color(0xFFDFFEF5),
          ),
        ),
      );
}

/// The film-grain overlay that sits above everything and never intercepts
/// touches — it's what stops the dark surfaces reading as flat digital gray.
class GrainOverlay extends StatelessWidget {
  const GrainOverlay({super.key, this.opacity = 0.05});
  final double opacity;

  @override
  Widget build(BuildContext context) => IgnorePointer(
        child: Opacity(
          opacity: opacity,
          child: CustomPaint(
            painter: _GrainPainter(),
            size: Size.infinite,
          ),
        ),
      );
}

class _GrainPainter extends CustomPainter {
  static const int _seed = 0x9E3779B9;

  @override
  void paint(Canvas canvas, Size size) {
    // Deterministic value noise — cheap, and stable across repaints so the
    // grain never crawls.
    final Paint p = Paint()..color = const Color(0xFFFFFFFF);
    const double cell = 2;
    int h = _seed;
    for (double y = 0; y < size.height; y += cell) {
      for (double x = 0; x < size.width; x += cell) {
        h = (h * 1664525 + 1013904223) & 0x7FFFFFFF;
        if ((h >> 8) % 5 == 0) {
          canvas.drawRect(Rect.fromLTWH(x, y, cell, cell), p);
        }
      }
    }
  }

  @override
  bool shouldRepaint(covariant _GrainPainter oldDelegate) => false;
}
