import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

/// A white floating card that shows one data point big and bold with a small
/// muted label and an optional status/trend line — the core dashboard tile.
class StatCard extends StatelessWidget {
  const StatCard({
    super.key,
    required this.label,
    required this.value,
    this.trend,
    this.icon,
    this.accent = AppColors.accent,
    this.emphasize = false,
    this.onTap,
    this.valueColor,
  });

  /// Small muted label above the number.
  final String label;

  /// The dominant, bold value (e.g. "O-", "312", "3").
  final String value;

  /// Optional small status/trend text below the value.
  final String? trend;

  final IconData? icon;
  final Color accent;

  /// When true the card is filled with the accent color (used for a "hero"
  /// tile or a life-safety warning tile).
  final bool emphasize;

  final VoidCallback? onTap;
  final Color? valueColor;

  @override
  Widget build(BuildContext context) {
    final bg = emphasize ? accent : AppColors.surface;
    final primaryText = emphasize ? Colors.white : AppColors.textPrimary;
    final mutedText =
        emphasize ? Colors.white.withValues(alpha: 0.85) : AppColors.textSecondary;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(AppTheme.cardRadius),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(AppTheme.s20),
          decoration: AppTheme.cardDecoration(color: bg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      label.toUpperCase(),
                      style: Theme.of(context)
                          .textTheme
                          .labelSmall
                          ?.copyWith(color: mutedText),
                    ),
                  ),
                  if (icon != null)
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: emphasize
                            ? Colors.white.withValues(alpha: 0.18)
                            : accent.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(icon,
                          size: 16,
                          color: emphasize ? Colors.white : accent),
                    ),
                ],
              ),
              const SizedBox(height: AppTheme.s12),
              Text(
                value,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.displayMedium?.copyWith(
                      color: valueColor ?? primaryText,
                    ),
              ),
              if (trend != null) ...[
                const SizedBox(height: 6),
                Text(
                  trend!,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context)
                      .textTheme
                      .labelMedium
                      ?.copyWith(color: mutedText),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
