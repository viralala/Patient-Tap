// ============================================================================
// F4 — selective write to a REAL NTAG215.
// User picks categories; a live budget meter tracks the 504-byte ceiling
// (F4.4); the write itself holds an NFC session open until a card arrives.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../config/app_config.dart';
import '../../core/local_store.dart';
import '../../core/nfc_service.dart';
import '../../models/patient_profile.dart';
import '../../state/app_state.dart';
import '../../theme/tokens.dart';
import '../../theme/type.dart';
import '../icons.dart';
import '../widgets/base.dart' as w;
import '../widgets/feedback.dart' as f;

enum _Phase { select, tapping, done, error }

class WriteTagScreen extends StatefulWidget {
  const WriteTagScreen({super.key});

  @override
  State<WriteTagScreen> createState() => _WriteTagScreenState();
}

class _WriteTagScreenState extends State<WriteTagScreen> {
  final WriteSelection _sel = WriteSelection.all();
  _Phase _phase = _Phase.select;
  String _errMsg = '';
  int _written = 0;

  @override
  void dispose() {
    // Never leave a polling session running behind us.
    NfcService.cancel();
    super.dispose();
  }

  String _count(WriteCategory k, PatientProfile p) => switch (k) {
        WriteCategory.allergies => '${p.allergies.length}',
        WriteCategory.medications => '${p.medications.length}',
        WriteCategory.contacts => '${p.emergencyContacts.length}',
        WriteCategory.log => '${p.treatmentLog.length}',
        WriteCategory.dnr => p.dnrFlag ? 'On' : 'Off',
        WriteCategory.basic => '',
      };

  String _iconFor(WriteCategory k) => switch (k) {
        WriteCategory.basic => Ico.contact,
        WriteCategory.allergies => Ico.drop,
        WriteCategory.medications => Ico.pill,
        WriteCategory.dnr => Ico.alert,
        WriteCategory.contacts => Ico.phone,
        WriteCategory.log => Ico.clock,
      };

  Future<void> _doWrite() async {
    final AppState app = context.read<AppState>();
    setState(() => _phase = _Phase.tapping);

    try {
      final int bytes = await NfcService.writeToTag(
        serializeForWrite(app.profile, _sel),
      );
      if (!mounted) return;
      setState(() {
        _written = bytes;
        _phase = _Phase.done;
      });
      app.showToast('Tag written', icon: Ico.check, iconColor: C.accent);
    } on TagError catch (e) {
      if (!mounted) return;
      setState(() {
        _errMsg = e.message;
        _phase = _Phase.error;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errMsg = 'Write failed. Try again.';
        _phase = _Phase.error;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final AppState app = context.watch<AppState>();
    final PatientProfile p = app.profile;
    final int size = estimateWriteSize(p, _sel);
    final bool over = size > kTagLimitBytes;

    switch (_phase) {
      case _Phase.tapping:
        return TapOverlay(
          title: 'Hold near the tag',
          sub: 'Keep your device steady over the wristband…',
          onCancel: () async {
            await NfcService.cancel();
            if (mounted) setState(() => _phase = _Phase.select);
          },
        );

      case _Phase.done:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            w.NavHeader(title: 'Write to tag', onBack: app.closeRoute),
            Expanded(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 32),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      const f.GlyphTile(
                        icon: Ico.checkCircle,
                        size: 88,
                        iconSize: 44,
                        background: C.accentSoft,
                      ),
                      const SizedBox(height: 18),
                      Text('Tag written', style: T.display(size: 26)),
                      const SizedBox(height: 8),
                      Text(
                        '$_written encrypted bytes are now on the card. '
                        'Re-scan in Responder mode to verify.',
                        textAlign: TextAlign.center,
                        style: T.caption(),
                      ),
                      const SizedBox(height: 24),
                      w.Btn(label: 'Done', onTap: app.closeRoute),
                    ],
                  ),
                ),
              ),
            ),
          ],
        );

      case _Phase.error:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            w.NavHeader(
              title: 'Write to tag',
              onBack: () => setState(() => _phase = _Phase.select),
            ),
            Expanded(
              child: w.Screen(
                children: <Widget>[
                  f.Banner(
                    kind: f.BannerKind.danger,
                    title: 'Write problem',
                    body: _errMsg,
                  ),
                  const SizedBox(height: 8),
                  w.Btn(label: 'Retry', onTap: _doWrite),
                  const SizedBox(height: 8),
                  w.Btn(
                    label: 'Change selection',
                    kind: w.BtnKind.ghost,
                    onTap: () => setState(() => _phase = _Phase.select),
                  ),
                ],
              ),
            ),
          ],
        );

      case _Phase.select:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            w.NavHeader(title: 'Write to tag', onBack: app.closeRoute),
            Expanded(
              child: w.Screen(
                padTop: 8,
                children: <Widget>[
                  // ---- Budget ----
                  w.Card(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: <Widget>[
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: <Widget>[
                            Text('Payload budget', style: T.headline),
                            const w.Badge(
                              'NTAG215',
                              icon: Ico.nfc,
                              tint: Tint.info,
                            ),
                          ],
                        ),
                        f.BudgetMeter(used: size, limit: kTagLimitBytes),
                        if (over) ...<Widget>[
                          const SizedBox(height: 10),
                          const f.Banner(
                            kind: f.BannerKind.danger,
                            title: 'Over the 504-byte limit',
                            body: 'Deselect lower-priority categories '
                                '(e.g. older treatment log entries) to fit.',
                            margin: EdgeInsets.zero,
                          ),
                        ],
                      ],
                    ),
                  ),

                  // ---- Category switches ----
                  const w.SectionTitle('Choose what to store'),
                  w.Card(
                    child: w.Rows(
                      children: <Widget>[
                        for (int i = 0;
                            i < kWriteCategoryMeta.length;
                            i++)
                          _CategoryRow(
                            meta: kWriteCategoryMeta[i],
                            count: _count(kWriteCategoryMeta[i].key, p),
                            icon: _iconFor(kWriteCategoryMeta[i].key),
                            value: _sel.of(kWriteCategoryMeta[i].key),
                            last: i == kWriteCategoryMeta.length - 1,
                            onChanged: (_) => setState(
                                () => _sel.toggle(kWriteCategoryMeta[i].key)),
                          ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 18),
                  w.Btn(
                    label: 'Write $size B to tag',
                    icon: Ico.nfc,
                    onTap: (over || !_sel.anySelected) ? null : _doWrite,
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Encrypted with AES-256-GCM before it leaves the phone. '
                    'Hold an NTAG215 card against the back of your device when '
                    'prompted.',
                    textAlign: TextAlign.center,
                    style: T.captionMuted,
                  ),
                ],
              ),
            ),
          ],
        );
    }
  }
}

class _CategoryRow extends StatelessWidget {
  const _CategoryRow({
    required this.meta,
    required this.count,
    required this.icon,
    required this.value,
    required this.onChanged,
    required this.last,
  });

  final WriteCategoryMeta meta;
  final String count;
  final String icon;
  final bool value;
  final ValueChanged<bool> onChanged;
  final bool last;

  @override
  Widget build(BuildContext context) {
    final bool critical = meta.key == WriteCategory.allergies ||
        meta.key == WriteCategory.dnr;

    return w.RowTile(
      icon: icon,
      tint: critical ? Tint.danger : Tint.accent,
      title: meta.label,
      divider: !last,
      subtitleWidget: RichText(
        text: TextSpan(
          style: T.rowSub,
          children: <InlineSpan>[
            if (count.isNotEmpty)
              TextSpan(
                text: '$count · ',
                style: T.mono(size: 13, color: C.textSecondary),
              ),
            TextSpan(text: meta.hint),
          ],
        ),
      ),
      trailing: f.AppSwitch(value: value, onChanged: onChanged),
    );
  }
}

/// The full-bleed "hold near the tag" state, shared with Responder mode.
class TapOverlay extends StatelessWidget {
  const TapOverlay({
    super.key,
    required this.title,
    required this.sub,
    this.onCancel,
  });

  final String title;
  final String sub;
  final VoidCallback? onCancel;

  @override
  Widget build(BuildContext context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              const Spacer(),
              const f.NfcRipple(),
              const SizedBox(height: 30),
              Text(title, style: T.display(size: 24)),
              const SizedBox(height: 8),
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 240),
                child: Text(
                  sub,
                  textAlign: TextAlign.center,
                  style: T.caption(),
                ),
              ),
              const Spacer(),
              if (onCancel != null)
                w.Btn(
                  label: 'Cancel',
                  kind: w.BtnKind.ghost,
                  onTap: onCancel,
                ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      );
}
