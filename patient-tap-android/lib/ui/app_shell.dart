// ============================================================================
// The app shell — gate order and the bottom tab bar (port of App.tsx).
//
//   responder-only  →  Responder (no login, no PIN — life-safety escape hatch)
//   !authReady      →  splash
//   !session        →  SignIn        (Gate 1: Google, or an offline profile)
//   !unlocked       →  Lock          (Gate 2: local PIN / biometrics)
//   otherwise       →  tabs + routes
//
// The web build drew a fake phone frame with a fake status bar; on a real
// device that would be nonsense, so here the OS status bar is styled to match
// and the interior layout is identical.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/app_state.dart';
import '../theme/tokens.dart';
import 'icons.dart';
import 'screens/home.dart';
import 'screens/lock.dart';
import 'screens/profile_edit.dart';
import 'screens/reminders.dart';
import 'screens/responder.dart';
import 'screens/scan_doc.dart';
import 'screens/settings.dart';
import 'screens/sign_in.dart';
import 'screens/write_tag.dart';
import 'widgets/base.dart' as w;
import 'widgets/feedback.dart' as f;

class AppShell extends StatelessWidget {
  const AppShell({super.key});

  @override
  Widget build(BuildContext context) {
    final AppState app = context.watch<AppState>();

    return Scaffold(
      backgroundColor: C.background,
      resizeToAvoidBottomInset: true,
      body: Stack(
        children: <Widget>[
          Positioned.fill(child: _body(app)),
          // Grain sits above everything and never intercepts touches.
          const Positioned.fill(child: w.GrainOverlay()),
          // Listens on its own, so a toast never rebuilds the screens.
          Positioned.fill(
            child: ValueListenableBuilder<ToastMessage?>(
              valueListenable: app.toast,
              builder: (BuildContext context, ToastMessage? t, _) => t == null
                  ? const SizedBox.shrink()
                  : IgnorePointer(
                      child: f.Toast(
                        message: t.message,
                        icon: t.icon,
                        iconColor: t.iconColor as Color?,
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _body(AppState app) {
    // Responder emergency access short-circuits every gate (F0.3 / F7).
    if (app.responderOnly && !app.unlocked) {
      return SafeArea(
        child: Column(
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.fromLTRB(18, 6, 18, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: <Widget>[
                  const Flexible(
                    child: w.Eyebrow('Emergency access · no login'),
                  ),
                  w.PillCta(
                    label: 'Exit',
                    icon: Ico.lock,
                    onTap: app.exitResponderOnly,
                  ),
                ],
              ),
            ),
            const Expanded(child: ResponderScreen()),
          ],
        ),
      );
    }

    // Brief splash while we check for an existing session.
    if (!app.authReady) {
      return const Center(
        child: AppIcon(Ico.heart, size: 30, color: C.accent),
      );
    }

    // Gate 1 — Google sign-in, or "continue without an account".
    if (app.session == null) return const SignInScreen();

    // Gate 2 — local PIN (fast on-device re-lock; defence in depth).
    if (!app.unlocked) {
      return LockScreen(
        footer: w.Btn(
          label: "I'm a responder — scan without unlocking",
          kind: w.BtnKind.ghost,
          icon: Ico.stethoscope,
          color: C.info,
          onTap: app.enterResponderOnly,
        ),
      );
    }

    // Full-screen routes push over the tabs and hide the tab bar.
    final Widget content = switch (app.route) {
      AppRoute.profileEdit => const ProfileEditScreen(),
      AppRoute.scanDoc => const ScanDocScreen(),
      AppRoute.writeTag => const WriteTagScreen(),
      AppRoute.auditLog => const SettingsScreen(),
      AppRoute.none => _tabView(app.tab),
    };

    return SafeArea(
      bottom: false,
      child: Column(
        children: <Widget>[
          Expanded(child: content),
          if (app.route == AppRoute.none) const _TabBar(),
        ],
      ),
    );
  }

  Widget _tabView(TabKey tab) => switch (tab) {
        TabKey.home => const HomeScreen(),
        TabKey.reminders => const RemindersScreen(),
        TabKey.scan => const WriteTagScreen(),
        TabKey.responder => const ResponderScreen(),
        TabKey.settings => const SettingsScreen(),
      };
}

// --------------------------------------------------------------- tab bar ----

class _TabBar extends StatelessWidget {
  const _TabBar();

  @override
  Widget build(BuildContext context) {
    final AppState app = context.watch<AppState>();
    final double bottomInset = MediaQuery.of(context).padding.bottom;

    return Container(
      height: Sp.tabBarHeight + bottomInset,
      padding: EdgeInsets.fromLTRB(4, 8, 4, 10 + bottomInset),
      decoration: const BoxDecoration(
        color: Color(0xEB0F1311),
        border: Border(top: BorderSide(color: C.border)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: <Widget>[
          _Tab(
            tab: TabKey.home,
            label: 'Home',
            icon: Ico.home,
            active: app.tab == TabKey.home,
          ),
          _Tab(
            tab: TabKey.reminders,
            label: 'Reminders',
            icon: Ico.bell,
            active: app.tab == TabKey.reminders,
          ),
          _Tab(
            tab: TabKey.scan,
            label: 'Tag',
            icon: Ico.nfc,
            active: app.tab == TabKey.scan,
            primary: true,
          ),
          _Tab(
            tab: TabKey.responder,
            label: 'Responder',
            icon: Ico.stethoscope,
            active: app.tab == TabKey.responder,
          ),
          _Tab(
            tab: TabKey.settings,
            label: 'Settings',
            icon: Ico.settings,
            active: app.tab == TabKey.settings,
          ),
        ],
      ),
    );
  }
}

class _Tab extends StatelessWidget {
  const _Tab({
    required this.tab,
    required this.label,
    required this.icon,
    required this.active,
    this.primary = false,
  });

  final TabKey tab;
  final String label;
  final String icon;
  final bool active;

  /// The centre "Tag" action gets a filled teal treatment.
  final bool primary;

  @override
  Widget build(BuildContext context) {
    final AppState app = context.read<AppState>();
    final Color fg = primary
        ? C.accent
        : active
            ? C.textPrimary
            : C.textMuted;

    return Expanded(
      child: GestureDetector(
        onTap: () => app.setTab(tab),
        behavior: HitTestBehavior.opaque,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Container(
              width: primary ? 46 : 52,
              height: primary ? 34 : 30,
              margin: EdgeInsets.only(top: primary ? 0 : 0),
              decoration: BoxDecoration(
                color: primary
                    ? C.accent
                    : active
                        ? C.accentSoft
                        : Colors.transparent,
                borderRadius: BorderRadius.circular(primary ? 12 : 10),
                boxShadow: primary ? Shadows.accentGlow : null,
              ),
              child: Center(
                child: AppIcon(
                  icon,
                  size: primary ? 24 : 22,
                  color: primary
                      ? C.accentInk
                      : active
                          ? C.accent
                          : C.textMuted,
                ),
              ),
            ),
            const SizedBox(height: 3),
            Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontFamily: 'Manrope',
                fontSize: 10.5,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.2,
                color: fg,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
