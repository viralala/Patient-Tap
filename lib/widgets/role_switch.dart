import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/app_state.dart';
import '../theme/app_colors.dart';

/// Persistent header control to flip between Patient and Responder mode.
/// Tapping it toggles the active role without restarting the app.
class RoleSwitch extends StatelessWidget {
  const RoleSwitch({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final isPatient = app.isPatient;

    return GestureDetector(
      onTap: () => context.read<AppState>().toggleMode(),
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _pill(
              label: 'Patient',
              icon: Icons.person_rounded,
              active: isPatient,
            ),
            _pill(
              label: 'Responder',
              icon: Icons.medical_services_rounded,
              active: !isPatient,
            ),
          ],
        ),
      ),
    );
  }

  Widget _pill({
    required String label,
    required IconData icon,
    required bool active,
  }) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: active ? AppColors.accent : Colors.transparent,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon,
              size: 15,
              color: active ? Colors.white : AppColors.textSecondary),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              color: active ? Colors.white : AppColors.textSecondary,
              fontWeight: FontWeight.w700,
              fontSize: 12.5,
            ),
          ),
        ],
      ),
    );
  }
}
