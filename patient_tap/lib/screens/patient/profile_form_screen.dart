import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/blood_type.dart';
import '../../models/contact_ref.dart';
import '../../models/med_entry.dart';
import '../../state/patient_controller.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_theme.dart';
import '../../widgets/chip_input.dart';
import '../../widgets/labeled_card.dart';
import '../../widgets/primary_button.dart';

/// Patient profile onboarding form. Edits the draft held in
/// [PatientController]; a "Save & continue" button hands off to the Write tab.
class ProfileFormScreen extends StatelessWidget {
  const ProfileFormScreen({super.key, required this.onProceed});

  /// Switch to the Write-to-Tag tab.
  final VoidCallback onProceed;

  @override
  Widget build(BuildContext context) {
    final c = context.watch<PatientController>();
    final draft = c.draft;

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 120),
      children: [
        // Identity
        LabeledCard(
          title: 'Identity',
          icon: Icons.badge_rounded,
          child: Column(
            children: [
              TextFormField(
                initialValue: draft.name,
                onChanged: c.setName,
                textCapitalization: TextCapitalization.words,
                decoration: const InputDecoration(
                  labelText: 'Full name',
                  hintText: 'e.g. Arjun Mehta',
                ),
              ),
              const SizedBox(height: 12),
              TextFormField(
                initialValue: draft.patientId,
                onChanged: c.setPatientId,
                decoration: const InputDecoration(
                  labelText: 'Patient ID',
                  hintText: 'e.g. PT-0007',
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppTheme.s16),

        // Blood type
        LabeledCard(
          title: 'Blood Type',
          icon: Icons.bloodtype_rounded,
          child: DropdownButtonFormField<BloodType>(
            initialValue: draft.bloodType,
            decoration: const InputDecoration(),
            items: [
              for (final b in BloodType.values)
                DropdownMenuItem(value: b, child: Text(b.label)),
            ],
            onChanged: (b) => c.updateDraft(
                (p) => p.copyWith(bloodType: b ?? BloodType.unknown)),
          ),
        ),
        const SizedBox(height: AppTheme.s16),

        // Allergies
        LabeledCard(
          title: 'Allergies',
          icon: Icons.warning_amber_rounded,
          child: ChipInput(
            values: draft.allergies,
            hint: 'e.g. Penicillin',
            onAdd: c.addAllergy,
            onRemove: c.removeAllergy,
          ),
        ),
        const SizedBox(height: AppTheme.s16),

        // Medications
        LabeledCard(
          title: 'Medications',
          icon: Icons.medication_rounded,
          trailing: _AddButton(
            onTap: () async {
              final med = await _showMedSheet(context);
              if (med != null) c.addMedication(med);
            },
          ),
          child: draft.medications.isEmpty
              ? const _EmptyHint('No medications added yet.')
              : Column(
                  children: [
                    for (int i = 0; i < draft.medications.length; i++)
                      _RowTile(
                        title: draft.medications[i].name,
                        subtitle: [
                          draft.medications[i].dose,
                          draft.medications[i].frequency
                        ].where((s) => s.isNotEmpty).join('  ·  '),
                        onDelete: () => c.removeMedication(i),
                      ),
                  ],
                ),
        ),
        const SizedBox(height: AppTheme.s16),

        // DNR — prominent, warning styled.
        _DnrCard(
          value: draft.dnr,
          onChanged: c.setDnr,
        ),
        const SizedBox(height: AppTheme.s16),

        // Emergency contacts (up to 3)
        LabeledCard(
          title: 'Emergency Contacts',
          icon: Icons.contacts_rounded,
          trailing: draft.emergencyContacts.length >= 3
              ? null
              : _AddButton(
                  onTap: () async {
                    final contact = await _showContactSheet(context);
                    if (contact != null) c.addContact(contact);
                  },
                ),
          child: draft.emergencyContacts.isEmpty
              ? const _EmptyHint('Add up to 3 emergency contacts.')
              : Column(
                  children: [
                    for (int i = 0; i < draft.emergencyContacts.length; i++)
                      _RowTile(
                        title: draft.emergencyContacts[i].name,
                        subtitle: [
                          draft.emergencyContacts[i].phone,
                          draft.emergencyContacts[i].relation,
                        ].where((s) => s.isNotEmpty).join('  ·  '),
                        onDelete: () => c.removeContact(i),
                      ),
                  ],
                ),
        ),
        const SizedBox(height: AppTheme.s24),

        PrimaryButton(
          label: 'Save & continue to Write',
          icon: Icons.arrow_forward_rounded,
          onPressed: draft.name.trim().isEmpty ? null : onProceed,
        ),
        if (draft.name.trim().isEmpty)
          Padding(
            padding: const EdgeInsets.only(top: 10),
            child: Center(
              child: Text('Enter a name to continue',
                  style: Theme.of(context).textTheme.labelMedium),
            ),
          ),
      ],
    );
  }
}

// --- Add / edit sheets -------------------------------------------------------

Future<MedEntry?> _showMedSheet(BuildContext context) {
  final name = TextEditingController();
  final dose = TextEditingController();
  final freq = TextEditingController();
  return showModalBottomSheet<MedEntry>(
    context: context,
    isScrollControlled: true,
    backgroundColor: AppColors.surface,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
    ),
    builder: (ctx) => _SheetScaffold(
      title: 'Add medication',
      children: [
        TextField(
          controller: name,
          textCapitalization: TextCapitalization.words,
          decoration: const InputDecoration(labelText: 'Name', hintText: 'Metformin'),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: dose,
          decoration: const InputDecoration(labelText: 'Dose', hintText: '500mg'),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: freq,
          decoration:
              const InputDecoration(labelText: 'Frequency', hintText: '2x daily'),
        ),
        const SizedBox(height: 20),
        PrimaryButton(
          label: 'Add',
          onPressed: () {
            if (name.text.trim().isEmpty) return;
            Navigator.of(ctx).pop(MedEntry(
              name: name.text.trim(),
              dose: dose.text.trim(),
              frequency: freq.text.trim(),
            ));
          },
        ),
      ],
    ),
  );
}

Future<ContactRef?> _showContactSheet(BuildContext context) {
  final name = TextEditingController();
  final phone = TextEditingController();
  final relation = TextEditingController();
  return showModalBottomSheet<ContactRef>(
    context: context,
    isScrollControlled: true,
    backgroundColor: AppColors.surface,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
    ),
    builder: (ctx) => _SheetScaffold(
      title: 'Add emergency contact',
      children: [
        TextField(
          controller: name,
          textCapitalization: TextCapitalization.words,
          decoration:
              const InputDecoration(labelText: 'Name', hintText: 'Priya Mehta'),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: phone,
          keyboardType: TextInputType.phone,
          decoration: const InputDecoration(
              labelText: 'Phone', hintText: '+91 98765 43210'),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: relation,
          textCapitalization: TextCapitalization.words,
          decoration: const InputDecoration(
              labelText: 'Relation (optional)', hintText: 'Spouse'),
        ),
        const SizedBox(height: 20),
        PrimaryButton(
          label: 'Add',
          onPressed: () {
            if (name.text.trim().isEmpty || phone.text.trim().isEmpty) return;
            Navigator.of(ctx).pop(ContactRef(
              name: name.text.trim(),
              phone: phone.text.trim(),
              relation: relation.text.trim(),
            ));
          },
        ),
      ],
    ),
  );
}

// --- Small building blocks ---------------------------------------------------

class _SheetScaffold extends StatelessWidget {
  const _SheetScaffold({required this.title, required this.children});
  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(
        24,
        20,
        24,
        MediaQuery.of(context).viewInsets.bottom + 28,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 44,
              height: 5,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(999),
              ),
            ),
          ),
          const SizedBox(height: 18),
          Text(title, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 18),
          ...children,
        ],
      ),
    );
  }
}

class _AddButton extends StatelessWidget {
  const _AddButton({required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.accentSoft,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: const Padding(
          padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.add, size: 16, color: AppColors.accent),
              SizedBox(width: 4),
              Text('Add',
                  style: TextStyle(
                      color: AppColors.accent,
                      fontWeight: FontWeight.w700,
                      fontSize: 13)),
            ],
          ),
        ),
      ),
    );
  }
}

class _RowTile extends StatelessWidget {
  const _RowTile({
    required this.title,
    required this.subtitle,
    required this.onDelete,
  });
  final String title;
  final String subtitle;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: const TextStyle(fontWeight: FontWeight.w700)),
                if (subtitle.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(subtitle,
                      style: Theme.of(context).textTheme.labelMedium),
                ],
              ],
            ),
          ),
          IconButton(
            onPressed: onDelete,
            icon: const Icon(Icons.close_rounded,
                size: 18, color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }
}

class _EmptyHint extends StatelessWidget {
  const _EmptyHint(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Text(text, style: Theme.of(context).textTheme.labelMedium),
    );
  }
}

class _DnrCard extends StatelessWidget {
  const _DnrCard({required this.value, required this.onChanged});
  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return LabeledCard(
      color: value ? AppColors.dangerSoft : AppColors.surface,
      borderColor: value ? AppColors.danger : null,
      child: Row(
        children: [
          Icon(
            value ? Icons.dangerous_rounded : Icons.health_and_safety_rounded,
            color: value ? AppColors.danger : AppColors.textSecondary,
            size: 28,
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Do-Not-Resuscitate (DNR)',
                    style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 2),
                Text(
                  value
                      ? 'Responders will be warned prominently.'
                      : 'Full code — resuscitation permitted.',
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                        color: value ? AppColors.danger : AppColors.textSecondary,
                      ),
                ),
              ],
            ),
          ),
          Switch(
            value: value,
            activeThumbColor: AppColors.danger,
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }
}
