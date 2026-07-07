import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../state/responder_controller.dart';
import '../../theme/app_colors.dart';
import '../../widgets/primary_button.dart';
import '../../widgets/pulsing_ring.dart';

/// Responder "Tap to Scan" screen. Simulated scanning animation, then hands off
/// to the decrypted record (via [onScanned]) or shows an error state.
class ScanScreen extends StatelessWidget {
  const ScanScreen({super.key, required this.onScanned});

  /// Called when a scan succeeds (switch to the Record tab).
  final VoidCallback onScanned;

  @override
  Widget build(BuildContext context) {
    final c = context.watch<ResponderController>();
    final status = c.scanStatus;

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
            _subtext(status, c.scanErrorMessage),
            textAlign: TextAlign.center,
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(color: AppColors.textSecondary, height: 1.5),
          ),
          const Spacer(),
          _Visual(status: status),
          const Spacer(),
          _Actions(status: status, controller: c, onScanned: onScanned),
        ],
      ),
    );
  }

  String _headline(ScanStatus s) {
    switch (s) {
      case ScanStatus.idle:
        return 'Tap to Scan';
      case ScanStatus.scanning:
        return 'Scanning…';
      case ScanStatus.decrypting:
        return 'Decrypting…';
      case ScanStatus.success:
        return 'Record Found';
      case ScanStatus.noTag:
        return 'No Tag Detected';
      case ScanStatus.tampered:
        return 'Integrity Warning';
    }
  }

  String _subtext(ScanStatus s, String? error) {
    switch (s) {
      case ScanStatus.idle:
        return 'Hold the phone flat against the patient’s wristband or card to '
            'read their medical record.';
      case ScanStatus.scanning:
        return 'Keep the phone still on the tag…';
      case ScanStatus.decrypting:
        return 'Verifying the AES-256-GCM auth tag and unpacking the record.';
      case ScanStatus.success:
        return 'Opening the patient’s critical information.';
      case ScanStatus.noTag:
      case ScanStatus.tampered:
        return error ?? 'Try scanning again.';
    }
  }
}

class _Visual extends StatelessWidget {
  const _Visual({required this.status});
  final ScanStatus status;

  @override
  Widget build(BuildContext context) {
    final busy =
        status == ScanStatus.scanning || status == ScanStatus.decrypting;

    Color ring;
    IconData icon;
    switch (status) {
      case ScanStatus.success:
        ring = AppColors.success;
        icon = Icons.check_rounded;
        break;
      case ScanStatus.tampered:
        ring = AppColors.danger;
        icon = Icons.gpp_bad_rounded;
        break;
      case ScanStatus.noTag:
        ring = AppColors.warning;
        icon = Icons.search_off_rounded;
        break;
      default:
        ring = AppColors.accent;
        icon = Icons.nfc_rounded;
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
    required this.onScanned,
  });
  final ScanStatus status;
  final ResponderController controller;
  final VoidCallback onScanned;

  @override
  Widget build(BuildContext context) {
    switch (status) {
      case ScanStatus.idle:
        return PrimaryButton(
          label: 'Tap to Scan',
          icon: Icons.nfc_rounded,
          onPressed: controller.scan,
        );
      case ScanStatus.scanning:
      case ScanStatus.decrypting:
        return const PrimaryButton(
          label: 'Scanning…',
          loading: true,
          onPressed: null,
        );
      case ScanStatus.success:
        return PrimaryButton(
          label: 'View record',
          icon: Icons.arrow_forward_rounded,
          color: AppColors.success,
          onPressed: onScanned,
        );
      case ScanStatus.noTag:
      case ScanStatus.tampered:
        return Column(
          children: [
            PrimaryButton(
              label: 'Scan again',
              icon: Icons.refresh_rounded,
              color: status == ScanStatus.tampered
                  ? AppColors.danger
                  : AppColors.accent,
              onPressed: controller.scan,
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: controller.resetScan,
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
