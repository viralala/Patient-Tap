// ============================================================================
// Application state — the Flutter port of components/AppContext.tsx.
//
// One ChangeNotifier owns: the profile, the lock/auth gates, navigation, the
// toast queue, and every backend-derived value (session, subscription, cloud
// preferences). Screens read it through Provider.
// ============================================================================

import 'dart:async';

import 'package:flutter/foundation.dart';

import '../backend/backend_service.dart';
import '../config/app_config.dart';
import '../core/local_store.dart';
import '../core/reminder_service.dart';
import '../models/patient_profile.dart';

enum TabKey { home, reminders, scan, responder, settings }

enum AppRoute { none, profileEdit, scanDoc, writeTag, auditLog }

class ToastMessage {
  const ToastMessage(this.message, {this.icon, this.iconColor});
  final String message;
  final String? icon;
  final Object? iconColor;
}

class AppState extends ChangeNotifier {
  AppState() {
    _boot();
  }

  // ---- Profile -------------------------------------------------------------
  PatientProfile _profile = emptyProfile();
  PatientProfile get profile => _profile;

  // ---- Gates ---------------------------------------------------------------
  bool _authReady = false;
  bool get authReady => _authReady;

  AppSession? _session;
  AppSession? get session => _session;

  bool _unlocked = false;
  bool get unlocked => _unlocked;

  /// Responder emergency access short-circuits every gate (F0.3 / F7).
  bool _responderOnly = false;
  bool get responderOnly => _responderOnly;

  // ---- Navigation ----------------------------------------------------------
  TabKey _tab = TabKey.home;
  TabKey get tab => _tab;

  AppRoute _route = AppRoute.none;
  AppRoute get route => _route;

  // ---- Toast ---------------------------------------------------------------
  ToastMessage? _toast;
  ToastMessage? get toast => _toast;
  Timer? _toastTimer;

  // ---- Backend -------------------------------------------------------------
  SubscriptionInfo _subscription = const SubscriptionInfo();
  SubscriptionInfo get subscription => _subscription;

  bool get isLive => BackendService.isLive;

  bool _cloudBackup = false;
  bool get cloudBackup => _cloudBackup;

  bool _alertsEnabled = false;
  bool get alertsEnabled => _alertsEnabled;

  StreamSubscription<AppSession?>? _authSub;
  Timer? _backupTimer;

  // ==========================================================================
  // Boot
  // ==========================================================================
  Future<void> _boot() async {
    _profile = LocalStore.loadProfile();
    _cloudBackup = LocalStore.cloudBackup;
    _alertsEnabled = LocalStore.alertsEnabled;
    notifyListeners();

    unawaited(ReminderService.rescheduleAll(_profile.medications));

    try {
      _session = await BackendService.getSession();
    } catch (_) {
      _session = null;
    }
    _authReady = true;
    notifyListeners();

    if (_session != null) unawaited(refreshSubscription());

    _authSub = BackendService.authChanges().listen((AppSession? s) {
      _session = s;
      _authReady = true;
      if (s == null) {
        _unlocked = false;
        _subscription = const SubscriptionInfo();
      } else {
        unawaited(refreshSubscription());
      }
      notifyListeners();
    });
  }

  @override
  void dispose() {
    _authSub?.cancel();
    _toastTimer?.cancel();
    _backupTimer?.cancel();
    super.dispose();
  }

  // ==========================================================================
  // Profile
  // ==========================================================================
  Future<void> setProfile(PatientProfile p) async {
    _profile = p;
    notifyListeners();

    await LocalStore.saveProfile(p);
    await ReminderService.rescheduleAll(p.medications);

    // Opportunistic, debounced E2E cloud backup.
    if (_cloudBackup && _session != null) {
      _backupTimer?.cancel();
      _backupTimer = Timer(const Duration(milliseconds: 1500), () async {
        await BackendService.saveProfileBackup(p);
        if (_alertsEnabled) {
          await BackendService.saveEmergencyContacts(p.emergencyContacts);
        }
      });
    }
  }

  Future<bool> backupNow() async {
    final bool ok = await BackendService.saveProfileBackup(_profile);
    if (ok && _alertsEnabled) {
      await BackendService.saveEmergencyContacts(_profile.emergencyContacts);
    }
    return ok;
  }

  Future<bool> restoreFromCloud() async {
    final PatientProfile? restored =
        await BackendService.restoreProfileBackup();
    if (restored == null) return false;
    _profile = restored;
    notifyListeners();
    await LocalStore.saveProfile(restored);
    await ReminderService.rescheduleAll(restored.medications);
    return true;
  }

  // ==========================================================================
  // Gates
  // ==========================================================================
  void setUnlocked(bool v) {
    _unlocked = v;
    notifyListeners();
  }

  void enterResponderOnly() {
    _responderOnly = true;
    notifyListeners();
  }

  void exitResponderOnly() {
    _responderOnly = false;
    notifyListeners();
  }

  Future<void> signIn() async {
    final AppSession? s = await BackendService.signInWithGoogle();
    if (s != null) {
      _session = s;
      _authReady = true;
      notifyListeners();
      unawaited(refreshSubscription());
    }
  }

  Future<void> signOutApp() async {
    await BackendService.signOut();
    _session = null;
    _unlocked = false;
    _subscription = const SubscriptionInfo();
    notifyListeners();
  }

  // ==========================================================================
  // Navigation
  // ==========================================================================
  void setTab(TabKey t) {
    _route = AppRoute.none;
    _tab = t;
    notifyListeners();
  }

  void setRoute(AppRoute r) {
    _route = r;
    notifyListeners();
  }

  void closeRoute() => setRoute(AppRoute.none);

  // ==========================================================================
  // Toast
  // ==========================================================================
  void showToast(String message, {String? icon, Object? iconColor}) {
    _toast = ToastMessage(message, icon: icon, iconColor: iconColor);
    notifyListeners();
    _toastTimer?.cancel();
    _toastTimer = Timer(const Duration(milliseconds: 2600), () {
      _toast = null;
      notifyListeners();
    });
  }

  // ==========================================================================
  // Backend-derived state
  // ==========================================================================
  Future<void> refreshSubscription() async {
    try {
      _subscription = await BackendService.getSubscription();
      notifyListeners();
    } catch (_) {
      /* offline — keep last known */
    }
  }

  Future<void> setCloudBackup(bool v) async {
    _cloudBackup = v;
    notifyListeners();
    await LocalStore.setCloudBackup(v);
    if (v && _session != null) await backupNow();
  }

  Future<void> setAlertsEnabled(bool v) async {
    _alertsEnabled = v;
    notifyListeners();
    await LocalStore.setAlertsEnabled(v);
    if (v && _session != null) {
      await BackendService.saveEmergencyContacts(_profile.emergencyContacts);
    }
  }

  // ---- Convenience ---------------------------------------------------------
  Tier get tier => _subscription.tier;

  /// Premium-gated features (cloud backup, alerts, share links, audit log).
  bool get hasPremium => _subscription.tier != Tier.free;

  String get initials {
    final String source = _profile.name.trim().isNotEmpty
        ? _profile.name
        : (_session?.user.name ?? 'Me');
    final List<String> parts =
        source.split(RegExp(r'\s+')).where((String s) => s.isNotEmpty).toList();
    if (parts.isEmpty) return 'ME';
    return parts
        .take(2)
        .map((String s) => s[0].toUpperCase())
        .join();
  }
}
