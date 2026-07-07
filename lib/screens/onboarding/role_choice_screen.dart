import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../state/app_state.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_theme.dart';

/// Final onboarding step: pick the initial role. Both remain reachable later
/// via the header toggle — this only sets where the user lands first.
class RoleChoiceScreen extends StatelessWidget {
  const RoleChoiceScreen({super.key});

  void _choose(BuildContext context, AppMode mode) {
    context.read<AppState>().completeOnboarding(mode);
    // AppRoot listens to AppState and swaps to the chosen shell; pop the
    // onboarding stack so back doesn't return here.
    Navigator.of(context).popUntil((r) => r.isFirst);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 8, 24, 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'How are you\nusing Patient-Tap?',
                style: Theme.of(context)
                    .textTheme
                    .headlineMedium
                    ?.copyWith(fontSize: 30, height: 1.1),
              ),
              const SizedBox(height: 10),
              Text(
                'You can switch anytime from the header.',
                style: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.copyWith(color: AppColors.textSecondary),
              ),
              const SizedBox(height: AppTheme.s32),
              _RoleCard(
                icon: Icons.person_rounded,
                accent: AppColors.accent,
                title: "I'm a Patient",
                subtitle:
                    'Build your medical profile and write it to your NFC '
                    'wristband or card.',
                onTap: () => _choose(context, AppMode.patient),
              ),
              const SizedBox(height: AppTheme.s16),
              _RoleCard(
                icon: Icons.medical_services_rounded,
                accent: const Color(0xFF7A5CF0),
                title: "I'm a Responder",
                subtitle:
                    'Scan a patient’s tag, read critical info instantly, and '
                    'log the care you provide.',
                onTap: () => _choose(context, AppMode.responder),
              ),
              const Spacer(),
              Center(
                child: Text(
                  'Zero-network · Encrypted on-tag · NTAG215',
                  style: Theme.of(context)
                      .textTheme
                      .labelSmall
                      ?.copyWith(color: AppColors.textSecondary),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  const _RoleCard({
    required this.icon,
    required this.accent,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final Color accent;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(AppTheme.cardRadius),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(AppTheme.s20),
          decoration: AppTheme.cardDecoration(),
          child: Row(
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: accent.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(icon, color: accent, size: 28),
              ),
              const SizedBox(width: AppTheme.s16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title,
                        style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppColors.textSecondary,
                            height: 1.4,
                          ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.arrow_forward_ios_rounded,
                  size: 16, color: AppColors.textSecondary),
            ],
          ),
        ),
      ),
    );
  }
}
