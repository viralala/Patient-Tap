// Conflict checker (F10) — the core differentiator (PRD §10).
// Checks a proposed treatment against known allergies and recent doses on the tag.

import '../models/patient_profile.dart';

enum ConflictLevel { danger, warning, ok }

class ConflictResult {
  const ConflictResult({
    required this.level,
    required this.title,
    required this.detail,
  });

  final ConflictLevel level;
  final String title;
  final String detail;

  static const ConflictResult none =
      ConflictResult(level: ConflictLevel.ok, title: '', detail: '');
}

/// Minimal cross-sensitivity / class map for a credible demo. Not exhaustive.
const Map<String, List<String>> _drugClass = <String, List<String>>{
  'penicillin': <String>[
    'amoxicillin',
    'ampicillin',
    'augmentin',
    'penicillin',
    'flucloxacillin',
  ],
  'sulfa': <String>['sulfamethoxazole', 'co-trimoxazole', 'bactrim', 'sulfa'],
  'nsaid': <String>[
    'ibuprofen',
    'aspirin',
    'naproxen',
    'diclofenac',
    'ketorolac',
  ],
  'opioid': <String>['morphine', 'fentanyl', 'codeine', 'tramadol', 'oxycodone'],
};

const Duration _recentDoseWindow = Duration(hours: 4);

String _norm(String s) => s.toLowerCase().replaceAll(RegExp(r'[^a-z]'), '');

/// Returns true if [drug] belongs to the same class as an [allergy] token.
bool _crossReacts(String drug, String allergy) {
  final String d = _norm(drug);
  final String a = _norm(allergy);
  if (d.isEmpty || a.isEmpty) return false;
  if (d.contains(a) || a.contains(d)) return true;

  for (final List<String> members in _drugClass.values) {
    final bool hasA = members
        .any((String m) => a.contains(_norm(m)) || _norm(m).contains(a));
    final bool hasD = members
        .any((String m) => d.contains(_norm(m)) || _norm(m).contains(d));
    if (hasA && hasD) return true;
  }
  return false;
}

/// Check a proposed medication administration against the profile.
/// [drugName] is what the responder is about to give.
ConflictResult checkConflict(
  PatientProfile profile,
  String drugName, {
  DateTime? now,
}) {
  final String drug = drugName.trim();
  if (drug.isEmpty) return ConflictResult.none;
  final DateTime at = now ?? DateTime.now();

  // 1) Allergy / cross-reactivity — highest severity.
  for (final String allergy in profile.allergies) {
    if (_crossReacts(drug, allergy)) {
      return ConflictResult(
        level: ConflictLevel.danger,
        title: 'Allergy conflict: $drug',
        detail: 'Patient is allergic to $allergy. $drug may cross-react. '
            'Do not administer without override.',
      );
    }
  }

  // 2) Recent duplicate dose — overdose risk.
  for (final LogEntry e in profile.treatmentLog) {
    final Duration age = at.difference(e.time);
    if (age < _recentDoseWindow &&
        !age.isNegative &&
        _norm(e.action).contains(_norm(drug))) {
      final int mins = age.inMinutes;
      return ConflictResult(
        level: ConflictLevel.warning,
        title: 'Recent dose on record: $drug',
        detail: 'A dose containing $drug was logged $mins min ago. '
            'Confirm before re-dosing to avoid overdose.',
      );
    }
  }

  // 3) Interaction with an active regimen medication.
  for (final MedEntry m in profile.medications) {
    if (_crossReacts(drug, m.name)) {
      return ConflictResult(
        level: ConflictLevel.warning,
        title: 'Interaction check: $drug',
        detail: 'Patient is on ${m.name} (${m.dose}). '
            'Review for interaction before administering.',
      );
    }
  }

  return ConflictResult(
    level: ConflictLevel.ok,
    title: 'No conflicts detected',
    detail: '$drug does not clash with recorded allergies, recent doses, '
        'or current medications.',
  );
}
