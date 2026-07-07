import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../models/log_entry.dart';
import '../../models/patient_profile.dart';
import '../../state/responder_controller.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_theme.dart';
import '../../widgets/labeled_card.dart';
import '../../widgets/primary_button.dart';
import '../../widgets/segmented_control.dart';

/// Treatment-log detail view. Reuses the reference "detail screen" pattern:
/// a hero stat card, a card whose chart is adapted into a scrollable timeline
/// of entries, a row of summary stats, and a segmented range control.
class TreatmentLogScreen extends StatefulWidget {
  const TreatmentLogScreen({
    super.key,
    required this.onGoScan,
    required this.onAddLog,
  });

  final VoidCallback onGoScan;
  final VoidCallback onAddLog;

  @override
  State<TreatmentLogScreen> createState() => _TreatmentLogScreenState();
}

class _TreatmentLogScreenState extends State<TreatmentLogScreen> {
  int _range = 0; // 0 All · 1 Today · 2 Week
  static const _ranges = ['All', 'Today', 'This Week'];

  bool _inRange(LogEntry e) {
    final now = DateTime.now();
    switch (_range) {
      case 1:
        return e.timestamp.year == now.year &&
            e.timestamp.month == now.month &&
            e.timestamp.day == now.day;
      case 2:
        return e.timestamp.isAfter(now.subtract(const Duration(days: 7)));
      default:
        return true;
    }
  }

  @override
  Widget build(BuildContext context) {
    final profile = context.watch<ResponderController>().profile;

    if (profile == null) {
      return _Empty(
        title: 'No record loaded',
        message: 'Scan a patient’s tag to view their treatment log.',
        cta: 'Go to scan',
        onCta: widget.onGoScan,
      );
    }

    final entries = [...profile.treatmentLog]
        .where(_inRange)
        .toList()
      ..sort((a, b) => b.timestamp.compareTo(a.timestamp)); // newest first

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 120),
      children: [
        _Hero(profile: profile),
        const SizedBox(height: AppTheme.s16),

        // Segmented range control.
        SegmentedControl(
          segments: _ranges,
          selectedIndex: _range,
          onChanged: (i) => setState(() => _range = i),
        ),
        const SizedBox(height: AppTheme.s16),

        // Timeline card (the "chart" adapted into a scrollable list).
        LabeledCard(
          title: 'Chain of Custody',
          icon: Icons.timeline_rounded,
          child: entries.isEmpty
              ? Align(
                  alignment: Alignment.centerLeft,
                  child: Text('No entries in this range.',
                      style: Theme.of(context).textTheme.labelMedium),
                )
              : Column(
                  children: [
                    for (int i = 0; i < entries.length; i++)
                      _TimelineTile(
                        entry: entries[i],
                        isLast: i == entries.length - 1,
                      ),
                  ],
                ),
        ),
        const SizedBox(height: AppTheme.s16),

        // Summary stats row (avg/min/max style, adapted).
        _SummaryRow(entries: profile.treatmentLog),
        const SizedBox(height: AppTheme.s24),

        PrimaryButton(
          label: 'Add entry',
          icon: Icons.add_rounded,
          onPressed: widget.onAddLog,
        ),
      ],
    );
  }
}

class _Hero extends StatelessWidget {
  const _Hero({required this.profile});
  final PatientProfile profile;

  @override
  Widget build(BuildContext context) {
    final log = profile.treatmentLog;
    final last = log.isEmpty
        ? null
        : log.reduce((a, b) => a.timestamp.isAfter(b.timestamp) ? a : b);
    final lastLabel = last == null
        ? 'No entries yet'
        : 'Last: ${DateFormat('d MMM, h:mm a').format(last.timestamp)}';

    return LabeledCard(
      color: AppColors.textPrimary,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('TREATMENT LOG',
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: Colors.white.withValues(alpha: 0.7),
                  )),
          const SizedBox(height: 10),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text('${log.length}',
                  style: Theme.of(context)
                      .textTheme
                      .displayLarge
                      ?.copyWith(color: Colors.white)),
              const SizedBox(width: 8),
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Text('entries',
                    style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.7),
                        fontSize: 16,
                        fontWeight: FontWeight.w600)),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(lastLabel,
              style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.7),
                  fontSize: 13,
                  fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({required this.entries});
  final List<LogEntry> entries;

  @override
  Widget build(BuildContext context) {
    final responders = entries.map((e) => e.responderId).toSet().length;
    String span = '—';
    if (entries.length > 1) {
      final sorted = [...entries]
        ..sort((a, b) => a.timestamp.compareTo(b.timestamp));
      final mins =
          sorted.last.timestamp.difference(sorted.first.timestamp).inMinutes;
      span = mins >= 60 ? '${(mins / 60).toStringAsFixed(1)}h' : '${mins}m';
    }

    return Row(
      children: [
        Expanded(child: _SummaryStat(label: 'Entries', value: '${entries.length}')),
        Expanded(child: _SummaryStat(label: 'Responders', value: '$responders')),
        Expanded(child: _SummaryStat(label: 'Span', value: span)),
      ],
    );
  }
}

/// A plain centered column (label / big number) — the reference's avg/min/max
/// summary style, no card.
class _SummaryStat extends StatelessWidget {
  const _SummaryStat({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(label.toUpperCase(),
            style: Theme.of(context).textTheme.labelSmall),
        const SizedBox(height: 6),
        Text(value,
            style: Theme.of(context)
                .textTheme
                .headlineMedium
                ?.copyWith(fontSize: 30)),
      ],
    );
  }
}

class _TimelineTile extends StatelessWidget {
  const _TimelineTile({required this.entry, required this.isLast});
  final LogEntry entry;
  final bool isLast;

  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Timeline rail.
          Column(
            children: [
              Container(
                width: 12,
                height: 12,
                margin: const EdgeInsets.only(top: 4),
                decoration: const BoxDecoration(
                  color: AppColors.accent,
                  shape: BoxShape.circle,
                ),
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    color: AppColors.border,
                    margin: const EdgeInsets.symmetric(vertical: 4),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: isLast ? 0 : 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        DateFormat('d MMM · h:mm a').format(entry.timestamp),
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 13,
                        ),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.accentSoft,
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          entry.responderId,
                          style: const TextStyle(
                            color: AppColors.accent,
                            fontWeight: FontWeight.w700,
                            fontSize: 11,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(entry.action,
                      style: Theme.of(context)
                          .textTheme
                          .bodyMedium
                          ?.copyWith(height: 1.4)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Empty extends StatelessWidget {
  const _Empty({
    required this.title,
    required this.message,
    required this.cta,
    required this.onCta,
  });
  final String title;
  final String message;
  final String cta;
  final VoidCallback onCta;

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
              child: const Icon(Icons.timeline_rounded,
                  size: 56, color: AppColors.accent),
            ),
            const SizedBox(height: 24),
            Text(title, style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 8),
            Text(message,
                textAlign: TextAlign.center,
                style: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.copyWith(color: AppColors.textSecondary, height: 1.5)),
            const SizedBox(height: 24),
            PrimaryButton(
                label: cta, expanded: false, onPressed: onCta),
          ],
        ),
      ),
    );
  }
}
