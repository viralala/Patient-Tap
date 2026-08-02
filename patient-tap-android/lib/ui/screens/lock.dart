// ============================================================================
// F0 — local lock screen. "It's a lock screen, not a login system." (PRD §6.1)
//
// UPGRADE OVER THE WEB BUILD: the browser could only *simulate* biometrics.
// Here the fingerprint key runs a real BiometricPrompt via local_auth.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:local_auth/local_auth.dart';
import 'package:provider/provider.dart';

import '../../core/crypto_service.dart';
import '../../core/local_store.dart';
import '../../state/app_state.dart';
import '../../theme/tokens.dart';
import '../../theme/type.dart';
import '../icons.dart';
import '../widgets/base.dart';
import '../widgets/feedback.dart';

enum _Stage { enter, create, confirm }

class LockScreen extends StatefulWidget {
  const LockScreen({super.key, this.footer});

  /// Rendered under the keypad — used for the "I'm a responder" escape hatch.
  final Widget? footer;

  @override
  State<LockScreen> createState() => _LockScreenState();
}

class _LockScreenState extends State<LockScreen> {
  static const int _maxDots = 6;

  late _Stage _stage;
  late final bool _existing;
  String _pin = '';
  String _firstPin = '';
  bool _err = false;
  bool _biometricAvailable = false;

  final LocalAuthentication _auth = LocalAuthentication();

  @override
  void initState() {
    super.initState();
    _existing = LocalStore.hasPin();
    _stage = _existing ? _Stage.enter : _Stage.create;
    _checkBiometrics();
  }

  Future<void> _checkBiometrics() async {
    try {
      final bool supported =
          await _auth.isDeviceSupported() && await _auth.canCheckBiometrics;
      if (mounted) setState(() => _biometricAvailable = supported);
    } catch (_) {
      /* no biometric hardware — the keypad still works */
    }
  }

  String get _title => switch (_stage) {
        _Stage.enter => 'Enter your PIN',
        _Stage.create => 'Create a PIN',
        _Stage.confirm => 'Confirm your PIN',
      };

  String get _sub => switch (_stage) {
        _Stage.enter =>
          'Unlock Patient Mode to view or edit your medical profile.',
        _Stage.create =>
          '4–6 digits. This stays on your device — it only stops others '
              'editing your profile.',
        _Stage.confirm => 'Re-enter the same PIN.',
      };

  Future<void> _press(String d) async {
    if (_pin.length >= _maxDots) return;
    setState(() {
      _err = false;
      _pin += d;
    });

    if (_stage == _Stage.enter && _pin.length >= 4) {
      // Auto-confirm: silently try the hash from 4 digits on, so a 4-digit PIN
      // unlocks the moment it's complete — no submit button needed.
      final AuthRecord? rec = LocalStore.loadAuth();
      if (rec != null && CryptoService.hashPin(_pin, rec.salt) == rec.hash) {
        _unlock();
        return;
      }
      if (_pin.length == _maxDots) {
        setState(() {
          _err = true;
          _pin = '';
        });
      }
    } else if (_pin.length == _maxDots) {
      await _submit(_pin);
    }
  }

  void _unlock() => context.read<AppState>().setUnlocked(true);

  Future<void> _submit(String value) async {
    final AppState app = context.read<AppState>();

    if (value.length < 4) {
      setState(() {
        _err = true;
        _pin = '';
      });
      return;
    }

    switch (_stage) {
      case _Stage.create:
        setState(() {
          _firstPin = value;
          _pin = '';
          _stage = _Stage.confirm;
        });

      case _Stage.confirm:
        if (value != _firstPin) {
          setState(() {
            _err = true;
            _pin = '';
            _stage = _Stage.create;
          });
          app.showToast('PINs did not match', icon: Ico.x, iconColor: C.danger);
          return;
        }
        final String salt = CryptoService.newSalt();
        await LocalStore.saveAuth(
          AuthRecord(salt: salt, hash: CryptoService.hashPin(value, salt)),
        );
        if (mounted) _unlock();

      case _Stage.enter:
        final AuthRecord? rec = LocalStore.loadAuth();
        if (rec == null) {
          setState(() {
            _stage = _Stage.create;
            _pin = '';
          });
          return;
        }
        if (CryptoService.hashPin(value, rec.salt) == rec.hash) {
          _unlock();
        } else {
          setState(() {
            _err = true;
            _pin = '';
          });
        }
    }
  }

  void _del() => setState(() {
        _err = false;
        if (_pin.isNotEmpty) _pin = _pin.substring(0, _pin.length - 1);
      });

  Future<void> _biometric() async {
    final AppState app = context.read<AppState>();
    try {
      final bool ok = await _auth.authenticate(
        localizedReason: 'Unlock your Patient-Tap medical profile',
        // Allow the device PIN/pattern as a fallback so a failed fingerprint
        // read is never a dead end.
        biometricOnly: false,
        persistAcrossBackgrounding: true,
      );
      if (!mounted) return;
      if (ok) {
        app.showToast('Unlocked', icon: Ico.fingerprint, iconColor: C.accent);
        _unlock();
      }
    } catch (_) {
      if (mounted) {
        app.showToast('Biometric unlock unavailable', icon: Ico.info);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool showBiometric =
        _stage == _Stage.enter && _existing && _biometricAvailable;

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 18),
        child: Column(
          children: <Widget>[
            const SizedBox(height: 12),
            const GlyphTile(icon: Ico.shield),
            const SizedBox(height: 14),
            Text('Patient-Tap', style: T.headline),
            const SizedBox(height: 6),
            ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 260),
              child: Text(_title,
                  textAlign: TextAlign.center, style: T.caption()),
            ),
            const SizedBox(height: 4),
            ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 280),
              child: Text(_sub,
                  textAlign: TextAlign.center, style: T.captionMuted),
            ),

            // ---- PIN dots ----
            _PinDots(filled: _pin.length, total: _maxDots, error: _err),

            // ---- Keypad ----
            _Keypad(
              onDigit: _press,
              onDelete: _del,
              functionKey: showBiometric
                  ? _KeypadFn.biometric
                  : _KeypadFn.ok,
              onFunction: showBiometric ? _biometric : () => _submit(_pin),
            ),

            if ((_stage == _Stage.create || _stage == _Stage.confirm) &&
                _pin.length >= 4) ...<Widget>[
              const SizedBox(height: 18),
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 236),
                child: Btn(label: 'Continue', onTap: () => _submit(_pin)),
              ),
            ],

            if (widget.footer != null) ...<Widget>[
              const SizedBox(height: 18),
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 300),
                child: widget.footer!,
              ),
            ],
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }
}

class _PinDots extends StatelessWidget {
  const _PinDots({
    required this.filled,
    required this.total,
    required this.error,
  });

  final int filled;
  final int total;
  final bool error;

  @override
  Widget build(BuildContext context) => TweenAnimationBuilder<double>(
        // Shake on error (@keyframes shake).
        key: ValueKey<bool>(error),
        tween: Tween<double>(begin: 0, end: 1),
        duration: const Duration(milliseconds: 300),
        builder: (BuildContext context, double t, Widget? child) {
          final double dx =
              error ? 8 * (1 - t) * (t < 0.5 ? -1 : 1) * (t * 4 % 2) : 0;
          return Transform.translate(offset: Offset(dx, 0), child: child);
        },
        child: Padding(
          padding: const EdgeInsets.only(top: 16, bottom: 20),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List<Widget>.generate(total, (int i) {
              final bool on = i < filled;
              return Container(
                width: 12,
                height: 12,
                margin: const EdgeInsets.symmetric(horizontal: 7),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: on ? C.accent : Colors.transparent,
                  border: Border.all(
                    color: error
                        ? C.danger
                        : on
                            ? C.accent
                            : C.textMuted,
                    width: 2,
                  ),
                ),
              );
            }),
          ),
        ),
      );
}

enum _KeypadFn { ok, biometric }

class _Keypad extends StatelessWidget {
  const _Keypad({
    required this.onDigit,
    required this.onDelete,
    required this.functionKey,
    required this.onFunction,
  });

  final ValueChanged<String> onDigit;
  final VoidCallback onDelete;
  final _KeypadFn functionKey;
  final VoidCallback onFunction;

  @override
  Widget build(BuildContext context) => SizedBox(
        width: 240,
        child: GridView.count(
          crossAxisCount: 3,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 10,
          crossAxisSpacing: 10,
          childAspectRatio: 220 / 180, // 73x60 keys
          children: <Widget>[
            for (final String d in <String>['1', '2', '3', '4', '5', '6', '7', '8', '9'])
              _Key(label: d, onTap: () => onDigit(d)),
            _Key(
              onTap: onFunction,
              flat: true,
              label: functionKey == _KeypadFn.ok ? 'OK' : null,
              icon: functionKey == _KeypadFn.biometric ? Ico.fingerprint : null,
              iconSize: 26,
            ),
            _Key(label: '0', onTap: () => onDigit('0')),
            _Key(
              onTap: onDelete,
              flat: true,
              icon: Ico.chevronLeft,
              iconSize: 22,
            ),
          ],
        ),
      );
}

class _Key extends StatelessWidget {
  const _Key({
    this.label,
    this.icon,
    required this.onTap,
    this.flat = false,
    this.iconSize = 24,
  });

  final String? label;
  final String? icon;
  final VoidCallback onTap;
  final bool flat;
  final double iconSize;

  @override
  Widget build(BuildContext context) => Material(
        color: flat ? Colors.transparent : C.surfaceAlt,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: flat ? null : Border.all(color: C.border),
            ),
            child: Center(
              child: icon != null
                  ? AppIcon(icon!, size: iconSize, color: C.accent)
                  : Text(
                      label ?? '',
                      style: flat
                          ? T.button(color: C.accent, size: 14)
                          : T.keypad,
                    ),
            ),
          ),
        ),
      );
}
