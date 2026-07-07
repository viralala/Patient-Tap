import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../state/patient_controller.dart';
import '../../theme/app_colors.dart';
import '../../widgets/primary_button.dart';
import '../../widgets/pulsing_ring.dart';

/// "Write to Tag" screen: a big write button, a simulated writing animation,
/// then a success or mock error state. Talks to the stubbed nfc/crypto layers
/// via [PatientController].
class WriteToTagScreen extends StatelessWidget {
  const WriteToTagScreen({super.key, required this.onDone});

  /// Called after a successful write (jump to the dashboard tab).
  final VoidCallback onDone;

  @override
  Widget build(BuildContext context) {
    final c = context.watch<PatientController>();
    final status = c.writeStatus;

    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 8, 24, 110),
      child: Column(
        children: [
          const SizedBox(height: 8),
          Text(
            _headline(status),
            textAlign: TextAlign.center,
            style: Theme.of(context)
                .textTheme
                .headlineMedium
                ?.copyWith(fontSize: 26),
          ),
          const SizedBox(height: 8),
          Text(
            _subtext(status, c.writeErrorMessage),
            textAlign: TextAlign.center,
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(color: AppColors.textSecondary, height: 1.5),
          ),
          const Spacer(),
          _Visual(status: status),
          const Spacer(),
          _Actions(status: status, controller: c, onDone: onDone),
        ],
      ),
    );
  }

  String _headline(WriteStatus s) {
    switch (s) {
      case WriteStatus.idle:
        return 'Write to Tag';
      case WriteStatus.encrypting:
        return 'Encrypting…';
      case WriteStatus.writing:
        return 'Hold Steady';
      case WriteStatus.success:
        return 'Saved to Tag';
      case WriteStatus.error:
        return 'Write Failed';
    }
  }

  String _subtext(WriteStatus s, String? error) {
    switch (s) {
      case WriteStatus.idle:
        return 'Place the wristband or card against the back of your phone, '
            'then tap below.';
      case WriteStatus.encrypting:
        return 'Sealing your record with AES-256-GCM before it touches the tag.';
      case WriteStatus.writing:
        return 'Keep the tag against the phone until this completes.';
      case WriteStatus.success:
        return 'Your medical record is now stored, encrypted, on the tag.';
      case WriteStatus.error:
        return error ?? 'Something went wrong. Try again.';
    }
  }
}

class _Visual extends StatelessWidget {
  const _Visual({required this.status});
  final WriteStatus status;

  @override
  Widget build(BuildContext context) {
    final busy =
        status == WriteStatus.encrypting || status == WriteStatus.writing;

    Color ring;
    IconData icon;
    switch (status) {
      case WriteStatus.success:
        ring = AppColors.success;
        icon = Icons.check_rounded;
        break;
      case WriteStatus.error:
        ring = AppColors.danger;
        icon = Icons.close_rounded;
        break;
      default:
        ring = AppColors.accent;
        icon = Icons.contactless_rounded;
    }

    return SizedBox(
      height: 240,
      width: 240,
      child: PulsingRing(
        color: ring,
        animate: busy,
        child: AnimatedSwitcher(
          duration: const Duration(milliseconds: 250),
          child: Icon(icon,
              key: ValueKey(icon), size: 72, color: Colors.white),
        ),
      ),
    );
  }
}

class _Actions extends StatelessWidget {
  const _Actions({
    required this.status,
    required this.controller,
    required this.onDone,
  });
  final WriteStatus status;
  final PatientController controller;
  final VoidCallback onDone;

  @override
  Widget build(BuildContext context) {
    switch (status) {
      case WriteStatus.idle:
        return PrimaryButton(
          label: 'Write to Tag',
          icon: Icons.nfc_rounded,
          onPressed: controller.writeToTag,
        );
      case WriteStatus.encrypting:
      case WriteStatus.writing:
        return const PrimaryButton(
          label: 'Writing…',
          loading: true,
          onPressed: null,
        );
      case WriteStatus.success:
        return Column(
          children: [
            PrimaryButton(
              label: 'View my tag',
              icon: Icons.dashboard_rounded,
              color: AppColors.success,
              onPressed: () {
                controller.resetWrite();
                onDone();
              },
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: controller.resetWrite,
              child: const Text('Write again',
                  style: TextStyle(
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w600)),
            ),
          ],
        );
      case WriteStatus.error:
        return Column(
          children: [
            PrimaryButton(
              label: 'Try again',
              icon: Icons.refresh_rounded,
              color: AppColors.danger,
              onPressed: controller.writeToTag,
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: controller.resetWrite,
              child: const Text('Cancel',
                  style: TextStyle(
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w600)),
            ),
          ],
        );
    }
  }
}
