// F3 — medication reminders, fully offline via Android local notifications.

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/reminder_service.dart';
import '../../models/patient_profile.dart';
import '../../state/app_state.dart';
import '../../theme/tokens.dart';
import '../../theme/type.dart';
import '../icons.dart';
import '../widgets/base.dart' as w;
import '../widgets/feedback.dart' as f;

class RemindersScreen extends StatefulWidget {
  const RemindersScreen({super.key});

  @override
  State<RemindersScreen> createState() => _RemindersScreenState();
}

class _RemindersScreenState extends State<RemindersScreen> {
  String _range = 'today';
  bool _granted = true;
  bool _exact = true;

  @override
  void initState() {
    super.initState();
    _refreshPermission();
  }

  Future<void> _refreshPermission() async {
    final bool g = await ReminderService.isPermissionGranted();
    final bool e = await ReminderService.canScheduleExact();
    if (mounted) {
      setState(() {
        _granted = g;
        _exact = e;
      });
    }
  }

  Future<void> _enable() async {
    final AppState app = context.read<AppState>();
    final bool ok = await ReminderService.ensurePermission();
    await _refreshPermission();
    if (!mounted) return;
    app.showToast(
      ok ? 'Notifications enabled' : 'Permission denied',
      icon: ok ? Ico.check : Ico.x,
      iconColor: ok ? C.accent : C.danger,
    );
    if (ok) await ReminderService.rescheduleAll(app.profile.medications);
  }

  Future<void> _toggle(String name, bool on) async {
    final AppState app = context.read<AppState>();
    final PatientProfile next = app.profile.copy();
    for (final MedEntry m in next.medications) {
      if (m.name == name) {
        m.reminderEnabled = on;
        if (on && (m.reminderTime == null || m.reminderTime!.isEmpty)) {
          m.reminderTime = '09:00';
        }
      }
    }
    await app.setProfile(next);
    if (on && !_granted) await _enable();
  }

  Future<void> _test() async {
    final AppState app = context.read<AppState>();
    final List<MedEntry> meds = app.profile.medications;
    final MedEntry m = meds.firstWhere(
      (MedEntry x) => x.reminderEnabled,
      orElse: () => meds.isNotEmpty
          ? meds.first
          : MedEntry(
              name: 'Metformin', dose: '500mg', frequency: 'Twice daily'),
    );
    if (!_granted) {
      await _enable();
      if (!_granted) return;
    }
    await ReminderService.fireTestReminder(m);
    if (mounted) {
      app.showToast('Test reminder in 4s…',
          icon: Ico.clock, iconColor: C.caution);
    }
  }

  static String _fmt(String hhmm) {
    final List<String> parts = hhmm.split(':');
    final int h = int.tryParse(parts.first) ?? 0;
    final int m = parts.length > 1 ? (int.tryParse(parts[1]) ?? 0) : 0;
    final String ap = h >= 12 ? 'PM' : 'AM';
    final int hh = h % 12 == 0 ? 12 : h % 12;
    return '$hh:${m.toString().padLeft(2, '0')} $ap';
  }

  static String _relative(String hhmm) {
    final Duration d =
        ReminderService.nextFireTime(hhmm).difference(DateTime.now());
    if (d.inHours > 0) return 'in ${d.inHours}h ${d.inMinutes % 60}m';
    return 'in ${d.inMinutes}m';
  }

  @override
  Widget build(BuildContext context) {
    final AppState app = context.watch<AppState>();
    final List<MedEntry> meds = app.profile.medications;
    final List<MedEntry> withReminders = meds
        .where((MedEntry m) =>
            m.reminderEnabled && (m.reminderTime?.isNotEmpty ?? false))
        .toList()
      ..sort((MedEntry a, MedEntry b) =>
          a.reminderTime!.compareTo(b.reminderTime!));

    return w.Screen(
      children: <Widget>[
        Padding(
          padding: const EdgeInsets.fromLTRB(2, 10, 2, 16),
          child: Text('Reminders', style: T.largeTitle),
        ),

        f.Segmented<String>(
          value: _range,
          onChanged: (String v) => setState(() => _range = v),
          options: const <f.SegmentOption<String>>[
            f.SegmentOption<String>('today', 'Today'),
            f.SegmentOption<String>('week', 'Week'),
            f.SegmentOption<String>('month', 'Month'),
          ],
        ),

        if (!_granted) ...<Widget>[
          const SizedBox(height: 14),
          const f.Banner(
            kind: f.BannerKind.amber,
            title: 'Turn on notifications',
            body: 'Reminders fire as offline local notifications — they work '
                'with no network, and even when the app is closed.',
            icon: Ico.bell,
          ),
          w.Btn(
            label: 'Enable notifications',
            kind: w.BtnKind.secondary,
            onTap: _enable,
          ),
        ] else if (!_exact) ...<Widget>[
          const SizedBox(height: 14),
          const f.Banner(
            kind: f.BannerKind.blue,
            title: 'Exact alarms are off',
            body: 'Android may batch your reminders by a few minutes. Grant '
                '"Alarms & reminders" in app settings for to-the-minute times.',
          ),
        ],

        const w.SectionTitle('Scheduled next'),
        if (withReminders.isEmpty)
          w.Card(
            padding: const EdgeInsets.all(26),
            child: Column(
              children: <Widget>[
                const AppIcon(Ico.clock, size: 30, color: C.textMuted),
                const SizedBox(height: 10),
                Text(
                  'No reminders yet. Add times to your medications.',
                  textAlign: TextAlign.center,
                  style: T.caption(),
                ),
              ],
            ),
          )
        else
          w.Card(
            child: w.Rows(
              children: <Widget>[
                for (int i = 0; i < withReminders.length; i++)
                  w.RowTile(
                    icon: Ico.pill,
                    tint: Tint.caution,
                    title: withReminders[i].name,
                    subtitle: <String>[
                      withReminders[i].dose,
                      withReminders[i].frequency,
                    ].where((String s) => s.isNotEmpty).join(' · '),
                    divider: i != withReminders.length - 1,
                    trailing: w.RowRight(
                      value: _fmt(withReminders[i].reminderTime!),
                      time: _relative(withReminders[i].reminderTime!),
                    ),
                  ),
              ],
            ),
          ),

        const w.SectionTitle('All medications'),
        w.Card(
          child: w.Rows(
            children: <Widget>[
              if (meds.isEmpty)
                const w.EmptyNote('No medications yet.')
              else
                for (int i = 0; i < meds.length; i++)
                  w.RowTile(
                    icon: Ico.pill,
                    title: meds[i].name,
                    subtitle: meds[i].reminderEnabled &&
                            (meds[i].reminderTime?.isNotEmpty ?? false)
                        ? 'Reminder at ${_fmt(meds[i].reminderTime!)}'
                        : 'No reminder',
                    divider: i != meds.length - 1,
                    trailing: f.AppSwitch(
                      value: meds[i].reminderEnabled,
                      onChanged: (bool v) => _toggle(meds[i].name, v),
                    ),
                  ),
            ],
          ),
        ),

        const SizedBox(height: 16),
        w.Btn(
          label: 'Add medication',
          kind: w.BtnKind.secondary,
          icon: Ico.plus,
          onTap: () => app.setRoute(AppRoute.profileEdit),
        ),
        const SizedBox(height: 8),
        w.Btn(
          label: 'Fire a test reminder',
          kind: w.BtnKind.ghost,
          icon: Ico.bell,
          onTap: _test,
        ),
      ],
    );
  }
}
