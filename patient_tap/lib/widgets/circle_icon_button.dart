import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

/// A circular icon button (e.g. the onboarding "proceed" arrow, back buttons).
class CircleIconButton extends StatelessWidget {
  const CircleIconButton({
    super.key,
    required this.icon,
    required this.onPressed,
    this.size = 64,
    this.background = AppColors.accent,
    this.foreground = Colors.white,
    this.elevated = true,
  });

  final IconData icon;
  final VoidCallback? onPressed;
  final double size;
  final Color background;
  final Color foreground;
  final bool elevated;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        boxShadow: elevated
            ? [
                BoxShadow(
                  color: background.withValues(alpha: 0.35),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ]
            : null,
      ),
      child: Material(
        color: background,
        shape: const CircleBorder(),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onPressed,
          child: Icon(icon, color: foreground, size: size * 0.42),
        ),
      ),
    );
  }
}
