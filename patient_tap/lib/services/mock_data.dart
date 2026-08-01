import '../models/blood_type.dart';
import '../models/contact_ref.dart';
import '../models/geo_location.dart';
import '../models/log_entry.dart';
import '../models/med_entry.dart';
import '../models/patient_profile.dart';

/// Hard-coded fake data used everywhere a real backend would supply values.
///
/// Everything here is display-only sample content so the UI can be built and
/// demoed end-to-end before Backend / NFC / Alerts land their real code.
class MockData {
  MockData._();

  /// The record a Responder "reads" off a scanned tag in the demo.
  static PatientProfile scannedPatient() {
    final now = DateTime.now();
    return PatientProfile(
      patientId: 'PT-0007',
      name: 'Arjun Mehta',
      bloodType: BloodType.oNeg,
      dnr: true, // critical → drives the warning-red responder UI
      allergies: const ['Penicillin', 'Peanuts', 'Latex'],
      medications: const [
        MedEntry(name: 'Metformin', dose: '500mg', frequency: '2x daily'),
        MedEntry(name: 'Atorvastatin', dose: '20mg', frequency: 'Nightly'),
        MedEntry(name: 'Warfarin', dose: '5mg', frequency: 'Daily'),
      ],
      emergencyContacts: const [
        ContactRef(
          name: 'Priya Mehta',
          phone: '+91 98765 43210',
          relation: 'Spouse',
        ),
        ContactRef(
          name: 'Dr. Rao',
          phone: '+91 90123 45678',
          relation: 'Physician',
        ),
      ],
      treatmentLog: [
        LogEntry(
          timestamp: now.subtract(const Duration(minutes: 42)),
          responderId: 'PARAMEDIC-4471',
          action: 'Administered 10mg morphine IV for pain management.',
        ),
        LogEntry(
          timestamp: now.subtract(const Duration(minutes: 30)),
          responderId: 'PARAMEDIC-4471',
          action: 'Applied pressure dressing to left forearm laceration.',
        ),
        LogEntry(
          timestamp: now.subtract(const Duration(minutes: 12)),
          responderId: 'ER-NURSE-208',
          action: 'Vitals recorded: BP 118/76, HR 92, SpO2 97%.',
        ),
      ],
      updatedAt: now.subtract(const Duration(hours: 6)),
    );
  }

  /// A fully-populated record for the app owner, so Patient mode shows a
  /// realistic dashboard on first launch (pre-seeded demo patient).
  static PatientProfile demoPatientOwner() {
    final now = DateTime.now();
    return PatientProfile(
      patientId: 'PT-1042',
      name: 'Alex Harmozi',
      bloodType: BloodType.aPos,
      dnr: false,
      allergies: const ['Sulfa drugs', 'Shellfish'],
      medications: const [
        MedEntry(name: 'Lisinopril', dose: '10mg', frequency: 'Daily'),
        MedEntry(name: 'Aspirin', dose: '81mg', frequency: 'Daily'),
      ],
      emergencyContacts: const [
        ContactRef(
          name: 'Jordan Harmozi',
          phone: '+91 99887 66554',
          relation: 'Sibling',
        ),
      ],
      treatmentLog: const [],
      updatedAt: now.subtract(const Duration(days: 1, hours: 3)),
    );
  }

  /// A blank-ish starter for a brand-new Patient beginning onboarding.
  static PatientProfile newPatientDraft() => PatientProfile(
        patientId: 'PT-${DateTime.now().millisecondsSinceEpoch % 10000}',
        name: '',
      );

  /// Mock GPS fix used when an alert is fired opportunistically.
  static GeoLocation demoLocation() => GeoLocation(
        latitude: 21.17024,
        longitude: 72.83106, // Surat, GJ — demo coordinates
        accuracyMeters: 8.5,
        capturedAt: DateTime.now(),
      );
}
