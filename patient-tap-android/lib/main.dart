// ============================================================================
// Patient-Tap — Android (Flutter)
// Edge-Medical Sovereignty System: offline-first, end-to-end encrypted
// emergency medical identity on an NTAG215 card.
//
// Bootstrap order matters: local storage and the notification/timezone
// database must be ready before AppState reads them, and Supabase must be
// initialised before BackendService decides live-vs-demo.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import 'backend/supabase_client.dart';
import 'core/local_store.dart';
import 'core/reminder_service.dart';
import 'state/app_state.dart';
import 'theme/app_theme.dart';
import 'ui/app_shell.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Dark, edge-to-edge chrome that matches the app surface.
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: Color(0xFF0F1311),
    systemNavigationBarIconBrightness: Brightness.light,
  ));
  await SystemChrome.setPreferredOrientations(
    <DeviceOrientation>[DeviceOrientation.portraitUp],
  );

  await LocalStore.init();
  await ReminderService.init();

  // No-op when no credentials were supplied — the app then runs in demo mode.
  try {
    await Db.init();
  } catch (e) {
    debugPrint('[patient-tap] Supabase init failed, staying in demo mode: $e');
  }

  runApp(const PatientTapApp());
}

class PatientTapApp extends StatelessWidget {
  const PatientTapApp({super.key});

  @override
  Widget build(BuildContext context) => ChangeNotifierProvider<AppState>(
        create: (_) => AppState(),
        child: MaterialApp(
          title: 'Patient-Tap',
          debugShowCheckedModeBanner: false,
          theme: buildAppTheme(),
          home: const AppShell(),
          // Medical data must stay legible: clamp extreme system font scaling.
          builder: (BuildContext context, Widget? child) =>
              MediaQuery.withClampedTextScaling(
            minScaleFactor: 0.9,
            maxScaleFactor: 1.3,
            child: child!,
          ),
        ),
      );
}
