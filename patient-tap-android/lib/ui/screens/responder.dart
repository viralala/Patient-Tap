// ============================================================================
// F7–F12 — Responder mode. No login required (F7 / PRD §6.1).
//
// Scan a real card → decrypt on-device → critical-first display → log a
// treatment with a live conflict check (F10) → write the updated log back to
// the card (F11) → alert the patient's emergency contacts with a GPS fix (F12).
// ============================================================================

import 'dart:math';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../backend/backend_service.dart';
import '../../core/alert_service.dart';
import '../../core/conflict_checker.dart';
import '../../core/local_store.dart';
import '../../core/nfc_service.dart';
import '../../models/patient_profile.dart';
import '../../state/app_state.dart';
import '../../theme/tokens.dart';
import '../../theme/type.dart';
import '../icons.dart';
import '../widgets/base.dart' as w;
import '../widgets/feedback.dart' as f;
import 'write_tag.dart' show TapOverlay;

enum _Phase { idle, scanning, loaded, error }

/// Common field medications — one tap to log, conflict-checked live.
const List<({String name, String dose})> _quickMeds =
    <({String name, String dose})>[
  (name: 'Adrenaline', dose: '0.5mg IM'),
  (name: 'Aspirin', dose: '300mg PO'),
  (name: 'Morphine', dose: '5mg IV'),
  (name: 'Amoxicillin', dose: '500mg PO'),
  (name: 'Saline', dose: '500ml IV'),
  (name: 'Glucose 10%', dose: '150ml IV'),
];

class ResponderScreen extends StatefulWidget {
  const ResponderScreen({super.key});

  @override
  State<ResponderScreen> createState() => _ResponderScreenState();
}

class _ResponderScreenState extends State<ResponderScreen> {
  late final String _responderId =
      'EMT-${1000 + Random().nextInt(9000)}';

  _Phase _phase = _Phase.idle;
  PatientProfile? _patient;
  bool _training = false;
  String _errMsg = '';
  AlertResult? _alert;
  int _readMs = 0;

  @override
  void dispose() {
    NfcService.cancel();
    super.dispose();
  }

  // ---- Scan ----------------------------------------------------------------
  Future<void> _scan() async {
    final AppState app = context.read<AppState>();
    setState(() {
      _phase = _Phase.scanning;
      _alert = null;
      _training = false;
    });

    final Stopwatch sw = Stopwatch()..start();
    try {
      final String json = await NfcService.readFromTag();
      final PatientProfile p = deserializeFromTag(json);
      sw.stop();
      if (!mounted) return;
      setState(() {
        _patient = p;
        _readMs = sw.elapsedMilliseconds;
        _phase = _Phase.loaded;
      });
      await _afterLoad(app, p);
    } on TagError catch (e) {
      if (!mounted) return;
      setState(() {
        _errMsg = e.message;
        _phase = _Phase.error;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _errMsg = 'Could not read tag.';
        _phase = _Phase.error;
      });
    }
  }

  /// Server audit + contact alerts, all best-effort so a failure never blocks
  /// the responder from seeing the medical data.
  Future<void> _afterLoad(AppState app, PatientProfile p) async {
    final GeoFix? fix = await AlertService.getLocation();

    unawaitedCall(BackendService.logScanEvent(
      patientPublicId: p.patientId,
      responderId: _responderId,
      responderLabel: 'Responder',
      lat: fix?.lat,
      lng: fix?.lng,
    ));

    unawaitedCall(BackendService.notifyEmergencyContacts(
      patientPublicId: p.patientId,
      patientName: p.name.isEmpty ? null : p.name,
      message: "${p.name.isEmpty ? 'A Patient-Tap user' : p.name}'s emergency "
          'tag was just scanned by $_responderId.',
      lat: fix?.lat,
      lng: fix?.lng,
    ));

    // F12 — local: alert the primary emergency contact with GPS.
    if (p.emergencyContacts.isNotEmpty) {
      final ContactRef c = p.emergencyContacts.first;
      final AlertResult res = AlertResult(
        contact: c,
        body: AlertService.composeBody(p.name, fix),
        sentAt: DateTime.now(),
        fix: fix,
      );
      if (mounted) setState(() => _alert = res);
    }
  }

  void unawaitedCall(Future<Object?> future) {
    future.catchError((Object _) => null);
  }

  /// Fallback so the responder flow is never a dead end when no card is around.
  void _loadTraining() {
    final AppState app = context.read<AppState>();
    setState(() {
      _patient = demoProfile();
      _training = true;
      _readMs = 0;
      _alert = null;
      _phase = _Phase.loaded;
    });
    app.showToast('Training patient loaded', icon: Ico.stethoscope);
  }

  /// Read the last payload this device saw, without a card present.
  Future<void> _loadFromMirror() async {
    final AppState app = context.read<AppState>();
    try {
      final String json = await NfcService.readFromMirror();
      if (!mounted) return;
      setState(() {
        _patient = deserializeFromTag(json);
        _training = false;
        _readMs = 0;
        _phase = _Phase.loaded;
      });
      app.showToast('Loaded last known payload', icon: Ico.info);
    } on TagError catch (e) {
      app.showToast(e.message, icon: Ico.x, iconColor: C.danger);
    }
  }

  // ---- Log a treatment -----------------------------------------------------
  Future<void> _onLogged(LogEntry entry) async {
    final AppState app = context.read<AppState>();
    final PatientProfile? current = _patient;
    if (current == null) return;

    final PatientProfile next = current.copy()
      ..treatmentLog.insert(0, entry);
    setState(() => _patient = next);

    // Push the E2E-encrypted entry to the cloud for the patient's audit trail.
    unawaitedCall(BackendService.syncLogEntry(current.patientId, entry));

    // F11 — write the updated profile back to the card.
    if (_training) {
      app.showToast('Logged (training — not written)', icon: Ico.info);
      return;
    }

    setState(() => _phase = _Phase.scanning);
    try {
      await NfcService.writeToTag(serializeForWrite(next, WriteSelection.all()));
      if (!mounted) return;
      setState(() => _phase = _Phase.loaded);
      app.showToast('Log written back to tag',
          icon: Ico.check, iconColor: C.accent);
    } catch (_) {
      if (!mounted) return;
      setState(() => _phase = _Phase.loaded);
      app.showToast('Log saved locally — tag write skipped', icon: Ico.info);
    }
  }

  Future<void> _openLogSheet() async {
    final PatientProfile? p = _patient;
    if (p == null) return;
    final LogEntry? entry = await f.showAppSheet<LogEntry>(
      context: context,
      title: 'Log treatment',
      builder: (BuildContext ctx) =>
          _LogSheet(patient: p, responderId: _responderId),
    );
    if (entry != null) await _onLogged(entry);
  }

  // ---- Build ---------------------------------------------------------------
  @override
  Widget build(BuildContext context) {
    switch (_phase) {
      case _Phase.scanning:
        return TapOverlay(
          title: 'Scanning tag',
          sub: "Reading and decrypting the patient's profile…",
          onCancel: () async {
            await NfcService.cancel();
            if (mounted) {
              setState(() =>
                  _phase = _patient == null ? _Phase.idle : _Phase.loaded);
            }
          },
        );

      case _Phase.idle:
      case _Phase.error:
        return _IdleView(
          error: _phase == _Phase.error ? _errMsg : null,
          hasMirror: LocalStore.tagIsSetUp(),
          onScan: _scan,
          onTraining: _loadTraining,
          onMirror: _loadFromMirror,
        );

      case _Phase.loaded:
        return _LoadedView(
          patient: _patient!,
          training: _training,
          readMs: _readMs,
          alert: _alert,
          onLog: _openLogSheet,
          onRescan: () => setState(() {
            _phase = _Phase.idle;
            _patient = null;
            _alert = null;
          }),
        );
    }
  }
}

// ---------------------------------------------------------------- idle -----

class _IdleView extends StatelessWidget {
  const _IdleView({
    required this.error,
    required this.hasMirror,
    required this.onScan,
    required this.onTraining,
    required this.onMirror,
  });

  final String? error;
  final bool hasMirror;
  final VoidCallback onScan;
  final VoidCallback onTraining;
  final VoidCallback onMirror;

  @override
  Widget build(BuildContext context) => w.Screen(
        padTop: 14,
        children: <Widget>[
          const Padding(
            padding: EdgeInsets.only(left: 2, bottom: 4),
            child: w.Eyebrow('Responder mode'),
          ),
          Padding(
            padding: const EdgeInsets.only(left: 2, bottom: 16),
            child: Text('Scan a patient', style: T.largeTitle),
          ),
          if (error != null)
            f.Banner(
              kind: f.BannerKind.danger,
              title: 'Scan failed',
              body: error,
            ),

          // ---- The big tap target ----
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 18),
            child: Center(
              child: GestureDetector(
                onTap: onScan,
                behavior: HitTestBehavior.opaque,
                child: Column(
                  children: <Widget>[
                    const f.NfcRipple(size: 150, iconSize: 64),
                    const SizedBox(height: 18),
                    Text('Tap to scan patient tag', style: T.headline),
                    const SizedBox(height: 8),
                    ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 240),
                      child: Text(
                        'No login needed — decrypts on-device in under '
                        '2 seconds.',
                        textAlign: TextAlign.center,
                        style: T.caption(),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          const SizedBox(height: 8),
          if (hasMirror)
            w.Btn(
              label: 'Use last known payload',
              kind: w.BtnKind.secondary,
              icon: Ico.clock,
              onTap: onMirror,
            )
          else
            const f.Banner(
              kind: f.BannerKind.amber,
              title: 'No card scanned yet',
              body: 'Write a profile from the Tag screen first — or use a '
                  'training patient below.',
            ),
          const SizedBox(height: 10),
          w.Btn(
            label: 'Load training patient',
            kind: w.BtnKind.secondary,
            icon: Ico.stethoscope,
            onTap: onTraining,
          ),
        ],
      );
}

// -------------------------------------------------------------- loaded -----

class _LoadedView extends StatelessWidget {
  const _LoadedView({
    required this.patient,
    required this.training,
    required this.readMs,
    required this.alert,
    required this.onLog,
    required this.onRescan,
  });

  final PatientProfile patient;
  final bool training;
  final int readMs;
  final AlertResult? alert;
  final VoidCallback onLog;
  final VoidCallback onRescan;

  @override
  Widget build(BuildContext context) {
    final PatientProfile p = patient;

    return w.Screen(
      padTop: 12,
      children: <Widget>[
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: <Widget>[
            w.Eyebrow(training ? 'Training patient' : 'Tag scan · decrypted'),
            if (training)
              const w.Badge('TRAINING', tint: Tint.caution)
            else
              w.Badge(
                readMs > 0 ? '${readMs}ms' : 'offline copy',
                icon: Ico.checkCircle,
                tint: Tint.accent,
              ),
          ],
        ),
        const SizedBox(height: 12),

        // ---- Critical-first: DNR + allergies (F8) ----
        if (p.dnrFlag)
          const f.Banner(
            kind: f.BannerKind.danger,
            title: 'DNR — do not resuscitate',
            titleSize: 16,
          ),
        if (p.allergies.isNotEmpty)
          f.Banner(
            kind: f.BannerKind.danger,
            title: 'Allergies',
            body: p.allergies.join(' · '),
            icon: Ico.drop,
            titleSize: 16,
            bodySize: 14,
          ),

        // ---- Identity ----
        const SizedBox(height: 4),
        ClipRRect(
          borderRadius: R.cardR,
          child: Container(
            decoration: heroDecoration(),
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                Text(
                  p.name.isEmpty ? 'Unknown patient' : p.name,
                  style: T.display(size: 27),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: <Widget>[
                    w.Badge(
                      p.bloodType.isEmpty ? 'blood —' : p.bloodType,
                      icon: Ico.drop,
                      tint: Tint.danger,
                    ),
                    w.Badge(p.patientId),
                  ],
                ),
              ],
            ),
          ),
        ),

        // ---- Primary action — impossible to miss (F9) ----
        const SizedBox(height: 12),
        w.Btn(label: 'Log treatment', icon: Ico.plus, onTap: onLog),
        const SizedBox(height: 8),
        Text(
          "Conflict-checked against allergies and recent doses before it's "
          'written.',
          textAlign: TextAlign.center,
          style: T.captionMuted,
        ),

        // ---- Alert to contact (F12) ----
        if (alert != null) ...<Widget>[
          const SizedBox(height: 14),
          _AlertCard(alert: alert!),
        ],

        // ---- Medications ----
        const w.SectionTitle('Current medications'),
        w.Card(
          child: w.Rows(
            children: <Widget>[
              if (p.medications.isEmpty)
                const w.EmptyNote('None on record')
              else
                for (int i = 0; i < p.medications.length; i++)
                  w.RowTile(
                    icon: Ico.pill,
                    title: p.medications[i].name,
                    subtitle: <String>[
                      p.medications[i].dose,
                      p.medications[i].frequency,
                    ].where((String s) => s.isNotEmpty).join(' · '),
                    divider: i != p.medications.length - 1,
                  ),
            ],
          ),
        ),

        // ---- Treatment log ----
        w.SectionTitle(
          'Treatment log',
          trailing:
              w.PillCta(label: 'Add entry', icon: Ico.plus, onTap: onLog),
        ),
        w.Card(
          child: w.Rows(
            children: <Widget>[
              if (p.treatmentLog.isEmpty)
                const w.EmptyNote(
                  'No entries yet — every dose logged here travels with the '
                  'patient on the tag.',
                )
              else
                for (int i = 0; i < p.treatmentLog.length; i++)
                  w.RowTile(
                    icon: Ico.stethoscope,
                    tint: Tint.info,
                    title: p.treatmentLog[i].action,
                    titleWraps: true,
                    divider: i != p.treatmentLog.length - 1,
                    subtitleWidget: Text(
                      p.treatmentLog[i].responderId,
                      style: T.mono(size: 13, color: C.textSecondary),
                    ),
                    trailing: Text(
                      DateFormat('HH:mm').format(p.treatmentLog[i].time),
                      style: T.rowTime,
                    ),
                  ),
            ],
          ),
        ),

        const SizedBox(height: 14),
        w.Btn(
          label: 'Scan another tag',
          kind: w.BtnKind.secondary,
          icon: Ico.arrowSwap,
          onTap: onRescan,
        ),
      ],
    );
  }
}

class _AlertCard extends StatelessWidget {
  const _AlertCard({required this.alert});
  final AlertResult alert;

  @override
  Widget build(BuildContext context) => w.Card(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: <Widget>[
                Expanded(
                    child: Text('Emergency contact alerted',
                        style: T.headline)),
                const AppIcon(Ico.message, size: 20, color: C.accent),
              ],
            ),
            const SizedBox(height: 6),
            RichText(
              text: TextSpan(
                style: T.caption(),
                children: <InlineSpan>[
                  TextSpan(text: '${alert.contact.name} · '),
                  TextSpan(
                    text: alert.contact.phone,
                    style: T.mono(size: 13, color: C.textSecondary),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 6),
            w.CardAlt(
              child: Text(
                alert.body,
                style: T.body.copyWith(fontSize: 13, height: 1.45),
              ),
            ),
            const SizedBox(height: 10),
            if (alert.fix != null)
              w.Btn(
                label: 'View GPS location',
                kind: w.BtnKind.secondary,
                icon: Ico.map,
                small: true,
                onTap: () => AlertService.openMaps(alert.fix!),
              )
            else
              Text(
                'GPS unavailable — location permission denied.',
                style: T.captionMuted,
              ),
            const SizedBox(height: 6),
            Row(
              children: <Widget>[
                Expanded(
                  child: w.Btn(
                    label: 'Send SMS',
                    kind: w.BtnKind.ghost,
                    icon: Ico.message,
                    small: true,
                    onTap: () => AlertService.openSms(
                        alert.contact.phone, alert.body),
                  ),
                ),
                Expanded(
                  child: w.Btn(
                    label: 'Call',
                    kind: w.BtnKind.ghost,
                    icon: Ico.phone,
                    small: true,
                    onTap: () =>
                        AlertService.openDialer(alert.contact.phone),
                  ),
                ),
              ],
            ),
          ],
        ),
      );
}

// ------------------------------------------------------------ log sheet -----

/// F9 + F10 — add a treatment entry with a live conflict check.
class _LogSheet extends StatefulWidget {
  const _LogSheet({required this.patient, required this.responderId});
  final PatientProfile patient;
  final String responderId;

  @override
  State<_LogSheet> createState() => _LogSheetState();
}

class _LogSheetState extends State<_LogSheet> {
  final TextEditingController _drug = TextEditingController();
  final TextEditingController _dose = TextEditingController();
  ConflictResult? _conflict;

  @override
  void dispose() {
    _drug.dispose();
    _dose.dispose();
    super.dispose();
  }

  void _onDrugChanged(String v, {String? dose}) {
    if (dose != null) _dose.text = dose;
    setState(() {
      _conflict =
          v.trim().isEmpty ? null : checkConflict(widget.patient, v);
    });
  }

  void _submit() {
    final String d = _drug.text.trim();
    final String dose = _dose.text.trim();
    Navigator.of(context).pop(
      LogEntry(
        timestamp: DateTime.now().millisecondsSinceEpoch,
        responderId: widget.responderId,
        action: 'Administered $d${dose.isEmpty ? '' : ' $dose'}',
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool blocked = _conflict?.level == ConflictLevel.danger;
    final bool hasDrug = _drug.text.trim().isNotEmpty;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        const Padding(
          padding: EdgeInsets.only(left: 2, bottom: 8),
          child: w.Eyebrow('Quick select'),
        ),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _quickMeds
              .map((({String dose, String name}) m) => w.Chip(
                    label: m.name,
                    selected: _drug.text == m.name,
                    onTap: () {
                      _drug.text = m.name;
                      _onDrugChanged(m.name, dose: m.dose);
                    },
                  ))
              .toList(),
        ),
        const SizedBox(height: 14),

        w.Field(
          label: 'Medication or action',
          child: w.Input(
            controller: _drug,
            hint: 'Type a drug name…',
            autofocus: true,
            onChanged: _onDrugChanged,
          ),
        ),
        w.Field(
          label: 'Dose',
          child: w.Input(
            controller: _dose,
            hint: 'e.g. 500mg IV',
            onChanged: (_) => setState(() {}),
          ),
        ),

        if (_conflict != null && hasDrug)
          f.Banner(
            kind: switch (_conflict!.level) {
              ConflictLevel.danger => f.BannerKind.danger,
              ConflictLevel.warning => f.BannerKind.amber,
              ConflictLevel.ok => f.BannerKind.green,
            },
            title: _conflict!.title,
            body: _conflict!.detail,
          ),

        Padding(
          padding: const EdgeInsets.fromLTRB(2, 4, 2, 12),
          child: RichText(
            text: TextSpan(
              style: T.captionMuted,
              children: <InlineSpan>[
                const TextSpan(text: 'Signed '),
                TextSpan(
                  text: widget.responderId,
                  style: T.mono(size: 13, color: C.textMuted),
                ),
                const TextSpan(
                    text: ' · auto-timestamped · written back to the tag'),
              ],
            ),
          ),
        ),

        if (blocked) ...<Widget>[
          w.Btn(
            label: 'Override and log anyway',
            kind: w.BtnKind.danger,
            icon: Ico.alert,
            onTap: _submit,
          ),
          const SizedBox(height: 8),
          w.Btn(
            label: 'Cancel',
            kind: w.BtnKind.ghost,
            onTap: () => Navigator.of(context).pop(),
          ),
        ] else
          w.Btn(
            label: 'Add to log',
            icon: Ico.check,
            onTap: hasDrug ? _submit : null,
          ),
      ],
    );
  }
}
