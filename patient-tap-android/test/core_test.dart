// Unit tests for the security- and safety-critical logic: the crypto wire
// format, the tag payload round trip, and the drug conflict checker.

import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:patient_tap/core/conflict_checker.dart';
import 'package:patient_tap/core/crypto_service.dart';
import 'package:patient_tap/core/local_store.dart';
import 'package:patient_tap/models/patient_profile.dart';

void main() {
  group('CryptoService', () {
    test('round-trips a payload', () async {
      const String plain = 'Aarav Mehta · O+ · Penicillin';
      final String ct = await CryptoService.encryptBytes(plain);
      expect(await CryptoService.decryptBytes(ct), plain);
    });

    test('produces the Web Crypto wire format: iv(12) | ct | tag(16)',
        () async {
      const String plain = 'hello';
      final String b64 = await CryptoService.encryptBytes(plain);
      final int len = base64.decode(b64).length;
      expect(len, utf8.encode(plain).length + 12 + 16);
      // encryptedSize must predict that exactly — the budget meter depends on it.
      expect(CryptoService.encryptedSize(plain), len);
    });

    test('uses a fresh IV each time', () async {
      final String a = await CryptoService.encryptBytes('same');
      final String b = await CryptoService.encryptBytes('same');
      expect(a, isNot(equals(b)));
    });

    test('detects tampering via the GCM auth tag', () async {
      final String ct = await CryptoService.encryptBytes('critical data');
      final List<int> bytes = base64.decode(ct);
      bytes[bytes.length - 3] ^= 0xFF; // flip a bit inside the tag
      expect(
        () => CryptoService.decryptBytes(base64.encode(bytes)),
        throwsA(isA<TamperException>()),
      );
    });

    test('rejects a truncated payload', () {
      expect(
        () => CryptoService.decryptBytes(base64.encode(<int>[1, 2, 3])),
        throwsA(isA<TamperException>()),
      );
    });

    test('share keys are per-link and do not decrypt each other', () async {
      final String k1 = CryptoService.newShareKeyB64();
      final String k2 = CryptoService.newShareKeyB64();
      expect(k1, isNot(equals(k2)));
      final String ct = await CryptoService.encryptWithKeyB64('card', k1);
      expect(await CryptoService.decryptWithKeyB64(ct, k1), 'card');
      expect(
        () => CryptoService.decryptWithKeyB64(ct, k2),
        throwsA(isA<TamperException>()),
      );
    });

    test('PIN hashing is salted and never reversible to the PIN', () {
      final String salt = CryptoService.newSalt();
      final String h = CryptoService.hashPin('1234', salt);
      expect(h, CryptoService.hashPin('1234', salt));
      expect(h, isNot(CryptoService.hashPin('1235', salt)));
      // A different salt gives a different hash for the same PIN.
      expect(h, isNot(CryptoService.hashPin('1234', CryptoService.newSalt())));
      expect(h.contains('1234'), isFalse);
    });
  });

  group('Tag payload', () {
    test('round-trips through the compact projection', () {
      final PatientProfile p = demoProfile()
        ..treatmentLog.add(LogEntry(
          timestamp: 1750000000000,
          responderId: 'EMT-1234',
          action: 'Administered Aspirin 300mg PO',
        ));

      final PatientProfile back =
          deserializeFromTag(serializeForWrite(p, WriteSelection.all()));

      expect(back.patientId, p.patientId);
      expect(back.name, p.name);
      expect(back.bloodType, p.bloodType);
      expect(back.allergies, p.allergies);
      expect(back.dnrFlag, p.dnrFlag);
      expect(back.medications.length, p.medications.length);
      expect(back.medications.first.name, 'Metformin');
      expect(back.emergencyContacts.first.phone, '+91 98200 11223');
      expect(back.treatmentLog.first.action, 'Administered Aspirin 300mg PO');
    });

    test('honours a partial selection', () {
      final PatientProfile p = demoProfile();
      final WriteSelection sel = WriteSelection(
        basic: true,
        allergies: true,
        medications: false,
        dnr: false,
        contacts: false,
        log: false,
      );
      final PatientProfile back =
          deserializeFromTag(serializeForWrite(p, sel));
      expect(back.name, 'Aarav Mehta');
      expect(back.allergies, contains('Penicillin'));
      expect(back.medications, isEmpty);
      expect(back.emergencyContacts, isEmpty);
    });

    test('the demo profile fits inside the 504-byte NTAG215 budget', () {
      expect(
        estimateWriteSize(demoProfile(), WriteSelection.all()),
        lessThan(504),
      );
    });

    test('survives a corrupt/garbage payload without throwing', () {
      final PatientProfile back = deserializeFromTag('not json at all');
      expect(back.name, '');
      expect(back.allergies, isEmpty);
    });
  });

  group('Conflict checker (F10)', () {
    final PatientProfile p = demoProfile();

    test('flags a direct allergy as danger', () {
      final ConflictResult r = checkConflict(p, 'Penicillin');
      expect(r.level, ConflictLevel.danger);
    });

    test('flags cross-reactivity within a drug class', () {
      // Amoxicillin cross-reacts with a recorded penicillin allergy.
      final ConflictResult r = checkConflict(p, 'Amoxicillin');
      expect(r.level, ConflictLevel.danger);
      expect(r.detail, contains('Penicillin'));
    });

    test('warns about a recent duplicate dose', () {
      final PatientProfile q = p.copy()
        ..treatmentLog.add(LogEntry(
          timestamp: DateTime.now()
              .subtract(const Duration(minutes: 30))
              .millisecondsSinceEpoch,
          responderId: 'EMT-1',
          action: 'Administered Morphine 5mg IV',
        ));
      final ConflictResult r = checkConflict(q, 'Morphine');
      expect(r.level, ConflictLevel.warning);
      expect(r.detail, contains('30 min ago'));
    });

    test('ignores a dose older than the 4-hour window', () {
      final PatientProfile q = p.copy()
        ..treatmentLog.add(LogEntry(
          timestamp: DateTime.now()
              .subtract(const Duration(hours: 5))
              .millisecondsSinceEpoch,
          responderId: 'EMT-1',
          action: 'Administered Morphine 5mg IV',
        ));
      expect(checkConflict(q, 'Morphine').level, ConflictLevel.ok);
    });

    test('warns about an interaction with a current medication', () {
      final ConflictResult r = checkConflict(p, 'Metformin');
      expect(r.level, ConflictLevel.warning);
    });

    test('passes an unrelated drug', () {
      expect(checkConflict(p, 'Saline').level, ConflictLevel.ok);
    });

    test('treats an empty drug name as a no-op', () {
      expect(checkConflict(p, '   ').level, ConflictLevel.ok);
      expect(checkConflict(p, '   ').title, isEmpty);
    });
  });
}
