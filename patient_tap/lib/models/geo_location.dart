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
}
