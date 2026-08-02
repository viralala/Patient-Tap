// F1 — manual profile creation/edit. Everything edits a draft; nothing is
// persisted until Save, so backing out never mutates the live profile.

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/patient_profile.dart';
import '../../state/app_state.dart';
import '../../theme/tokens.dart';
import '../../theme/type.dart';
import '../icons.dart';
import '../widgets/base.dart' as w;
import '../widgets/feedback.dart' as f;

class ProfileEditScreen extends StatefulWidget {
  const ProfileEditScreen({super.key});

  @override
  State<ProfileEditScreen> createState() => _ProfileEditScreenState();
}

class _ProfileEditScreenState extends State<ProfileEditScreen> {
  late PatientProfile _draft;
  late final TextEditingController _name;
  final TextEditingController _allergy = TextEditingController();

  @override
  void initState() {
    super.initState();
    _draft = context.read<AppState>().profile.copy();
    _name = TextEditingController(text: _draft.name);
  }

  @override
  void dispose() {
    _name.dispose();
    _allergy.dispose();
    super.dispose();
  }

  void _addAllergy() {
    final String v = _allergy.text.trim();
    if (v.isEmpty) return;
    if (!_draft.allergies.contains(v)) {
      setState(() => _draft.allergies.add(v));
    }
    _allergy.clear();
  }

  Future<void> _save() async {
    final AppState app = context.read<AppState>();
    _draft.name = _name.text.trim();
    await app.setProfile(_draft);
    if (!mounted) return;
    app.showToast('Profile saved', icon: Ico.check, iconColor: C.accent);
    app.closeRoute();
  }

  Future<void> _editMed(int? index) async {
    final MedEntry? result = await f.showAppSheet<MedEntry>(
      context: context,
      title: index == null ? 'Add medication' : 'Edit medication',
      builder: (BuildContext ctx) => _MedSheet(
        med: index == null ? null : _draft.medications[index].copy(),
        onDelete: index == null
            ? null
            : () {
                setState(() => _draft.medications.removeAt(index));
                Navigator.of(ctx).pop();
              },
      ),
    );
    if (result == null) return;
    setState(() {
      if (index == null) {
        _draft.medications.add(result);
      } else {
        _draft.medications[index] = result;
      }
    });
  }

  Future<void> _editContact(int? index) async {
    final ContactRef? result = await f.showAppSheet<ContactRef>(
      context: context,
      title: index == null ? 'Add contact' : 'Edit contact',
      builder: (BuildContext ctx) => _ContactSheet(
        contact: index == null ? null : _draft.emergencyContacts[index].copy(),
        onDelete: index == null
            ? null
            : () {
                setState(() => _draft.emergencyContacts.removeAt(index));
                Navigator.of(ctx).pop();
              },
      ),
    );
    if (result == null) return;
    setState(() {
      if (index == null) {
        _draft.emergencyContacts.add(result);
      } else {
        _draft.emergencyContacts[index] = result;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final AppState app = context.read<AppState>();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        w.NavHeader(
          title: 'Edit profile',
          onBack: app.closeRoute,
          trailing: GestureDetector(
            onTap: _save,
            behavior: HitTestBehavior.opaque,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
              child: Text('Save', style: T.link),
            ),
          ),
        ),
        Expanded(
          child: w.Screen(
            padTop: 8,
            children: <Widget>[
              w.Field(
                label: 'Full name',
                child: w.Input(
                  controller: _name,
                  hint: 'e.g. Aarav Mehta',
                  keyboardType: TextInputType.name,
                ),
              ),

              // ---- Blood type ----
              w.Field(
                label: 'Blood type',
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: kBloodTypes
                      .map((String bt) => w.Chip(
                            label: bt,
                            background: _draft.bloodType == bt
                                ? C.dangerSoft
                                : C.surfaceAlt,
                            foreground: _draft.bloodType == bt
                                ? C.danger
                                : C.textPrimary,
                            onTap: () => setState(() => _draft.bloodType =
                                _draft.bloodType == bt ? '' : bt),
                          ))
                      .toList(),
                ),
              ),

              // ---- Allergies ----
              w.Field(
                label: 'Allergies',
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: <Widget>[
                    Row(
                      children: <Widget>[
                        Expanded(
                          child: w.Input(
                            controller: _allergy,
                            hint: 'Add an allergy…',
                            onSubmitted: (_) => _addAllergy(),
                          ),
                        ),
                        const SizedBox(width: 8),
                        w.Btn(
                          label: 'Add',
                          kind: w.BtnKind.secondary,
                          icon: Ico.plus,
                          small: true,
                          expand: false,
                          onTap: _addAllergy,
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    if (_draft.allergies.isEmpty)
                      Text('No known allergies', style: T.captionMuted)
                    else
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: _draft.allergies
                            .map((String a) => w.Chip(
                                  label: a,
                                  background: C.dangerSoft,
                                  foreground: C.danger,
                                  onDelete: () => setState(
                                      () => _draft.allergies.remove(a)),
                                ))
                            .toList(),
                      ),
                  ],
                ),
              ),

              // ---- DNR ----
              w.CardAlt(
                child: Row(
                  children: <Widget>[
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: <Widget>[
                          Text('DNR — Do Not Resuscitate',
                              style: T.rowTitle),
                          const SizedBox(height: 1),
                          Text('Shown as a critical flag to responders',
                              style: T.rowSub),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    f.AppSwitch(
                      value: _draft.dnrFlag,
                      onChanged: (bool v) => setState(() => _draft.dnrFlag = v),
                    ),
                  ],
                ),
              ),

              // ---- Medications ----
              w.SectionTitle(
                'Medications',
                trailing: w.PillCta(
                  label: 'Add',
                  icon: Ico.plus,
                  onTap: () => _editMed(null),
                ),
              ),
              w.Card(
                child: w.Rows(
                  children: <Widget>[
                    if (_draft.medications.isEmpty)
                      const w.EmptyNote('No medications added')
                    else
                      for (int i = 0; i < _draft.medications.length; i++)
                        w.RowTile(
                          icon: Ico.pill,
                          title: _draft.medications[i].name,
                          subtitle: <String>[
                            _draft.medications[i].dose,
                            _draft.medications[i].frequency,
                          ].where((String s) => s.isNotEmpty).join(' · '),
                          divider: i != _draft.medications.length - 1,
                          onTap: () => _editMed(i),
                          trailing: const AppIcon(
                            Ico.chevronRight,
                            size: 18,
                            color: C.textMuted,
                          ),
                        ),
                  ],
                ),
              ),

              // ---- Emergency contacts ----
              w.SectionTitle(
                'Emergency contacts',
                trailing: _draft.emergencyContacts.length < 3
                    ? w.PillCta(
                        label: 'Add',
                        icon: Ico.plus,
                        onTap: () => _editContact(null),
                      )
                    : null,
              ),
              w.Card(
                child: w.Rows(
                  children: <Widget>[
                    if (_draft.emergencyContacts.isEmpty)
                      const w.EmptyNote('Add up to 3 contacts')
                    else
                      for (int i = 0;
                          i < _draft.emergencyContacts.length;
                          i++)
                        w.RowTile(
                          icon: Ico.contact,
                          tint: Tint.info,
                          title: i == 0
                              ? '${_draft.emergencyContacts[i].name}  (primary)'
                              : _draft.emergencyContacts[i].name,
                          subtitle: _draft.emergencyContacts[i].phone,
                          divider: i != _draft.emergencyContacts.length - 1,
                          onTap: () => _editContact(i),
                          trailing: const AppIcon(
                            Ico.chevronRight,
                            size: 18,
                            color: C.textMuted,
                          ),
                        ),
                  ],
                ),
              ),

              const SizedBox(height: 16),
              w.Btn(label: 'Save profile', onTap: _save),
            ],
          ),
        ),
      ],
    );
  }
}

// ------------------------------------------------------------ med sheet -----

class _MedSheet extends StatefulWidget {
  const _MedSheet({this.med, this.onDelete});
  final MedEntry? med;
  final VoidCallback? onDelete;

  @override
  State<_MedSheet> createState() => _MedSheetState();
}

class _MedSheetState extends State<_MedSheet> {
  late final TextEditingController _name =
      TextEditingController(text: widget.med?.name ?? '');
  late final TextEditingController _dose =
      TextEditingController(text: widget.med?.dose ?? '');
  late final TextEditingController _freq =
      TextEditingController(text: widget.med?.frequency ?? '');
  late bool _reminder = widget.med?.reminderEnabled ?? false;
  late String _time = widget.med?.reminderTime ?? '09:00';

  @override
  void dispose() {
    _name.dispose();
    _dose.dispose();
    _freq.dispose();
    super.dispose();
  }

  Future<void> _pickTime() async {
    final List<String> parts = _time.split(':');
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay(
        hour: int.tryParse(parts.first) ?? 9,
        minute: parts.length > 1 ? (int.tryParse(parts[1]) ?? 0) : 0,
      ),
      builder: (BuildContext ctx, Widget? child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.dark(
            primary: C.accent,
            onPrimary: C.accentInk,
            surface: C.surface,
            onSurface: C.textPrimary,
          ),
        ),
        child: child!,
      ),
    );
    if (picked != null) {
      setState(() => _time =
          '${picked.hour.toString().padLeft(2, '0')}:'
          '${picked.minute.toString().padLeft(2, '0')}');
    }
  }

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          w.Field(
            label: 'Name',
            child: w.Input(controller: _name, hint: 'e.g. Metformin'),
          ),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Expanded(
                child: w.Field(
                  label: 'Dose',
                  child: w.Input(controller: _dose, hint: '500mg'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: w.Field(
                  label: 'Frequency',
                  child: w.Input(controller: _freq, hint: 'Twice daily'),
                ),
              ),
            ],
          ),
          w.CardAlt(
            child: Row(
              children: <Widget>[
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      Text('Reminder', style: T.rowTitle),
                      const SizedBox(height: 1),
                      Text('Local notification, works offline',
                          style: T.rowSub),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                f.AppSwitch(
                  value: _reminder,
                  onChanged: (bool v) => setState(() => _reminder = v),
                ),
              ],
            ),
          ),
          if (_reminder) ...<Widget>[
            const SizedBox(height: 12),
            w.Field(
              label: 'Reminder time',
              child: w.Input(
                controller: TextEditingController(text: _time),
                readOnly: true,
                onTap: _pickTime,
              ),
            ),
          ],
          const SizedBox(height: 4),
          w.Btn(
            label: widget.med == null ? 'Add medication' : 'Save',
            onTap: _name.text.trim().isEmpty
                ? null
                : () => Navigator.of(context).pop(
                      MedEntry(
                        name: _name.text.trim(),
                        dose: _dose.text.trim(),
                        frequency: _freq.text.trim(),
                        reminderTime: _time,
                        reminderEnabled: _reminder,
                      ),
                    ),
          ),
          if (widget.onDelete != null) ...<Widget>[
            const SizedBox(height: 8),
            w.Btn(
              label: 'Delete',
              kind: w.BtnKind.ghost,
              color: C.danger,
              onTap: widget.onDelete,
            ),
          ],
        ],
      );
}

// -------------------------------------------------------- contact sheet -----

class _ContactSheet extends StatefulWidget {
  const _ContactSheet({this.contact, this.onDelete});
  final ContactRef? contact;
  final VoidCallback? onDelete;

  @override
  State<_ContactSheet> createState() => _ContactSheetState();
}

class _ContactSheetState extends State<_ContactSheet> {
  late final TextEditingController _name =
      TextEditingController(text: widget.contact?.name ?? '');
  late final TextEditingController _phone =
      TextEditingController(text: widget.contact?.phone ?? '');
  late final TextEditingController _email =
      TextEditingController(text: widget.contact?.email ?? '');

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _email.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          w.Field(
            label: 'Name',
            child: w.Input(
              controller: _name,
              hint: 'e.g. Priya Mehta',
              onChanged: (_) => setState(() {}),
            ),
          ),
          w.Field(
            label: 'Phone',
            child: w.Input(
              controller: _phone,
              hint: '+91 …',
              keyboardType: TextInputType.phone,
              onChanged: (_) => setState(() {}),
            ),
          ),
          w.Field(
            label: 'Email (optional)',
            child: w.Input(
              controller: _email,
              hint: 'For emergency alert emails',
              keyboardType: TextInputType.emailAddress,
            ),
          ),
          w.Btn(
            label: widget.contact == null ? 'Add contact' : 'Save',
            onTap: (_name.text.trim().isEmpty || _phone.text.trim().isEmpty)
                ? null
                : () => Navigator.of(context).pop(
                      ContactRef(
                        name: _name.text.trim(),
                        phone: _phone.text.trim(),
                        email: _email.text.trim().isEmpty
                            ? null
                            : _email.text.trim(),
                      ),
                    ),
          ),
          if (widget.onDelete != null) ...<Widget>[
            const SizedBox(height: 8),
            w.Btn(
              label: 'Delete',
              kind: w.BtnKind.ghost,
              color: C.danger,
              onTap: widget.onDelete,
            ),
          ],
        ],
      );
}
