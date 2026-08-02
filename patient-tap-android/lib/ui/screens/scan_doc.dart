// ============================================================================
// F2 — document auto-fill.
//
// UPGRADE OVER THE WEB BUILD: OCR is real here. Google ML Kit Text Recognition
// runs fully on-device (no network, nothing uploaded) over a photo you take or
// pick. The field parser was already real. Nothing saves without confirmation
// (F2.4), and undetected fields are left absent rather than guessed (F2.5).
// ============================================================================

import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../../core/ocr_service.dart';
import '../../models/patient_profile.dart';
import '../../state/app_state.dart';
import '../../theme/tokens.dart';
import '../../theme/type.dart';
import '../icons.dart';
import '../widgets/base.dart' as w;
import '../widgets/feedback.dart' as f;

enum _Step { pick, extract, review }

class ScanDocScreen extends StatefulWidget {
  const ScanDocScreen({super.key});

  @override
  State<ScanDocScreen> createState() => _ScanDocScreenState();
}

class _ScanDocScreenState extends State<ScanDocScreen> {
  _Step _step = _Step.pick;
  final TextEditingController _raw = TextEditingController();
  String? _imagePath;
  ParsedFields? _parsed;
  bool _busy = false;

  final Map<String, bool> _accept = <String, bool>{
    'name': true,
    'bloodType': true,
    'allergies': true,
    'medications': true,
    'dnr': true,
  };

  @override
  void dispose() {
    _raw.dispose();
    super.dispose();
  }

  Future<void> _capture(ImageSource source) async {
    final AppState app = context.read<AppState>();
    setState(() {
      _step = _Step.extract;
      _busy = true;
      _imagePath = null;
    });
    try {
      final ({String path, String text})? res =
          await OcrService.pickAndRecognize(source);
      if (!mounted) return;
      if (res == null) {
        setState(() {
          _step = _Step.pick;
          _busy = false;
        });
        return;
      }
      setState(() {
        _imagePath = res.path;
        _raw.text = res.text;
        _busy = false;
      });
      if (res.text.trim().isEmpty) {
        app.showToast('No text found — try a sharper photo', icon: Ico.info);
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _step = _Step.pick;
        _busy = false;
      });
      app.showToast('Could not read that image', icon: Ico.x,
          iconColor: C.danger);
    }
  }

  void _useSample(SampleDoc d) {
    setState(() {
      _imagePath = null;
      _raw.text = d.text;
      _step = _Step.extract;
      _busy = false;
    });
  }

  void _parse() {
    setState(() {
      _parsed = parseFieldsFromText(_raw.text);
      _step = _Step.review;
    });
  }

  Future<void> _confirm() async {
    final AppState app = context.read<AppState>();
    final ParsedFields? p = _parsed;
    if (p == null) return;

    final PatientProfile next = app.profile.copy();
    if (_accept['name']! && p.name != null) next.name = p.name!;
    if (_accept['bloodType']! && p.bloodType != null) {
      next.bloodType = p.bloodType!;
    }
    if (_accept['allergies']!) {
      for (final String a in p.allergies) {
        if (!next.allergies
            .any((String x) => x.toLowerCase() == a.toLowerCase())) {
          next.allergies.add(a);
        }
      }
    }
    if (_accept['medications']!) {
      for (final MedEntry m in p.medications) {
        if (!next.medications
            .any((MedEntry x) => x.name.toLowerCase() == m.name.toLowerCase())) {
          next.medications.add(m);
        }
      }
    }
    if (_accept['dnr']! && (p.dnrFlag ?? false)) next.dnrFlag = true;

    await app.setProfile(next);
    if (!mounted) return;
    app.showToast('Fields added to profile', icon: Ico.check,
        iconColor: C.accent);
    app.closeRoute();
  }

  @override
  Widget build(BuildContext context) {
    final AppState app = context.read<AppState>();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        w.NavHeader(
          title: 'Scan document',
          onBack: _step == _Step.pick
              ? app.closeRoute
              : () => setState(() => _step = _Step.pick),
        ),
        Expanded(
          child: w.Screen(
            padTop: 8,
            children: <Widget>[
              const f.Banner(
                kind: f.BannerKind.green,
                title: 'On-device only',
                body: 'Text recognition runs entirely offline with ML Kit — '
                    'the photo never leaves your phone. Always review before '
                    'saving.',
                icon: Ico.sparkle,
              ),

              if (_step == _Step.pick) ..._pickStep(),
              if (_step == _Step.extract) ..._extractStep(),
              if (_step == _Step.review) ..._reviewStep(),
            ],
          ),
        ),
      ],
    );
  }

  // ---- Step 1: choose a source --------------------------------------------
  List<Widget> _pickStep() => <Widget>[
        const w.SectionTitle('Choose a document'),
        w.Card(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          onTap: () => _capture(ImageSource.camera),
          child: w.RowTile(
            icon: Ico.camera,
            title: 'Take a photo',
            subtitle: 'Prescription, discharge summary, allergy report',
            divider: false,
            padding: const EdgeInsets.symmetric(vertical: 6),
            trailing: const AppIcon(Ico.chevronRight,
                size: 18, color: C.textMuted),
          ),
        ),
        const SizedBox(height: 10),
        w.Card(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          onTap: () => _capture(ImageSource.gallery),
          child: w.RowTile(
            icon: Ico.doc,
            title: 'Pick from gallery',
            subtitle: 'Use a photo or scan you already have',
            divider: false,
            padding: const EdgeInsets.symmetric(vertical: 6),
            trailing: const AppIcon(Ico.chevronRight,
                size: 18, color: C.textMuted),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(2, 14, 2, 8),
          child: Text('Or try a clean sample:', style: T.captionMuted),
        ),
        for (final SampleDoc d in kSampleDocs) ...<Widget>[
          w.CardAlt(
            onTap: () => _useSample(d),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            child: w.RowTile(
              icon: Ico.doc,
              tint: Tint.caution,
              title: d.label,
              subtitle: 'Tap to load',
              divider: false,
              padding: const EdgeInsets.symmetric(vertical: 6),
            ),
          ),
          const SizedBox(height: 10),
        ],
      ];

  // ---- Step 2: review the recognised text ---------------------------------
  List<Widget> _extractStep() => <Widget>[
        if (_imagePath != null) ...<Widget>[
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: Image.file(
              File(_imagePath!),
              height: 220,
              width: double.infinity,
              fit: BoxFit.cover,
            ),
          ),
        ],
        const w.SectionTitle('Extracted text'),
        if (_busy)
          w.Card(
            padding: const EdgeInsets.all(30),
            child: Column(
              children: <Widget>[
                const f.ScanningPulse(
                  child: AppIcon(Ico.scan, size: 40, color: C.accent),
                ),
                const SizedBox(height: 12),
                Text('Reading text on-device…',
                    textAlign: TextAlign.center, style: T.caption()),
              ],
            ),
          )
        else ...<Widget>[
          w.Input(controller: _raw, maxLines: 9, minLines: 9),
          Padding(
            padding: const EdgeInsets.fromLTRB(2, 6, 2, 14),
            child: Text('You can correct the raw text before parsing.',
                style: T.captionMuted),
          ),
          w.Btn(
            label: 'Detect fields',
            icon: Ico.sparkle,
            onTap: _raw.text.trim().isEmpty ? null : _parse,
          ),
        ],
      ];

  // ---- Step 3: confirm what gets saved ------------------------------------
  List<Widget> _reviewStep() {
    final ParsedFields p = _parsed!;
    return <Widget>[
      const f.Banner(
        kind: f.BannerKind.blue,
        title: 'Review before saving',
        body: 'These fields were auto-detected. Switch off anything wrong — '
            'nothing saves without your confirmation.',
      ),
      w.Card(
        child: w.Rows(
          children: <Widget>[
            _ReviewRow(
              label: 'Name',
              value: p.name,
              accepted: _accept['name']!,
              onChanged: (bool v) => setState(() => _accept['name'] = v),
            ),
            _ReviewRow(
              label: 'Blood type',
              value: p.bloodType,
              accepted: _accept['bloodType']!,
              onChanged: (bool v) => setState(() => _accept['bloodType'] = v),
            ),
            _ReviewRow(
              label: 'Allergies',
              value: p.allergies.isEmpty ? null : p.allergies.join(', '),
              accepted: _accept['allergies']!,
              onChanged: (bool v) => setState(() => _accept['allergies'] = v),
            ),
            _ReviewRow(
              label: 'Medications',
              value: p.medications.isEmpty
                  ? null
                  : p.medications
                      .map((MedEntry m) => '${m.name} ${m.dose}'.trim())
                      .join(', '),
              accepted: _accept['medications']!,
              onChanged: (bool v) => setState(() => _accept['medications'] = v),
            ),
            _ReviewRow(
              label: 'DNR',
              value: (p.dnrFlag ?? false) ? 'Yes' : null,
              accepted: _accept['dnr']!,
              onChanged: (bool v) => setState(() => _accept['dnr'] = v),
              last: true,
            ),
          ],
        ),
      ),
      const SizedBox(height: 16),
      w.Btn(
        label: 'Add to profile',
        icon: Ico.check,
        onTap: p.isEmpty ? null : _confirm,
      ),
      const SizedBox(height: 8),
      w.Btn(
        label: 'Back to text',
        kind: w.BtnKind.ghost,
        onTap: () => setState(() => _step = _Step.extract),
      ),
    ];
  }
}

class _ReviewRow extends StatelessWidget {
  const _ReviewRow({
    required this.label,
    required this.value,
    required this.accepted,
    required this.onChanged,
    this.last = false,
  });

  final String label;
  final String? value;
  final bool accepted;
  final ValueChanged<bool> onChanged;
  final bool last;

  @override
  Widget build(BuildContext context) {
    final bool detected = value != null && value!.isNotEmpty;
    return w.RowTile(
      icon: detected ? Ico.check : Ico.x,
      tint: detected ? Tint.accent : Tint.neutral,
      title: label,
      subtitle: detected ? value : 'Not detected — enter manually',
      divider: !last,
      trailing: detected
          ? f.AppSwitch(value: accepted, onChanged: onChanged)
          : null,
    );
  }
}
