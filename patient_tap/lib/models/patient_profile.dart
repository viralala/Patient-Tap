import 'blood_type.dart';
import 'contact_ref.dart';
import 'log_entry.dart';
import 'med_entry.dart';

/// The full patient record that lives (encrypted) on the NFC tag.
///
/// Maps to the top-level `PatientProfile` protobuf message. Kept as a plain
/// immutable model with map (de)serialization so Backend's real
/// encrypt/decrypt can consume/produce the exact same shape.
class PatientProfile {
  const PatientProfile({
    required this.patientId,
    required this.name,
    this.bloodType = BloodType.unknown,
    this.allergies = const [],
    this.medications = const [],
    this.dnr = false,
    this.emergencyContacts = const [],
    this.treatmentLog = const [],
    this.updatedAt,
  });

  final String patientId; // e.g. "PT-0007"
  final String name;
  final BloodType bloodType;
  final List<String> allergies; // e.g. ["Penicillin", "Peanuts"]
  final List<MedEntry> medications;
  final bool dnr; // Do-Not-Resuscitate flag (life-safety)
  final List<ContactRef> emergencyContacts;
  final List<LogEntry> treatmentLog; // append-only chain of custody
  final DateTime? updatedAt;

  bool get hasAllergies => allergies.any((a) => a.trim().isNotEmpty);

  /// True when this record needs high-visibility warning treatment in the
  /// responder UI (DNR set, or one or more allergies present).
  bool get isCritical => dnr || hasAllergies;

  PatientProfile copyWith({
    String? patientId,
    String? name,
    BloodType? bloodType,
    List<String>? allergies,
    List<MedEntry>? medications,
    bool? dnr,
    List<ContactRef>? emergencyContacts,
    List<LogEntry>? treatmentLog,
    DateTime? updatedAt,
  }) {
    return PatientProfile(
      patientId: patientId ?? this.patientId,
      name: name ?? this.name,
      bloodType: bloodType ?? this.bloodType,
      allergies: allergies ?? this.allergies,
      medications: medications ?? this.medications,
      dnr: dnr ?? this.dnr,
      emergencyContacts: emergencyContacts ?? this.emergencyContacts,
      treatmentLog: treatmentLog ?? this.treatmentLog,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  Map<String, dynamic> toMap() => {
        'patientId': patientId,
        'name': name,
        'bloodType': bloodType.label,
        'allergies': allergies,
        'medications': medications.map((m) => m.toMap()).toList(),
        'dnr': dnr,
        'emergencyContacts':
            emergencyContacts.map((c) => c.toMap()).toList(),
        'treatmentLog': treatmentLog.map((l) => l.toMap()).toList(),
        'updatedAt': updatedAt?.toUtc().toIso8601String(),
      };

  factory PatientProfile.fromMap(Map<String, dynamic> map) {
    return PatientProfile(
      patientId: (map['patientId'] ?? '') as String,
      name: (map['name'] ?? '') as String,
      bloodType: BloodType.fromLabel(map['bloodType'] as String?),
      allergies: ((map['allergies'] ?? const []) as List)
          .map((e) => e.toString())
          .toList(),
      medications: ((map['medications'] ?? const []) as List)
          .map((e) => MedEntry.fromMap(Map<String, dynamic>.from(e as Map)))
          .toList(),
      dnr: (map['dnr'] ?? false) as bool,
      emergencyContacts: ((map['emergencyContacts'] ?? const []) as List)
          .map((e) => ContactRef.fromMap(Map<String, dynamic>.from(e as Map)))
          .toList(),
      treatmentLog: ((map['treatmentLog'] ?? const []) as List)
          .map((e) => LogEntry.fromMap(Map<String, dynamic>.from(e as Map)))
          .toList(),
      updatedAt:
          DateTime.tryParse((map['updatedAt'] ?? '') as String)?.toLocal(),
    );
  }

  /// An empty draft used to seed the patient onboarding form.
  factory PatientProfile.empty() => const PatientProfile(
        patientId: '',
        name: '',
      );
}
