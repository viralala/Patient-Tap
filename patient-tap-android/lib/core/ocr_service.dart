// ============================================================================
// Document auto-fill (F2).
//
// UPGRADE OVER THE WEB BUILD: there is no offline OCR engine in a browser, so
// the Next.js app stubbed the recognition step. On Android we run the *real*
// thing — Google ML Kit Text Recognition, fully on-device, no network. The
// field parser below is the same real parser.
//
// The parser is scoped to labelled fields (PRD §6.2 honest-scoping note) — it
// does not attempt to understand arbitrary free-text reports.
// ============================================================================

import 'dart:io';

import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';
import 'package:image_picker/image_picker.dart';

import '../models/patient_profile.dart';

class ParsedFields {
  ParsedFields({
    this.name,
    this.bloodType,
    List<String>? allergies,
    List<MedEntry>? medications,
    this.dnrFlag,
  })  : allergies = allergies ?? <String>[],
        medications = medications ?? <MedEntry>[];

  // Fields we could not confidently extract are simply left absent (F2.5).
  String? name;
  String? bloodType;
  List<String> allergies;
  List<MedEntry> medications;
  bool? dnrFlag;

  bool get isEmpty =>
      name == null &&
      bloodType == null &&
      allergies.isEmpty &&
      medications.isEmpty &&
      (dnrFlag ?? false) == false;
}

class OcrService {
  OcrService._();

  static final ImagePicker _picker = ImagePicker();

  /// Pick an image (camera or gallery) and run real on-device OCR over it.
  /// Returns the recognised raw text, or null if the user cancelled.
  static Future<String?> scanImage({required ImageSource source}) async {
    final XFile? file = await _picker.pickImage(
      source: source,
      imageQuality: 92,
    );
    if (file == null) return null;
    return recognizeFile(File(file.path));
  }

  /// Run ML Kit Latin-script text recognition over an image file, on-device.
  static Future<String> recognizeFile(File file) async {
    final TextRecognizer recognizer =
        TextRecognizer(script: TextRecognitionScript.latin);
    try {
      final RecognizedText result =
          await recognizer.processImage(InputImage.fromFile(file));
      return result.text;
    } finally {
      await recognizer.close();
    }
  }

  /// Pick an image and return both its path (for the preview) and its text.
  static Future<({String path, String text})?> pickAndRecognize(
      ImageSource source) async {
    final XFile? file = await _picker.pickImage(
      source: source,
      imageQuality: 92,
    );
    if (file == null) return null;
    final String text = await recognizeFile(File(file.path));
    return (path: file.path, text: text);
  }
}

// ===========================================================================
// Field parser — real, and shared verbatim with the web build.
// ===========================================================================

List<String> _cleanList(String raw) => raw
    .split(RegExp(r'[,;/]|\band\b', caseSensitive: false))
    .map((String s) => s.trim().replaceAll(RegExp(r'\.$'), ''))
    .where((String s) => s.length > 1 && s.length < 40)
    .toList();

ParsedFields parseFieldsFromText(String text) {
  final ParsedFields out = ParsedFields();

  for (final String line in text.split(RegExp(r'\r?\n'))) {
    final String l = line.trim();
    if (l.isEmpty) continue;

    // Name
    final RegExpMatch? nameM =
        RegExp(r'^(?:patient\s*name|name)\s*[:\-]\s*(.+)$', caseSensitive: false)
            .firstMatch(l);
    if (nameM != null && out.name == null) {
      out.name = nameM.group(1)!.trim();
    }

    // Blood group / type
    final RegExpMatch? btM = RegExp(
      r'blood\s*(?:group|type)\s*[:\-]\s*([ABO][+\-]?B?[+\-]?)',
      caseSensitive: false,
    ).firstMatch(l);
    if (btM != null) {
      final String bt = btM.group(1)!.toUpperCase().replaceAll(' ', '');
      if (kBloodTypes.contains(bt)) out.bloodType = bt;
    }

    // Allergies
    final RegExpMatch? alM = RegExp(
      r'(?:allerg(?:y|ies|ic\s*to))\s*[:\-]\s*(.+)$',
      caseSensitive: false,
    ).firstMatch(l);
    if (alM != null) {
      final String body = alM.group(1)!;
      if (!RegExp(r'^(none|nil|nka|no known)', caseSensitive: false)
          .hasMatch(body)) {
        out.allergies.addAll(_cleanList(body));
      }
    }

    // DNR
    if (RegExp(r'\bDNR\b|do[-\s]?not[-\s]?resuscitate', caseSensitive: false)
        .hasMatch(l)) {
      if (RegExp(r'\b(yes|positive|confirmed|active)\b', caseSensitive: false)
          .hasMatch(l)) {
        out.dnrFlag = true;
      }
    }

    // Medication: "Rx:", "Medication:", or "Drug 500mg twice daily"
    final RegExpMatch? medM = RegExp(
      r'(?:rx|medication|drug|tab|prescribed)\s*[:\-]?\s*(.+)$',
      caseSensitive: false,
    ).firstMatch(l);
    if (medM != null) {
      final MedEntry? med = _parseMedLine(medM.group(1)!);
      if (med != null) out.medications.add(med);
    }
  }

  // De-dupe allergies, preserving order.
  final Set<String> seen = <String>{};
  out.allergies = out.allergies
      .map((String a) => a.trim())
      .where((String a) => a.isNotEmpty && seen.add(a.toLowerCase()))
      .toList();

  return out;
}

MedEntry? _parseMedLine(String raw) {
  final RegExpMatch? doseM =
      RegExp(r'(\d+\s?(?:mg|mcg|ml|g|iu|units?))', caseSensitive: false)
          .firstMatch(raw);
  final RegExpMatch? freqM = RegExp(
    r'(once|twice|thrice|\d+\s*(?:x|times))\s*(?:a\s*|per\s*)?'
    r'(?:day|daily|week|weekly|night|morning|bd|od|tds)?',
    caseSensitive: false,
  ).firstMatch(raw);

  // Name = leading words before the dose token.
  String name = doseM != null ? raw.substring(0, doseM.start) : raw;
  name = name.replaceAll(RegExp(r'[:\-]+$'), '').trim();
  if (name.length < 2) return null;

  return MedEntry(
    name: name.replaceAllMapped(
        RegExp(r'\b\w'), (Match m) => m.group(0)!.toUpperCase()),
    dose: doseM != null ? doseM.group(1)!.replaceAll(' ', '') : '',
    frequency: freqM != null ? _normalizeFreq(freqM.group(0)!) : '',
  );
}

String _normalizeFreq(String f) {
  final String s = f.toLowerCase();
  if (RegExp(r'twice|2\s*(x|times)|bd').hasMatch(s)) return 'Twice daily';
  if (RegExp(r'thrice|3\s*(x|times)|tds').hasMatch(s)) {
    return 'Three times daily';
  }
  if (RegExp(r'once|1\s*(x|time)|od|daily').hasMatch(s)) return 'Once daily';
  if (RegExp(r'night').hasMatch(s)) return 'Once at night';
  if (RegExp(r'morning').hasMatch(s)) return 'Once in the morning';
  return f.trim();
}

// Two clean sample documents so the flow is demoable without a real document.
class SampleDoc {
  const SampleDoc(this.label, this.text);
  final String label;
  final String text;
}

const List<SampleDoc> kSampleDocs = <SampleDoc>[
  SampleDoc('Discharge summary', '''CITY GENERAL HOSPITAL — DISCHARGE SUMMARY
Patient Name: Aarav Mehta
Blood Group: O+
Allergic to: Penicillin, Sulfa drugs
DNR: No
Rx: Metformin 500mg twice daily
Medication: Atorvastatin 20mg once at night
Follow-up in 2 weeks.'''),
  SampleDoc('Prescription slip', '''Dr. S. Rao, MBBS MD
Name: Rohan Kapoor
Blood Type: B+
Allergy: Aspirin
Rx: Amlodipine 5mg once daily
Drug: Losartan 50mg once daily'''),
];
