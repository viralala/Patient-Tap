import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../models/patient_profile.dart';
import '../../state/patient_controller.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_theme.dart';
import '../../widgets/circular_gauge.dart';
import '../../widgets/dnr_badge.dart';
import '../../widgets/labeled_card.dart';
import '../../widgets/primary_button.dart';
import '../../widgets/stat_card.dart';

/// Read-only "this is what's on your tag" dashboard. 2-column grid of stat
/// cards under a profile header. Shows an empty state until a profile has been
/// written to the tag.
class PatientDashboardScreen extends StatelessWidget {
  const PatientDashboardScreen({super.key, required this.onEdit});

  /// Jump to the Edit tab (used by the empty state CTA).
  final VoidCallback onEdit;

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<PatientController>();
    final profile = controller.savedProfile;

    if (profile == null) {
      return _EmptyState(onEdit: onEdit);
    }

    return _DashboardBody(
        profile: profile, controller: controller, onEdit: onEdit);
  }
}

class _DashboardBody extends StatelessWidget {
  const _DashboardBody({
    required this.profile,
    required this.controller,
    required this.onEdit,
  });
  final PatientProfile profile;
  final PatientController controller;
  final VoidCallback onEdit;

  @override
  Widget build(BuildContext context) {
    final updated = profile.updatedAt;
    final updatedLabel = updated == null
        ? 'Not yet synced'
        : 'Written ${DateFormat('d MMM, h:mm a').format(updated)}';

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 120),
      children: [
        LabeledCard(
          color: AppColors.textPrimary,
          child: Row(
            children: [
              CircleAvatar(
                radius: 26,
                backgroundColor: AppColors.accent,
                child: Text(
                  _initials(profile.name),
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 18,
                  ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      profile.name.isEmpty ? 'Unnamed patient' : profile.name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      profile.patientId,
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.7),
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.verified_rounded,
                  color: AppColors.accent, size: 22),
            ],
          ),
        ),
        const SizedBox(height: 8),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4),
          child: Row(
            children: [
              const Icon(Icons.contactless_rounded,
                  size: 14, color: AppColors.textSecondary),
              const SizedBox(width: 6),
              Text(updatedLabel,
                  style: Theme.of(context).textTheme.labelMedium),
            ],
          ),
        ),
        const SizedBox(height: AppTheme.s16),

        // Tag storage hero card (gauge + used/free), echoing the reference
        // "steps and calories" ring card.
        LabeledCard(
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('TAG STORAGE',
                        style: Theme.of(context).textTheme.labelSmall),
                    const SizedBox(height: 14),
                    _MiniStat(
                      value: '${controller.usedBytes}',
                      label: 'Bytes used',
                    ),
                    const SizedBox(height: 12),
                    Container(height: 1, color: AppColors.border),
                    const SizedBox(height: 12),
                    _MiniStat(
                      value:
                          '${controller.tagCapacityBytes - controller.usedBytes}',
                      label: 'Bytes free',
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              CircularGauge(
                fraction: controller.usageFraction,
                centerValue:
                    '${(controller.usageFraction * 100).round()}%',
                centerLabel: 'used',
                color: controller.usageFraction > 0.85
                    ? AppColors.danger
                    : AppColors.accent,
              ),
            ],
          ),
        ),
        const SizedBox(height: AppTheme.s16),

        // 2-column stat grid.
        _grid([
          StatCard(
            label: 'Blood Type',
            value: profile.bloodType.label,
            trend: 'On file',
            icon: Icons.bloodtype_rounded,
            accent: AppColors.danger,
          ),
          StatCard(
            label: 'Allergies',
            value: '${profile.allergies.length}',
            trend: profile.allergies.isEmpty
                ? 'None recorded'
                : profile.allergies.take(2).join(', '),
            icon: Icons.warning_amber_rounded,
            accent: AppColors.warning,
          ),
          StatCard(
            label: 'Medications',
            value: '${profile.medications.length}',
            trend: profile.medications.isEmpty
                ? 'None recorded'
                : 'Active prescriptions',
            icon: Icons.medication_rounded,
          ),
          StatCard(
            label: 'Contacts',
            value: '${profile.emergencyContacts.length}',
            trend: 'Emergency',
            icon: Icons.contacts_rounded,
          ),
        ]),
        const SizedBox(height: AppTheme.s16),

        // DNR status card (full width, prominent).
        LabeledCard(
          title: 'Resuscitation Status',
          icon: Icons.health_and_safety_rounded,
          child: Align(
            alignment: Alignment.centerLeft,
            child: DnrBadge(active: profile.dnr, large: true),
          ),
        ),
        const SizedBox(height: AppTheme.s16),

        PrimaryButton(
          label: 'Edit & Re-write Tag',
          icon: Icons.edit_rounded,
          color: AppColors.textPrimary,
          onPressed: onEdit,
        ),
      ],
    );
  }

  Widget _grid(List<Widget> cards) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 14,
      mainAxisSpacing: 14,
      childAspectRatio: 1.15,
      children: cards,
    );
  }

  static String _initials(String name) {
    final parts = name.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty);
    if (parts.isEmpty) return '?';
    return parts.take(2).map((p) => p[0].toUpperCase()).join();
  }
}

/// A left-aligned big number with a small muted label beneath — used inside
/// the storage card.
class _MiniStat extends StatelessWidget {
  const _MiniStat({required this.value, required this.label});
  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(value,
            style: Theme.of(context)
                .textTheme
                .headlineMedium
                ?.copyWith(fontSize: 26)),
        Text(label, style: Theme.of(context).textTheme.labelMedium),
      ],
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.onEdit});
  final VoidCallback onEdit;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 120,
              height: 120,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.accentSoft,
              ),
              child: const Icon(Icons.badge_rounded,
                  size: 56, color: AppColors.accent),
            ),
            const SizedBox(height: 24),
            Text('No profile yet',
                style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 8),
            Text(
              'Build your medical record, then write it to your tag. '
              'This dashboard will show what’s stored on the wristband.',
              textAlign: TextAlign.center,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(color: AppColors.textSecondary, height: 1.5),
            ),
            const SizedBox(height: 24),
            PrimaryButton(
              label: 'Build my profile',
              icon: Icons.arrow_forward_rounded,
              expanded: false,
              onPressed: onEdit,
            ),
          ],
        ),
      ),
    );
  }
}
