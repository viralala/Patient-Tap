/// Blood type enum. Order/values are stable so they can map directly onto a
/// protobuf enum field once Backend hands over the real schema.
enum BloodType {
  unknown('Unknown'),
  aPos('A+'),
  aNeg('A-'),
  bPos('B+'),
  bNeg('B-'),
  abPos('AB+'),
  abNeg('AB-'),
  oPos('O+'),
  oNeg('O-');

  const BloodType(this.label);

  /// Human-readable label shown in the UI (e.g. "O-").
  final String label;

  static BloodType fromLabel(String? label) {
    return BloodType.values.firstWhere(
      (b) => b.label == label,
      orElse: () => BloodType.unknown,
    );
  }
}
