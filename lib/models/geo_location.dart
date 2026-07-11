import 'proto/patient_profile.pb.dart';

/// A GPS fix attached to an outgoing emergency alert. Named `GeoLocation` to
/// avoid clashing with Flutter/plugin `Location` types when the real
/// geolocation package is added by the Alerts/Demo dev.
class GeoLocation {
  const GeoLocation({
    required this.latitude,
    required this.longitude,
    this.accuracyMeters,
    this.capturedAt,
  });

  final double latitude;
  final double longitude;
  final double? accuracyMeters;
  final DateTime? capturedAt;

  Map<String, dynamic> toMap() => {
        'latitude': latitude,
        'longitude': longitude,
        'accuracyMeters': accuracyMeters,
        'capturedAt': capturedAt?.toUtc().toIso8601String(),
      };

  factory GeoLocation.fromMap(Map<String, dynamic> map) => GeoLocation(
        latitude: (map['latitude'] as num?)?.toDouble() ?? 0,
        longitude: (map['longitude'] as num?)?.toDouble() ?? 0,
        accuracyMeters: (map['accuracyMeters'] as num?)?.toDouble(),
        capturedAt:
            DateTime.tryParse((map['capturedAt'] ?? '') as String)?.toLocal(),
      );

  /// Compact "lat, lng" string for display.
  String get pretty =>
      '${latitude.toStringAsFixed(5)}, ${longitude.toStringAsFixed(5)}';

  /// Converts to the protobuf-shaped message (see proto/patient_tap.proto).
  /// `capturedAt` is encoded as unix seconds (int64), not an ISO string.
  GeoLocationMessage toProtoMessage() => GeoLocationMessage(
        latitude: latitude,
        longitude: longitude,
        accuracyMeters: accuracyMeters ?? 0.0,
        capturedAtUnix: capturedAt == null
            ? 0
            : capturedAt!.toUtc().millisecondsSinceEpoch ~/ 1000,
      );

  /// Reconstructs a [GeoLocation] from a protobuf-shaped message. A `0`
  /// `capturedAtUnix` is treated as "absent" (mirrors the nullable field),
  /// matching proto3's implicit-presence semantics for default values.
  factory GeoLocation.fromProtoMessage(GeoLocationMessage m) => GeoLocation(
        latitude: m.latitude,
        longitude: m.longitude,
        accuracyMeters: m.accuracyMeters == 0.0 ? null : m.accuracyMeters,
        capturedAt: m.capturedAtUnix == 0
            ? null
            : DateTime.fromMillisecondsSinceEpoch(
                m.capturedAtUnix * 1000,
                isUtc: true,
              ).toLocal(),
      );
}
