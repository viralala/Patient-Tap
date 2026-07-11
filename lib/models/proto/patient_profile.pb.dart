import 'dart:typed_data';

import 'wire.dart';

/// Hand-written, wire-format-compatible stand-ins for real `protoc`-generated
/// classes (see `proto/patient_tap.proto` — the schema source of truth, and
/// `wire.dart` for why these are hand-written rather than generated).
///
/// Each `*Message` class here is a plain-data mirror of the corresponding
/// `.proto` message: it holds the same fields, in the same field-number
/// order, and its `writeToBuffer()`/`mergeFromBuffer()` pair encodes/decodes
/// using the exact protobuf wire format. Nothing here is Flutter/UI-facing —
/// these are only used by the `toProto`/`fromProto` conversion methods added
/// to the existing models in `lib/models/*.dart`.

/// Mirrors the `BloodType` enum in patient_tap.proto. Order matches
/// lib/models/blood_type.dart's `BloodType` enum exactly, so
/// `BloodType.values[wireValue]` round-trips directly.
class BloodTypeProto {
  static const int unknown = 0;
  static const int aPos = 1;
  static const int aNeg = 2;
  static const int bPos = 3;
  static const int bNeg = 4;
  static const int abPos = 5;
  static const int abNeg = 6;
  static const int oPos = 7;
  static const int oNeg = 8;
}

class MedEntryMessage {
  MedEntryMessage({this.name = '', this.dose = '', this.frequency = ''});

  final String name;
  final String dose;
  final String frequency;

  Uint8List writeToBuffer() {
    final w = ProtoWriter();
    w.writeString(1, name);
    w.writeString(2, dose);
    w.writeString(3, frequency);
    return w.toBytes();
  }

  static MedEntryMessage mergeFromBuffer(Uint8List bytes) {
    final r = ProtoReader(bytes);
    return MedEntryMessage(
      name: r.getString(1),
      dose: r.getString(2),
      frequency: r.getString(3),
    );
  }
}

class ContactRefMessage {
  ContactRefMessage({this.name = '', this.phone = '', this.relation = ''});

  final String name;
  final String phone;
  final String relation;

  Uint8List writeToBuffer() {
    final w = ProtoWriter();
    w.writeString(1, name);
    w.writeString(2, phone);
    w.writeString(3, relation);
    return w.toBytes();
  }

  static ContactRefMessage mergeFromBuffer(Uint8List bytes) {
    final r = ProtoReader(bytes);
    return ContactRefMessage(
      name: r.getString(1),
      phone: r.getString(2),
      relation: r.getString(3),
    );
  }
}

class LogEntryMessage {
  LogEntryMessage({
    this.timestampUnix = 0,
    this.responderId = '',
    this.action = '',
  });

  final int timestampUnix;
  final String responderId;
  final String action;

  Uint8List writeToBuffer() {
    final w = ProtoWriter();
    w.writeInt64(1, timestampUnix);
    w.writeString(2, responderId);
    w.writeString(3, action);
    return w.toBytes();
  }

  static LogEntryMessage mergeFromBuffer(Uint8List bytes) {
    final r = ProtoReader(bytes);
    return LogEntryMessage(
      timestampUnix: r.getInt64(1),
      responderId: r.getString(2),
      action: r.getString(3),
    );
  }
}

class GeoLocationMessage {
  GeoLocationMessage({
    this.latitude = 0.0,
    this.longitude = 0.0,
    this.accuracyMeters = 0.0,
    this.capturedAtUnix = 0,
  });

  final double latitude;
  final double longitude;
  final double accuracyMeters;
  final int capturedAtUnix;

  Uint8List writeToBuffer() {
    final w = ProtoWriter();
    w.writeDouble(1, latitude);
    w.writeDouble(2, longitude);
    w.writeDouble(3, accuracyMeters);
    w.writeInt64(4, capturedAtUnix);
    return w.toBytes();
  }

  static GeoLocationMessage mergeFromBuffer(Uint8List bytes) {
    final r = ProtoReader(bytes);
    return GeoLocationMessage(
      latitude: r.getDouble(1),
      longitude: r.getDouble(2),
      accuracyMeters: r.getDouble(3),
      capturedAtUnix: r.getInt64(4),
    );
  }
}

class PatientProfileMessage {
  PatientProfileMessage({
    this.patientId = '',
    this.name = '',
    this.bloodType = BloodTypeProto.unknown,
    this.allergies = const [],
    this.medications = const [],
    this.dnr = false,
    this.emergencyContacts = const [],
    this.treatmentLog = const [],
    this.updatedAtUnix = 0,
  });

  final String patientId;
  final String name;
  final int bloodType; // BloodTypeProto.*
  final List<String> allergies;
  final List<MedEntryMessage> medications;
  final bool dnr;
  final List<ContactRefMessage> emergencyContacts;
  final List<LogEntryMessage> treatmentLog;
  final int updatedAtUnix;

  Uint8List writeToBuffer() {
    final w = ProtoWriter();
    w.writeString(1, patientId);
    w.writeString(2, name);
    w.writeEnum(3, bloodType);
    for (final a in allergies) {
      w.writeString(4, a);
    }
    for (final m in medications) {
      w.writeMessage(5, m.writeToBuffer());
    }
    w.writeBool(6, dnr);
    for (final c in emergencyContacts) {
      w.writeMessage(7, c.writeToBuffer());
    }
    for (final l in treatmentLog) {
      w.writeMessage(8, l.writeToBuffer());
    }
    w.writeInt64(9, updatedAtUnix);
    return w.toBytes();
  }

  static PatientProfileMessage mergeFromBuffer(Uint8List bytes) {
    final r = ProtoReader(bytes);
    return PatientProfileMessage(
      patientId: r.getString(1),
      name: r.getString(2),
      bloodType: r.getEnum(3),
      allergies: r.getRepeatedString(4),
      medications: r
          .getRepeatedBytes(5)
          .map(MedEntryMessage.mergeFromBuffer)
          .toList(),
      dnr: r.getBool(6),
      emergencyContacts: r
          .getRepeatedBytes(7)
          .map(ContactRefMessage.mergeFromBuffer)
          .toList(),
      treatmentLog: r
          .getRepeatedBytes(8)
          .map(LogEntryMessage.mergeFromBuffer)
          .toList(),
      updatedAtUnix: r.getInt64(9),
    );
  }
}
