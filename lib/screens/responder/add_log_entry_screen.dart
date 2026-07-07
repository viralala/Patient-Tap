import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../models/log_entry.dart';
import '../../state/responder_controller.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_theme.dart';
import '../../widgets/circle_icon_button.dart';
import '../../widgets/labeled_card.dart';
import '../../widgets/primary_button.dart';

/// Add-treatment-log-entry form. Timestamp auto-fills; on save it appends the
/// entry via crypto, re-writes the tag via nfc, and syncs to the cloud — all
/// through the stubbed [ResponderController].
class AddLogEntryScreen extends StatefulWidget {
  const AddLogEntryScreen({super.key});

  @override
  State<AddLogEntryScreen> createState() => _AddLogEntryScreenState();
}

class _AddLogEntryScreenState extends State<AddLogEntryScreen> {
  final _action = TextEditingController();
  final _responderId = TextEditingController(text: 'PARAMEDIC-4471');
  late final DateTime _timestamp = DateTime.now();

  @override
  void initState() {
    super.initState();
    // Ensure a clean write state each time the screen opens.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ResponderController>().resetLogWrite();
    });
  }

  @override
  void dispose() {
    _action.dispose();
    _responderId.dispose();
    super.dispose();
  }

  bool get _valid =>
      _action.text.trim().isNotEmpty && _responderId.text.trim().isNotEmpty;

  Future<void> _save() async {
    final controller = context.read<ResponderController>();
    await controller.saveLogEntry(LogEntry(
      timestamp: _timestamp,
      responderId: _responderId.text.trim(),
      action: _action.text.trim(),
    ));

    if (!mounted) return;
    if (controller.logWriteStatus == LogWriteStatus.success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          behavior: SnackBarBehavior.floating,
          backgroundColor: AppColors.success,
          content: Text('Entry saved & tag re-written'),
        ),
      );
      Navigator.of(context).pop(true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final status = context.watch<ResponderController>().logWriteStatus;
    final error = context.watch<ResponderController>().logWriteError;
    final saving = status == LogWriteStatus.saving;

    return Scaffold(
      appBar: AppBar(
        centerTitle: true,
        leadingWidth: 64,
        leading: Padding(
          padding: const EdgeInsets.only(left: 16),
          child: CircleIconButton(
            icon: Icons.arrow_back_rounded,
            size: 40,
            background: AppColors.textPrimary,
            elevated: false,
            onPressed: () => Navigator.of(context).maybePop(),
          ),
        ),
        title: const Text('New Log Entry'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
          children: [
            LabeledCard(
              title: 'Action taken',
              icon: Icons.medical_information_rounded,
              child: TextField(
                controller: _action,
                minLines: 3,
                maxLines: 6,
                textCapitalization: TextCapitalization.sentences,
                onChanged: (_) => setState(() {}),
                decoration: const InputDecoration(
                  hintText: 'e.g. Administered 10mg morphine IV',
                ),
              ),
            ),
            const SizedBox(height: AppTheme.s16),
            LabeledCard(
              title: 'Responder ID',
              icon: Icons.badge_rounded,
              child: TextField(
                controller: _responderId,
                onChanged: (_) => setState(() {}),
                decoration: const InputDecoration(
                  hintText: 'e.g. PARAMEDIC-4471',
                ),
              ),
            ),
            const SizedBox(height: AppTheme.s16),
            LabeledCard(
              title: 'Timestamp',
              icon: Icons.schedule_rounded,
              trailing: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.successSoft,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: const Text('AUTO',
                    style: TextStyle(
                        color: AppColors.success,
                        fontWeight: FontWeight.w700,
                        fontSize: 11)),
              ),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  DateFormat('EEEE, d MMM yyyy · h:mm:ss a').format(_timestamp),
                  style: const TextStyle(
                      fontWeight: FontWeight.w600, fontSize: 15),
                ),
              ),
            ),
            if (status == LogWriteStatus.error && error != null) ...[
              const SizedBox(height: AppTheme.s16),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.dangerSoft,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.danger),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline_rounded,
                        color: AppColors.danger, size: 20),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(error,
                          style: const TextStyle(
                              color: AppColors.danger,
                              fontWeight: FontWeight.w600)),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: AppTheme.s24),
            PrimaryButton(
              label: saving ? 'Saving…' : 'Save & Re-write Tag',
              icon: Icons.nfc_rounded,
              loading: saving,
              onPressed: _valid ? _save : null,
            ),
          ],
        ),
      ),
    );
  }
}
