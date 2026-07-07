/// A single medication row. Maps to the `MedEntry` protobuf message.
///
/// Fields intentionally mirror the wire schema so Backend's real
/// encrypt/decrypt round-trips this model without a UI-side refactor.
class MedEntry {
  const MedEntry({
    required this.name,
    required this.dose,
    required this.frequency,
  });

  final String name; // e.g. "Metformin"
  final String dose; // e.g. "500mg"
  final String frequency; // e.g. "2x daily"

  MedEntry copyWith({String? name, String? dose, String? frequency}) {
    return MedEntry(
      name: name ?? this.name,
      dose: dose ?? this.dose,
      frequency: frequency ?? this.frequency,
    );
  }

  Map<String, dynamic> toMap() => {
        'name': name,
        'dose': dose,
        'frequency': frequency,
      };

  factory MedEntry.fromMap(Map<String, dynamic> map) => MedEntry(
        name: (map['name'] ?? '') as String,
        dose: (map['dose'] ?? '') as String,
        frequency: (map['frequency'] ?? '') as String,
      );

  /// Compact one-line summary for list rows, e.g. "Metformin · 500mg · 2x daily".
  String get summary => [name, dose, frequency]
      .where((s) => s.trim().isNotEmpty)
      .join('  ·  ');
}
