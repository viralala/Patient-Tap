// Data schema — mirrors the protobuf draft in PRD §11.
// Plain Dart classes; serialized compactly for the tag (see core/local_store.dart).

import 'dart:math';

class MedEntry {
  MedEntry({
    required this.name,
    this.dose = '',
    this.frequency = '',
    this.reminderTime, // "HH:MM" local
    this.reminderEnabled = false,
  });

  String name;
  String dose;
  String frequency;
  String? reminderTime;
  bool reminderEnabled;

  MedEntry copy() => MedEntry(
        name: name,
        dose: dose,
        frequency: frequency,
        reminderTime: reminderTime,
        reminderEnabled: reminderEnabled,
      );

  Map<String, dynamic> toJson() => <String, dynamic>{
        'name': name,
        'dose': dose,
        'frequency': frequency,
        'reminderTime': reminderTime,
        'reminderEnabled': reminderEnabled,
      };

  static MedEntry fromJson(Map<String, dynamic> j) => MedEntry(
        name: (j['name'] ?? '') as String,
        dose: (j['dose'] ?? '') as String,
        frequency: (j['frequency'] ?? '') as String,
        reminderTime: j['reminderTime'] as String?,
        reminderEnabled: (j['reminderEnabled'] ?? false) as bool,
      );
}

class ContactRef {
  ContactRef({required this.name, required this.phone, this.email});

  String name;
  String phone;
  String? email;

  ContactRef copy() => ContactRef(name: name, phone: phone, email: email);

  Map<String, dynamic> toJson() =>
      <String, dynamic>{'name': name, 'phone': phone, 'email': email};

  static ContactRef fromJson(Map<String, dynamic> j) => ContactRef(
        name: (j['name'] ?? '') as String,
        phone: (j['phone'] ?? '') as String,
        email: j['email'] as String?,
      );
}

class LogEntry {
  LogEntry({
    required this.timestamp,
    required this.responderId,
    required this.action,
  });

  /// Epoch milliseconds.
  final int timestamp;
  final String responderId;

  /// e.g. "Administered Adrenaline 0.5mg IM"
  final String action;

  DateTime get time => DateTime.fromMillisecondsSinceEpoch(timestamp);

  Map<String, dynamic> toJson() => <String, dynamic>{
        'timestamp': timestamp,
        'responderId': responderId,
        'action': action,
      };

  static LogEntry fromJson(Map<String, dynamic> j) => LogEntry(
        timestamp: (j['timestamp'] ?? 0) as int,
        responderId: (j['responderId'] ?? '') as String,
        action: (j['action'] ?? '') as String,
      );
}

class PatientProfile {
  PatientProfile({
    required this.patientId,
    this.name = '',
    this.bloodType = '',
    List<String>? allergies,
    List<MedEntry>? medications,
    this.dnrFlag = false,
    List<ContactRef>? emergencyContacts,
    List<LogEntry>? treatmentLog,
  })  : allergies = allergies ?? <String>[],
        medications = medications ?? <MedEntry>[],
        emergencyContacts = emergencyContacts ?? <ContactRef>[],
        treatmentLog = treatmentLog ?? <LogEntry>[];

  String patientId;
  String name;
  String bloodType;
  List<String> allergies;
  List<MedEntry> medications;
  bool dnrFlag;

  /// Up to 3 people.
  List<ContactRef> emergencyContacts;
  List<LogEntry> treatmentLog;

  /// Deep copy — every mutation path in the UI works on a draft, never the
  /// live object (mirrors the web build's structuredClone).
  PatientProfile copy() => PatientProfile(
        patientId: patientId,
        name: name,
        bloodType: bloodType,
        allergies: List<String>.from(allergies),
        medications: medications.map((MedEntry m) => m.copy()).toList(),
        dnrFlag: dnrFlag,
        emergencyContacts:
            emergencyContacts.map((ContactRef c) => c.copy()).toList(),
        treatmentLog: List<LogEntry>.from(treatmentLog),
      );

  Map<String, dynamic> toJson() => <String, dynamic>{
        'patientId': patientId,
        'name': name,
        'bloodType': bloodType,
        'allergies': allergies,
        'medications': medications.map((MedEntry m) => m.toJson()).toList(),
        'dnrFlag': dnrFlag,
        'emergencyContacts':
            emergencyContacts.map((ContactRef c) => c.toJson()).toList(),
        'treatmentLog': treatmentLog.map((LogEntry e) => e.toJson()).toList(),
      };

  static PatientProfile fromJson(Map<String, dynamic> j) => PatientProfile(
        patientId: (j['patientId'] ?? _newPatientId()) as String,
        name: (j['name'] ?? '') as String,
        bloodType: (j['bloodType'] ?? '') as String,
        allergies: ((j['allergies'] ?? <dynamic>[]) as List<dynamic>)
            .map((dynamic e) => e.toString())
            .toList(),
        medications: ((j['medications'] ?? <dynamic>[]) as List<dynamic>)
            .map((dynamic e) => MedEntry.fromJson(e as Map<String, dynamic>))
            .toList(),
        dnrFlag: (j['dnrFlag'] ?? false) as bool,
        emergencyContacts:
            ((j['emergencyContacts'] ?? <dynamic>[]) as List<dynamic>)
                .map((dynamic e) =>
                    ContactRef.fromJson(e as Map<String, dynamic>))
                .toList(),
        treatmentLog: ((j['treatmentLog'] ?? <dynamic>[]) as List<dynamic>)
            .map((dynamic e) => LogEntry.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}

String _newPatientId() {
  const String chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  final Random r = Random.secure();
  final String tail =
      List<String>.generate(6, (_) => chars[r.nextInt(chars.length)]).join();
  return 'PT-$tail';
}

PatientProfile emptyProfile() => PatientProfile(patientId: _newPatientId());

/// A ready-made demo profile so Responder mode is never empty on first run.
PatientProfile demoProfile() => PatientProfile(
      patientId: 'PT-9F3A2C',
      name: 'Aarav Mehta',
      bloodType: 'O+',
      allergies: <String>['Penicillin', 'Sulfa drugs'],
      medications: <MedEntry>[
        MedEntry(
          name: 'Metformin',
          dose: '500mg',
          frequency: 'Twice daily',
          reminderTime: '09:00',
          reminderEnabled: true,
        ),
        MedEntry(
          name: 'Atorvastatin',
          dose: '20mg',
          frequency: 'Once at night',
          reminderTime: '21:00',
          reminderEnabled: true,
        ),
      ],
      emergencyContacts: <ContactRef>[
        ContactRef(name: 'Priya Mehta', phone: '+91 98200 11223'),
        ContactRef(name: 'Dr. Rao (GP)', phone: '+91 98450 66778'),
      ],
    );

// ---------------------------------------------------------------------------
// F4.2 — categories the user can selectively include in a tag write.
// ---------------------------------------------------------------------------

enum WriteCategory { basic, allergies, medications, dnr, contacts, log }

class WriteSelection {
  WriteSelection({
    this.basic = true,
    this.allergies = true,
    this.medications = true,
    this.dnr = true,
    this.contacts = true,
    this.log = true,
  });

  bool basic;
  bool allergies;
  bool medications;
  bool dnr;
  bool contacts;
  bool log;

  bool get anySelected =>
      basic || allergies || medications || dnr || contacts || log;

  bool of(WriteCategory c) => switch (c) {
        WriteCategory.basic => basic,
        WriteCategory.allergies => allergies,
        WriteCategory.medications => medications,
        WriteCategory.dnr => dnr,
        WriteCategory.contacts => contacts,
        WriteCategory.log => log,
      };

  void toggle(WriteCategory c) {
    switch (c) {
      case WriteCategory.basic:
        basic = !basic;
      case WriteCategory.allergies:
        allergies = !allergies;
      case WriteCategory.medications:
        medications = !medications;
      case WriteCategory.dnr:
        dnr = !dnr;
      case WriteCategory.contacts:
        contacts = !contacts;
      case WriteCategory.log:
        log = !log;
    }
  }

  WriteSelection copy() => WriteSelection(
        basic: basic,
        allergies: allergies,
        medications: medications,
        dnr: dnr,
        contacts: contacts,
        log: log,
      );

  static WriteSelection all() => WriteSelection();

  /// The projection used for a share link — everything except the field log.
  static WriteSelection forShare() => WriteSelection(log: false);
}

class WriteCategoryMeta {
  const WriteCategoryMeta(this.key, this.label, this.hint);
  final WriteCategory key;
  final String label;
  final String hint;
}

const List<WriteCategoryMeta> kWriteCategoryMeta = <WriteCategoryMeta>[
  WriteCategoryMeta(
      WriteCategory.basic, 'Basic info', 'Name, blood type, patient ID'),
  WriteCategoryMeta(WriteCategory.allergies, 'Allergies',
      'Critical — read first by responders'),
  WriteCategoryMeta(
      WriteCategory.medications, 'Medications', 'Name, dose, frequency'),
  WriteCategoryMeta(WriteCategory.dnr, 'DNR status', 'Do-not-resuscitate flag'),
  WriteCategoryMeta(WriteCategory.contacts, 'Emergency contacts', 'Up to 3 people'),
  WriteCategoryMeta(
      WriteCategory.log, 'Treatment log', 'Field chain-of-custody history'),
];

const List<String> kBloodTypes = <String>[
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
];
