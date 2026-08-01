import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/patient_profile.dart';
import '../../state/responder_controller.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_theme.dart';
import '../../widgets/dnr_badge.dart';
import '../../widgets/labeled_card.dart';
import '../../widgets/primary_button.dart';

/// Decrypted patient record — life-safety UI. Allergies and DNR are the most
/// visually prominent elements (top, larger, warning-red when critical).
/// Medications and blood type follow in standard cards.
class DecryptedProfileScreen extends StatelessWidget {
  const DecryptedProfileScreen({
    super.key,
    required this.onGoScan,
    required this.onAddLog,
    required this.onViewLog,
  });

  final VoidCallback onGoScan;
  final VoidCallback onAddLog;
  final VoidCallback onViewLog;

  @override
  Widget build(BuildContext context) {
    final profile = context.watch<ResponderController>().profile;
    if (profile == null) {
      return _EmptyState(onGoScan: onGoScan);
    }
    return _Body(
      profile: profile,
      onAddLog: onAddLog,
      onViewLog: onViewLog,
    );
  }
}

class _Body extends StatelessWidget {
  const _Body({
    required this.profile,
    required this.onAddLog,
    required this.onViewLog,
  });
  final PatientProfile profile;
  final VoidCallback onAddLog;
  final VoidCallback onViewLog;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 120),
      children: [
        // Patient identity strip.
        Row(
          children: [
            CircleAvatar(
              radius: 24,
              backgroundColor: AppColors.textPrimary,
              child: Text(
                _initials(profile.name),
                style: const TextStyle(
                    color: Colors.white, fontWeight: FontWeight.w700),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(profile.name,
                      style: Theme.of(context).textTheme.titleLarge),
                  Text('${profile.patientId}  ·  ${profile.bloodType.label}',
                      style: Theme.of(context).textTheme.labelMedium),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: AppTheme.s16),

        // --- CRITICAL block (most prominent) ---
        if (profile.dnr) ...[
          const _CriticalCard(
            icon: Icons.dangerous_rounded,
            title: 'DO NOT RESUSCITATE',
            child: DnrBadge(active: true, large: true),
          ),
          const SizedBox(height: 12),
        ],
        _AllergiesCard(allergies: profile.allergies),
        const SizedBox(height: AppTheme.s16),

        // --- Standard blocks ---
        LabeledCard(
          title: 'Medications',
          icon: Icons.medication_rounded,
          child: profile.medications.isEmpty
              ? _muted(context, 'No medications on record.')
              : Column(
                  children: [
                    for (final m in profile.medications)
                      _LineRow(
                        title: m.name,
                        trailing: m.dose,
                        subtitle: m.frequency,
                      ),
                  ],
                ),
        ),
        const SizedBox(height: AppTheme.s16),

        Row(
          children: [
            Expanded(
              child: LabeledCard(
                title: 'Blood Type',
                icon: Icons.bloodtype_rounded,
                child: Text(profile.bloodType.label,
                    style: Theme.of(context).textTheme.displayMedium),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: LabeledCard(
                title: 'Log Entries',
                icon: Icons.history_rounded,
                child: Text('${profile.treatmentLog.length}',
                    style: Theme.of(context).textTheme.displayMedium),
              ),
            ),
          ],
        ),
        const SizedBox(height: AppTheme.s16),

        LabeledCard(
          title: 'Emergency Contacts',
          icon: Icons.contacts_rounded,
          child: profile.emergencyContacts.isEmpty
              ? _muted(context, 'No contacts on record.')
              : Column(
                  children: [
                    for (final ct in profile.emergencyContacts)
                      _LineRow(
                        title: ct.name,
                        subtitle: ct.relation,
                        trailing: ct.phone,
                      ),
                  ],
                ),
        ),
        const SizedBox(height: AppTheme.s24),

        PrimaryButton(
          label: 'Add treatment log entry',
          icon: Icons.add_rounded,
          onPressed: onAddLog,
        ),
        const SizedBox(height: 12),
        PrimaryButton(
          label: 'View treatment log',
          icon: Icons.timeline_rounded,
          color: AppColors.textPrimary,
          onPressed: onViewLog,
        ),
      ],
    );
  }

  Widget _muted(BuildContext context, String text) => Align(
        alignment: Alignment.centerLeft,
        child: Text(text, style: Theme.of(context).textTheme.labelMedium),
      );

  static String _initials(String name) {
    final parts = name.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty);
    if (parts.isEmpty) return '?';
    return parts.take(2).map((p) => p[0].toUpperCase()).join();
  }
}

class _CriticalCard extends StatelessWidget {
  const _CriticalCard({
    required this.icon,
    required this.title,
    required this.child,
  });
  final IconData icon;
  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppTheme.s20),
      decoration: BoxDecoration(
        color: AppColors.dangerSoft,
        borderRadius: BorderRadius.circular(AppTheme.cardRadius),
        border: Border.all(color: AppColors.danger, width: 2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: AppColors.danger, size: 22),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  color: AppColors.danger,
                  fontWeight: FontWeight.w800,
                  fontSize: 15,
                  letterSpacing: 0.4,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          child,
        ],
      ),
    );
  }
}

class _AllergiesCard extends StatelessWidget {
  const _AllergiesCard({required this.allergies});
  final List<String> allergies;

  @override
  Widget build(BuildContext context) {
    final has = allergies.any((a) => a.trim().isNotEmpty);
    if (!has) {
      return LabeledCard(
        title: 'Allergies',
        icon: Icons.check_circle_rounded,
        child: Align(
          alignment: Alignment.centerLeft,
          child: Text('No known allergies.',
              style: Theme.of(context).textTheme.labelMedium),
        ),
      );
    }
    return _CriticalCard(
      icon: Icons.warning_amber_rounded,
      title: 'ALLERGIES',
      child: Wrap(
        spacing: 10,
        runSpacing: 10,
        children: [
          for (final a in allergies)
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.danger,
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                a,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                  fontSize: 15,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _LineRow extends StatelessWidget {
  const _LineRow({
    required this.title,
    this.subtitle = '',
    this.trailing = '',
  });
  final String title;
  final String subtitle;
  final String trailing;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: const TextStyle(
                        fontWeight: FontWeight.w700, fontSize: 15)),
                if (subtitle.isNotEmpty)
                  Text(subtitle,
                      style: Theme.of(context).textTheme.labelMedium),
              ],
            ),
          ),
          if (trailing.isNotEmpty)
            Text(trailing,
                style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary)),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.onGoScan});
  final VoidCallback onGoScan;

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
              child: const Icon(Icons.nfc_rounded,
                  size: 56, color: AppColors.accent),
            ),
            const SizedBox(height: 24),
            Text('No record loaded',
                style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 8),
            Text(
              'Scan a patient’s tag to see their allergies, DNR status and '
              'medications here.',
              textAlign: TextAlign.center,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(color: AppColors.textSecondary, height: 1.5),
            ),
            const SizedBox(height: 24),
            PrimaryButton(
              label: 'Go to scan',
              icon: Icons.nfc_rounded,
              expanded: false,
              onPressed: onGoScan,
            ),
          ],
        ),
      ),
    );
  }
}
