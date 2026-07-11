import 'proto/patient_profile.pb.dart';

/// A single treatment-log entry (chain-of-custody record). Maps to the
/// `LogEntry` protobuf message.
///
/// Entries are append-only in the real system; the UI treats the list as
/// immutable history and only ever adds to the tail.
class LogEntry {
  const LogEntry({
    required this.timestamp,
    required this.responderId,
    required this.action,
  });

  final DateTime timestamp; // auto-filled at capture time
  final String responderId; // e.g. "PARAMEDIC-4471"
  final String action; // e.g. "Administered 10mg morphine IV"

  LogEntry copyWith({
    DateTime? timestamp,
    String? responderId,
    String? action,
  }) {
    return LogEntry(
      timestamp: timestamp ?? this.timestamp,
      responderId: responderId ?? this.responderId,
      action: action ?? this.action,
    );
  }

  Map<String, dynamic> toMap() => {
        'timestamp': timestamp.toUtc().toIso8601String(),
        'responderId': responderId,
        'action': action,
      };

  factory LogEntry.fromMap(Map<String, dynamic> map) => LogEntry(
        timestamp:
            DateTime.tryParse((map['timestamp'] ?? '') as String)?.toLocal() ??
                DateTime.now(),
        responderId: (map['responderId'] ?? '') as String,
        action: (map['action'] ?? '') as String,
      );

  /// Converts to the protobuf-shaped message (see proto/patient_tap.proto).
  /// Timestamp is encoded as unix seconds (int64), not an ISO string, to
  /// save bytes on the wire.
  LogEntryMessage toProtoMessage() => LogEntryMessage(
        timestampUnix: timestamp.toUtc().millisecondsSinceEpoch ~/ 1000,
        responderId: responderId,
        action: action,
      );

  /// Reconstructs a [LogEntry] from a protobuf-shaped message.
  factory LogEntry.fromProtoMessage(LogEntryMessage m) => LogEntry(
        timestamp: DateTime.fromMillisecondsSinceEpoch(
          m.timestampUnix * 1000,
          isUtc: true,
        ).toLocal(),
        responderId: m.responderId,
        action: m.action,
      );
}
