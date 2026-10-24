// Gate 1 — Google sign-in, or an offline profile that skips it. Cloud
// features need the account; everything on-device works either way. The
// responder emergency path bypasses this gate entirely (life-safety, PRD §6.1).

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../state/app_state.dart';
import '../../theme/tokens.dart';
import '../../theme/type.dart';
import '../icons.dart';
import '../widgets/base.dart';

class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key});

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  bool _busy = false;

  /// Why the last Google attempt failed, shown inline next to the offline
  /// option so a broken sign-in is never a dead end.
  String? _error;

  Future<void> _go() async {
    final AppState app = context.read<AppState>();
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await app.signIn();
    } catch (e) {
      if (mounted) setState(() => _error = _friendly(e));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  String _friendly(Object e) {
    final String s = e.toString();
    if (s.contains('canceled') || s.contains('cancelled')) {
      return 'Sign-in cancelled';
    }
    if (s.contains('GOOGLE_SERVER_CLIENT_ID')) {
      return 'Google sign-in is not configured yet';
    }
    // Wrong SHA-1 / client ID in Google Cloud — the most common real failure.
    if (s.contains('clientConfigurationError') ||
        s.contains('providerConfigurationError') ||
        s.contains('DEVELOPER_ERROR')) {
      return "Google sign-in isn't set up for this build";
    }
    return 'Sign-in failed — check your connection';
  }

  @override
  Widget build(BuildContext context) {
    final AppState app = context.watch<AppState>();

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24, 20, 24, 26),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            const Spacer(),

            // ---- Logo + wordmark ----
            Center(
              child: Container(
                width: 76,
                height: 76,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(22),
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: <Color>[C.accent, C.info],
                  ),
                  boxShadow: const <BoxShadow>[
                    BoxShadow(
                      color: Color(0x73000000),
                      blurRadius: 30,
                      offset: Offset(0, 12),
                    ),
                  ],
                ),
                child: const Center(
                  child: AppIcon(Ico.heart, size: 34, color: Colors.white),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Patient-Tap',
              textAlign: TextAlign.center,
              style: T.display(size: 30).copyWith(letterSpacing: -0.5),
            ),
            const SizedBox(height: 8),
            Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 300),
                child: Text(
                  'Your encrypted medical identity — on your device, ready '
                  'for any responder.',
                  textAlign: TextAlign.center,
                  style: T.body.copyWith(color: C.textSecondary, height: 1.5),
                ),
              ),
            ),

            // ---- Value props ----
            const SizedBox(height: 28),
            const _Feature(
              icon: Ico.lock,
              text: 'End-to-end encrypted — we never see your data',
            ),
            const SizedBox(height: 12),
            const _Feature(
              icon: Ico.wifi,
              text: 'Cloud backup & sync across your devices',
            ),
            const SizedBox(height: 12),
            const _Feature(
              icon: Ico.alert,
              text: 'Emergency alerts to your contacts',
            ),

            const Spacer(),

            // ---- Google ----
            _GoogleButton(busy: _busy, onTap: _busy ? null : _go),

            if (_error != null) ...<Widget>[
              const SizedBox(height: 10),
              Text(
                '$_error. You can continue without an account and sign in '
                'later from Settings.',
                textAlign: TextAlign.center,
                style: T.captionMuted
                    .copyWith(fontSize: 12, height: 1.5, color: C.danger),
              ),
            ],

            // ---- No account ----
            const SizedBox(height: 10),
            Btn(
              label: 'Continue without an account',
              kind: BtnKind.secondary,
              icon: Ico.lock,
              onTap: _busy ? null : app.continueOffline,
            ),

            if (!app.isLive) ...<Widget>[
              const SizedBox(height: 10),
              Text(
                'Demo mode — no backend keys yet, so this signs you in '
                'locally. Add credentials at build time to go live.',
                textAlign: TextAlign.center,
                style: T.captionMuted.copyWith(fontSize: 12, height: 1.5),
              ),
            ],

            const SizedBox(height: 6),
            Btn(
              label: "I'm a responder — scan without signing in",
              kind: BtnKind.ghost,
              icon: Ico.stethoscope,
              color: C.info,
              onTap: app.enterResponderOnly,
            ),

            const SizedBox(height: 14),
            Text(
              'By continuing you agree this is a demo build and not a '
              'substitute for professional medical care.',
              textAlign: TextAlign.center,
              style: T.captionMuted.copyWith(fontSize: 11, height: 1.5),
            ),
          ],
        ),
      ),
    );
  }
}

class _Feature extends StatelessWidget {
  const _Feature({required this.icon, required this.text});
  final String icon;
  final String text;

  @override
  Widget build(BuildContext context) => Row(
        children: <Widget>[
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: C.surfaceAlt,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Center(child: AppIcon(icon, size: 16, color: C.accent)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: T.body.copyWith(fontSize: 14, color: C.textSecondary),
            ),
          ),
        ],
      );
}

/// The Google button keeps the four-colour mark, so it reads as the real thing.
class _GoogleButton extends StatelessWidget {
  const _GoogleButton({required this.busy, required this.onTap});
  final bool busy;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) => Opacity(
        opacity: onTap == null ? 0.6 : 1,
        child: Material(
          color: C.surface2,
          borderRadius: BorderRadius.circular(R.btn),
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(R.btn),
            child: Container(
              height: 52,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(R.btn),
                border: Border.all(color: C.borderStrong),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: <Widget>[
                  if (busy)
                    const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: C.textSecondary,
                      ),
                    )
                  else
                    const GoogleG(),
                  const SizedBox(width: 10),
                  Text(
                    busy ? 'Connecting…' : 'Continue with Google',
                    style: T.button(),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
}
