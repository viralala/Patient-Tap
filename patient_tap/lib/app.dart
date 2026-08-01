import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'screens/onboarding/onboarding_screen.dart';
import 'screens/patient/patient_shell.dart';
import 'screens/responder/responder_shell.dart';
import 'state/app_state.dart';
import 'state/patient_controller.dart';
import 'state/responder_controller.dart';
import 'theme/app_theme.dart';

/// Root app widget. Registers app-wide state and picks the top-level surface
/// (onboarding vs. the role-appropriate shell) from [AppState].
class PatientTapApp extends StatelessWidget {
  const PatientTapApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Optional deep-link hook (used for demos/screenshots), e.g.
    // `?screen=patient|responder|log`. Harmless when absent.
    final screen = Uri.base.queryParameters['screen'];
    final startResponder = screen == 'responder' || screen == 'log';
    final onboardingDone = screen == 'patient' || startResponder;
    final initialMode = startResponder ? AppMode.responder : AppMode.patient;
    final responderTab = screen == 'log' ? 2 : (screen == 'responder' ? 1 : 0);

    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) =>
              AppState(onboardingComplete: onboardingDone, mode: initialMode),
        ),
        ChangeNotifierProvider(create: (_) => PatientController()),
        ChangeNotifierProvider(
          create: (_) => ResponderController(seedScanned: startResponder),
        ),
      ],
      child: MaterialApp(
        title: 'Patient-Tap',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light,
        home: _AppRoot(responderInitialTab: responderTab),
      ),
    );
  }
}

/// Swaps between onboarding and the active role's shell. Because this is the
/// MaterialApp `home`, flipping the role here re-parents the whole UI without
/// a restart — the persistent [RoleSwitch] just toggles [AppState.mode].
class _AppRoot extends StatelessWidget {
  const _AppRoot({this.responderInitialTab = 0});

  final int responderInitialTab;

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();

    late final Widget surface;
    if (!app.onboardingComplete) {
      surface = const OnboardingScreen();
    } else if (app.isPatient) {
      surface = const PatientShell();
    } else {
      surface = ResponderShell(initialIndex: responderInitialTab);
    }

    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 300),
      switchInCurve: Curves.easeOut,
      switchOutCurve: Curves.easeIn,
      child: KeyedSubtree(
        key: ValueKey(
          '${app.onboardingComplete}-${app.mode}',
        ),
        child: surface,
      ),
    );
  }
}
