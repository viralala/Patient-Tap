import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

/// High-visibility DNR pill. Red when active (Do-Not-Resuscitate on file),
/// muted green when the patient is full-code.
class DnrBadge extends StatelessWidget {
  const DnrBadge({super.key, required this.active, this.large = false});

  final bool active;
  final bool large;

  @override
  Widget build(BuildContext context) {
    final bg = active ? AppColors.danger : AppColors.successSoft;
    final fg = active ? Colors.white : AppColors.success;
    final label = active ? 'DNR — DO NOT RESUSCITATE' : 'FULL CODE';
    final icon = active ? Icons.dangerous_rounded : Icons.favorite_rounded;

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: large ? 18 : 12,
        vertical: large ? 12 : 8,
      ),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: large ? 22 : 16, color: fg),
          SizedBox(width: large ? 10 : 6),
          Text(
            label,
            style: TextStyle(
              color: fg,
              fontWeight: FontWeight.w800,
              fontSize: large ? 15 : 12,
              letterSpacing: 0.3,
            ),
          ),
        ],
      ),
    );
  }
}
