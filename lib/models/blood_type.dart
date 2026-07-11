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

  /// Wire-format enum value (BloodTypeProto.*). Relies on [BloodType]'s
  /// declaration order exactly matching the `BloodType` enum in
  /// proto/patient_tap.proto (unknown=0 ... oNeg=8).
  int get toProtoValue => index;

  /// Reconstructs a [BloodType] from a protobuf enum value. Falls back to
  /// [BloodType.unknown] for any out-of-range value (e.g. a newer wire
  /// format written by a future app version).
  static BloodType fromProtoValue(int value) {
    if (value < 0 || value >= BloodType.values.length) {
      return BloodType.unknown;
    }
    return BloodType.values[value];
  }
}
