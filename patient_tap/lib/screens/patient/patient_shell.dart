import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../state/patient_controller.dart';
import '../../theme/app_colors.dart';
import '../../widgets/floating_bottom_nav.dart';
import '../../widgets/role_switch.dart';
import 'patient_dashboard_screen.dart';
import 'profile_form_screen.dart';
import 'write_to_tag_screen.dart';

/// Patient-mode shell: greeting header + role switch, three tabs (Profile /
/// Edit / Write) in an IndexedStack, and the floating bottom nav.
class PatientShell extends StatefulWidget {
  const PatientShell({super.key});

  @override
  State<PatientShell> createState() => _PatientShellState();
}

class _PatientShellState extends State<PatientShell> {
  int _index = 0;

  static const _tabs = [
    NavItem(icon: Icons.dashboard_rounded, label: 'Profile'),
    NavItem(icon: Icons.edit_rounded, label: 'Edit'),
    NavItem(icon: Icons.nfc_rounded, label: 'Write'),
  ];

  void _go(int i) => setState(() => _index = i);

  static const _titles = ['My Tag', 'Edit Profile', 'Write to Tag'];

  @override
  Widget build(BuildContext context) {
    final name = context.select<PatientController, String>(
      (c) => c.savedProfile?.name ?? c.draft.name,
    );

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            _Header(title: _titles[_index], name: name),
            Expanded(
              child: IndexedStack(
                index: _index,
                children: [
                  PatientDashboardScreen(onEdit: () => _go(1)),
                  ProfileFormScreen(onProceed: () => _go(2)),
                  WriteToTagScreen(onDone: () => _go(0)),
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
  const _Header({required this.title, required this.name});
  final String title;
  final String name;

  @override
  Widget build(BuildContext context) {
    final greeting = name.trim().isEmpty ? 'Welcome' : 'Hi, ${name.trim().split(' ').first}';
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 12),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(greeting,
                    style: Theme.of(context).textTheme.labelMedium),
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
