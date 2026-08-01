import 'package:flutter/foundation.dart';

/// Which role/shell the single app is currently showing.
enum AppMode { patient, responder }

/// Top-level app state: onboarding completion + the active role.
///
/// The role is a toggle, not a permanent lock-in (see the app bar switch), so
/// both shells stay reachable at runtime without restarting.
class AppState extends ChangeNotifier {
  AppState({bool onboardingComplete = false, AppMode mode = AppMode.patient})
      : _onboardingComplete = onboardingComplete,
        _mode = mode;

  bool _onboardingComplete;
  AppMode _mode;

  bool get onboardingComplete => _onboardingComplete;
  AppMode get mode => _mode;
  bool get isPatient => _mode == AppMode.patient;
  bool get isResponder => _mode == AppMode.responder;

  /// Called at the end of the onboarding flow with the user's chosen role.
  void completeOnboarding(AppMode initialMode) {
    _onboardingComplete = true;
    _mode = initialMode;
    notifyListeners();
  }

  void setMode(AppMode mode) {
    if (_mode == mode) return;
    _mode = mode;
    notifyListeners();
  }

  /// Flip between Patient and Responder from the persistent header switch.
  void toggleMode() {
    _mode = isPatient ? AppMode.responder : AppMode.patient;
    notifyListeners();
  }

  /// Test/demo helper to send the user back through onboarding.
  void resetOnboarding() {
    _onboardingComplete = false;
    notifyListeners();
  }
}
