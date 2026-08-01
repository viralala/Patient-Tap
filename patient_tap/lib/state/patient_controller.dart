import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';

import '../models/contact_ref.dart';
import '../models/med_entry.dart';
import '../models/patient_profile.dart';
import '../services/backend_service.dart';
import '../services/crypto_service.dart';
import '../services/mock_data.dart';
import '../services/nfc_service.dart';

/// Status of the "Write to Tag" flow.
enum WriteStatus { idle, encrypting, writing, success, error }

/// Owns the Patient-mode data: the profile being edited and the write-to-tag
/// lifecycle. All backend touchpoints go through the stubbed services.
class PatientController extends ChangeNotifier {
  PatientController({
    CryptoService? crypto,
    NfcService? nfc,
    BackendService? backend,
    bool seedDemo = true,
  })  : _crypto = crypto ?? const CryptoService(),
        _nfc = nfc ?? NfcService(),
        _backend = backend ?? const BackendService() {
    if (seedDemo) {
      // Pre-seed a demo patient so Patient mode shows a populated dashboard on
      // first launch. Both the saved record and the editable draft start here.
      final demo = MockData.demoPatientOwner();
      _savedProfile = demo;
      _draft = demo;
      _lastEncodedBytes = _estimateBytes(demo);
    }
  }

  final CryptoService _crypto;
  final NfcService _nfc;
  final BackendService _backend;

  /// Rough byte estimate for the usage meter without a real encrypt round-trip.
  static int _estimateBytes(PatientProfile p) =>
      utf8.encode(jsonEncode(p.toMap())).length;

  // The profile currently being edited in the form (seeded with the demo
  // patient above; a fresh onboarding would start from newPatientDraft()).
  PatientProfile _draft = MockData.newPatientDraft();
  // The last profile successfully written to the tag ("what's on your tag").
  PatientProfile? _savedProfile;

  WriteStatus _writeStatus = WriteStatus.idle;
  String? _writeErrorMessage;
  int _lastEncodedBytes = 0;

  PatientProfile get draft => _draft;
  PatientProfile? get savedProfile => _savedProfile;
  bool get hasSavedProfile => _savedProfile != null;
  WriteStatus get writeStatus => _writeStatus;
  String? get writeErrorMessage => _writeErrorMessage;

  /// Estimated bytes the current draft would occupy on the tag, for the
  /// "byte usage" stat. Recomputed after each write.
  int get usedBytes => _lastEncodedBytes;
  int get tagCapacityBytes => NfcService.tagCapacityBytes;
  double get usageFraction =>
      (_lastEncodedBytes / tagCapacityBytes).clamp(0.0, 1.0);

  // --- Draft editing ---------------------------------------------------------

  void seedDraft(PatientProfile profile) {
    _draft = profile;
    notifyListeners();
  }

  void updateDraft(PatientProfile Function(PatientProfile) update) {
    _draft = update(_draft);
    notifyListeners();
  }

  void setName(String name) =>
      updateDraft((p) => p.copyWith(name: name));

  void setPatientId(String id) =>
      updateDraft((p) => p.copyWith(patientId: id));

  void setDnr(bool value) => updateDraft((p) => p.copyWith(dnr: value));

  void addAllergy(String allergy) {
    final trimmed = allergy.trim();
    if (trimmed.isEmpty || _draft.allergies.contains(trimmed)) return;
    updateDraft((p) => p.copyWith(allergies: [...p.allergies, trimmed]));
  }

  void removeAllergy(String allergy) =>
      updateDraft((p) => p.copyWith(
          allergies: p.allergies.where((a) => a != allergy).toList()));

  void addMedication(MedEntry med) =>
      updateDraft((p) => p.copyWith(medications: [...p.medications, med]));

  void updateMedication(int index, MedEntry med) {
    final list = [..._draft.medications];
    if (index < 0 || index >= list.length) return;
    list[index] = med;
    updateDraft((p) => p.copyWith(medications: list));
  }

  void removeMedication(int index) {
    final list = [..._draft.medications]..removeAt(index);
    updateDraft((p) => p.copyWith(medications: list));
  }

  void addContact(ContactRef contact) {
    if (_draft.emergencyContacts.length >= 3) return; // cap at 3
    updateDraft((p) =>
        p.copyWith(emergencyContacts: [...p.emergencyContacts, contact]));
  }

  void removeContact(int index) {
    final list = [..._draft.emergencyContacts]..removeAt(index);
    updateDraft((p) => p.copyWith(emergencyContacts: list));
  }

  // --- Write to tag ----------------------------------------------------------

  /// Encrypt the draft and write it to the tag. Also fires an opportunistic
  /// cloud backup (best-effort, ignored on failure).
  Future<void> writeToTag() async {
    _writeErrorMessage = null;
    _setStatus(WriteStatus.encrypting);

    final Uint8List bytes = await _crypto.encryptProfile(
      _draft.copyWith(updatedAt: DateTime.now()),
    );
    _lastEncodedBytes = bytes.length;

    _setStatus(WriteStatus.writing);
    final result = await _nfc.writeToTag(bytes);

    if (result.ok) {
      _savedProfile = _draft.copyWith(updatedAt: DateTime.now());
      // Opportunistic backup — don't block the UI on it.
      unawaited(_backend.saveProfileBackup(_savedProfile!));
      _setStatus(WriteStatus.success);
    } else {
      _writeErrorMessage = result.error?.message ?? 'Write failed — try again.';
      _setStatus(WriteStatus.error);
    }
  }

  /// Reset the write flow back to idle (e.g. when leaving the screen or
  /// retrying from a clean state).
  void resetWrite() => _setStatus(WriteStatus.idle);

  void _setStatus(WriteStatus status) {
    _writeStatus = status;
    notifyListeners();
  }
}
