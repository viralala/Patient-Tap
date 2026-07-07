import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../state/responder_controller.dart';
import '../../theme/app_colors.dart';
import '../../widgets/floating_bottom_nav.dart';
import '../../widgets/role_switch.dart';
import 'add_log_entry_screen.dart';
import 'decrypted_profile_screen.dart';
import 'scan_screen.dart';
import 'treatment_log_screen.dart';

/// Responder-mode shell: header + role switch, three tabs (Scan / Record /
/// Log). Auto-switches to Record on a successful scan and surfaces the
/// non-blocking "emergency contact alerted" toast.
class ResponderShell extends StatefulWidget {
  const ResponderShell({super.key});

  @override
  State<ResponderShell> createState() => _ResponderShellState();
}

class _ResponderShellState extends State<ResponderShell> {
  int _index = 0;
  ResponderController? _controller;
  ScanStatus _prevScan = ScanStatus.idle;

  static const _tabs = [
    NavItem(icon: Icons.nfc_rounded, label: 'Scan'),
    NavItem(icon: Icons.badge_rounded, label: 'Record'),
    NavItem(icon: Icons.timeline_rounded, label: 'Log'),
  ];

  static const _titles = ['Scan Tag', 'Patient Record', 'Treatment Log'];

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final c = context.read<ResponderController>();
    if (!identical(_controller, c)) {
      _controller?.removeListener(_onControllerChange);
      _controller = c;
      _controller!.addListener(_onControllerChange);
    }
  }

  @override
  void dispose() {
    _controller?.removeListener(_onControllerChange);
    super.dispose();
  }

  void _onControllerChange() {
    final c = _controller!;

    // Auto-advance to the Record tab the moment a scan succeeds.
    if (_prevScan != ScanStatus.success &&
        c.scanStatus == ScanStatus.success) {
      if (mounted) setState(() => _index = 1);
    }
    _prevScan = c.scanStatus;

    // Non-blocking "contact alerted" toast.
    if (c.alertSent) {
      final name = c.alertedContactName;
      c.acknowledgeAlert();
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            behavior: SnackBarBehavior.floating,
            backgroundColor: AppColors.textPrimary,
            duration: const Duration(seconds: 3),
            content: Row(
              children: [
                const Icon(Icons.sms_rounded,
                    color: AppColors.success, size: 18),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    name == null
                        ? 'Emergency contact alerted'
                        : 'Alerted $name with location',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),
        );
      });
    }
  }

  void _go(int i) => setState(() => _index = i);

  Future<void> _openAddLog() async {
    await Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const AddLogEntryScreen()),
    );
    if (mounted) setState(() => _index = 2); // land on the Log after adding
  }

  @override
  Widget build(BuildContext context) {
    final name = context.select<ResponderController, String?>(
      (c) => c.profile?.name,
    );

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            _Header(title: _titles[_index], patientName: name),
            Expanded(
              child: IndexedStack(
                index: _index,
                children: [
                  ScanScreen(onScanned: () => _go(1)),
                  DecryptedProfileScreen(
                    onGoScan: () => _go(0),
                    onAddLog: _openAddLog,
                    onViewLog: () => _go(2),
                  ),
                  TreatmentLogScreen(
                    onGoScan: () => _go(0),
                    onAddLog: _openAddLog,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: FloatingBottomNav(
        items: _tabs,
        currentIndex: _index,
        onTap: _go,
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.title, required this.patientName});
  final String title;
  final String? patientName;

  @override
  Widget build(BuildContext context) {
    final sub = patientName == null || patientName!.isEmpty
        ? 'Responder mode'
        : 'Viewing: $patientName';
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 12),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(sub, style: Theme.of(context).textTheme.labelMedium),
                const SizedBox(height: 2),
                Text(title,
                    style: Theme.of(context)
                        .textTheme
                        .headlineMedium
                        ?.copyWith(color: AppColors.textPrimary)),
              ],
            ),
          ),
          const RoleSwitch(),
        ],
      ),
    );
  }
}
