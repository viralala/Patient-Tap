// ============================================================================
// Medication reminders (F3) — fully offline via Android local notifications.
//
// UPGRADE OVER THE WEB BUILD: the browser could only fire a reminder while the
// page was open (setTimeout + Notification API). Here we hand each reminder to
// AlarmManager through flutter_local_notifications, so it fires daily even when
// the app is closed and the device is offline or rebooted.
// ============================================================================

import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_timezone/flutter_timezone.dart';
import 'package:timezone/data/latest_all.dart' as tzdata;
import 'package:timezone/timezone.dart' as tz;

import '../models/patient_profile.dart';

class ScheduledReminder {
  const ScheduledReminder({required this.med, required this.fireAt});
  final MedEntry med;
  final DateTime fireAt;
}

class ReminderService {
  ReminderService._();

  static final FlutterLocalNotificationsPlugin _plugin =
      FlutterLocalNotificationsPlugin();

  static const String _channelId = 'patienttap.medication';
  static const String _channelName = 'Medication reminders';
  static const String _channelDesc =
      'Offline daily reminders for your medication schedule.';

  static bool _ready = false;

  /// Called once during bootstrap. Safe to call more than once.
  static Future<void> init() async {
    if (_ready) return;

    tzdata.initializeTimeZones();
    try {
      final TimezoneInfo info = await FlutterTimezone.getLocalTimezone();
      tz.setLocalLocation(tz.getLocation(info.identifier));
    } catch (_) {
      // Fall back to UTC — reminders still fire, just anchored differently.
    }

    const AndroidInitializationSettings android =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    await _plugin.initialize(
      settings: const InitializationSettings(android: android),
    );

    await _plugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(
          const AndroidNotificationChannel(
            _channelId,
            _channelName,
            description: _channelDesc,
            importance: Importance.high,
          ),
        );

    _ready = true;
  }

  static AndroidFlutterLocalNotificationsPlugin? get _android =>
      _plugin.resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin>();

  /// Ask for POST_NOTIFICATIONS (Android 13+) and exact-alarm rights (14+).
  static Future<bool> ensurePermission() async {
    await init();
    final bool granted = await _android?.requestNotificationsPermission() ?? false;
    // Exact alarms make a 09:00 reminder land at 09:00 rather than whenever the
    // system next batches work. Not fatal if refused.
    await _android?.requestExactAlarmsPermission();
    return granted;
  }

  static Future<bool> isPermissionGranted() async {
    await init();
    return await _android?.areNotificationsEnabled() ?? false;
  }

  static Future<bool> canScheduleExact() async {
    await init();
    return await _android?.canScheduleExactNotifications() ?? false;
  }

  // -------------------------------------------------------------------------
  // Scheduling
  // -------------------------------------------------------------------------

  /// Stable notification id for a medication, derived from its name so
  /// rescheduling replaces rather than duplicates.
  static int _idFor(String medName) => medName.hashCode & 0x7fffffff;

  static NotificationDetails get _details => const NotificationDetails(
        android: AndroidNotificationDetails(
          _channelId,
          _channelName,
          channelDescription: _channelDesc,
          importance: Importance.high,
          priority: Priority.high,
          category: AndroidNotificationCategory.reminder,
        ),
      );

  /// Next occurrence of "HH:MM" local time — today if still ahead, else tomorrow.
  static tz.TZDateTime nextFireTime(String hhmm, {DateTime? from}) {
    final List<String> parts = hhmm.split(':');
    final int h = int.tryParse(parts.first) ?? 9;
    final int m = parts.length > 1 ? (int.tryParse(parts[1]) ?? 0) : 0;

    final tz.TZDateTime now = from == null
        ? tz.TZDateTime.now(tz.local)
        : tz.TZDateTime.from(from, tz.local);

    tz.TZDateTime next =
        tz.TZDateTime(tz.local, now.year, now.month, now.day, h, m);
    if (!next.isAfter(now)) next = next.add(const Duration(days: 1));
    return next;
  }

  /// Schedule (or reschedule) one medication's daily reminder.
  static Future<void> scheduleReminder(MedEntry med) async {
    await init();
    await cancelReminder(med);
    final String? at = med.reminderTime;
    if (!med.reminderEnabled || at == null || at.isEmpty) return;

    final bool exact = await canScheduleExact();

    await _plugin.zonedSchedule(
      id: _idFor(med.name),
      title: '💊 Time for ${med.name}',
      body: <String>[med.dose, med.frequency]
          .where((String s) => s.isNotEmpty)
          .join(' · '),
      scheduledDate: nextFireTime(at),
      notificationDetails: _details,
      androidScheduleMode: exact
          ? AndroidScheduleMode.exactAllowWhileIdle
          : AndroidScheduleMode.inexactAllowWhileIdle,
      // Repeat daily at this wall-clock time.
      matchDateTimeComponents: DateTimeComponents.time,
      payload: med.name,
    );
  }

  static Future<void> cancelReminder(MedEntry med) async {
    await init();
    await _plugin.cancel(id: _idFor(med.name));
  }

  /// Re-apply the whole schedule — called whenever the profile changes.
  static Future<void> rescheduleAll(List<MedEntry> meds) async {
    await init();
    await _plugin.cancelAllPendingNotifications();
    for (final MedEntry m in meds) {
      if (m.reminderEnabled && (m.reminderTime?.isNotEmpty ?? false)) {
        await scheduleReminder(m);
      }
    }
  }

  /// Everything currently queued with the OS, soonest first.
  static Future<List<ScheduledReminder>> scheduled(List<MedEntry> meds) async {
    await init();
    final List<PendingNotificationRequest> pending =
        await _plugin.pendingNotificationRequests();
    final Set<int> ids = pending.map((PendingNotificationRequest p) => p.id).toSet();

    final List<ScheduledReminder> out = <ScheduledReminder>[];
    for (final MedEntry m in meds) {
      final String? at = m.reminderTime;
      if (!m.reminderEnabled || at == null || at.isEmpty) continue;
      if (!ids.contains(_idFor(m.name))) continue;
      out.add(ScheduledReminder(med: m, fireAt: nextFireTime(at)));
    }
    out.sort((ScheduledReminder a, ScheduledReminder b) =>
        a.fireAt.compareTo(b.fireAt));
    return out;
  }

  /// Fire a reminder in [seconds] — lets a demo show a real notification.
  static Future<void> fireTestReminder(MedEntry med,
      {int seconds = 4}) async {
    await init();
    await _plugin.zonedSchedule(
      id: 999001,
      title: '💊 Time for ${med.name}',
      body: <String>[med.dose, med.frequency]
          .where((String s) => s.isNotEmpty)
          .join(' · '),
      scheduledDate:
          tz.TZDateTime.now(tz.local).add(Duration(seconds: seconds)),
      notificationDetails: _details,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
    );
  }
}
