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
}
