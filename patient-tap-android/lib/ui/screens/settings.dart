// Settings — account, Razorpay subscription, cloud & sync, secure share,
// security, tag diagnostics and demo controls.

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';

import '../../backend/backend_service.dart';
import '../../backend/razorpay_service.dart';
import '../../config/app_config.dart';
import '../../core/local_store.dart';
import '../../core/nfc_service.dart';
import '../../models/patient_profile.dart';
import '../../state/app_state.dart';
import '../../theme/tokens.dart';
import '../../theme/type.dart';
import '../icons.dart';
import '../widgets/base.dart' as w;
import '../widgets/feedback.dart' as f;

String _inr(int n) =>
    NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0)
        .format(n);

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  BillingCycle _cycle = BillingCycle.monthly;
  String? _busy;
  ShareLink? _share;
  ({int maxSize, bool writable, int used, String type})? _tagInfo;
  bool _nfcEnabled = false;

  @override
  void initState() {
    super.initState();
    _checkNfc();
  }

  Future<void> _checkNfc() async {
    final bool on = await NfcService.isEnabled();
    if (mounted) setState(() => _nfcEnabled = on);
  }

  /// Offline profiles have no account to bill or back up to. Returns true
  /// (and says why) when the action has to wait for a Google sign-in.
  bool _needsAccount() {
    final AppState app = context.read<AppState>();
    if (app.hasAccount) return false;
    app.showToast('Sign in with Google to use this', icon: Ico.lock);
    return true;
  }

  Future<void> _signInFromOffline() async {
    final AppState app = context.read<AppState>();
    setState(() => _busy = 'signin');
    try {
      await app.signIn();
      if (mounted && app.hasAccount) {
        app.showToast('Signed in', icon: Ico.check, iconColor: C.accent);
      }
    } catch (_) {
      app.showToast('Google sign-in failed — your offline profile is unchanged',
          icon: Ico.x, iconColor: C.danger);
    } finally {
      if (mounted) setState(() => _busy = null);
    }
  }

  // ---- Billing -------------------------------------------------------------
  Future<void> _upgrade(Tier target) async {
    if (_needsAccount()) return;
    final AppState app = context.read<AppState>();
    final AppSession? session = app.session;
    if (session == null) return;

    setState(() => _busy = target.key);
    final CheckoutResult res = await BackendService.upgrade(
      tier: target,
      cycle: _cycle,
      session: session,
    );
    if (!mounted) return;
    setState(() => _busy = null);

    await app.refreshSubscription();
    if (!mounted) return;
    app.showToast(
      res.message ?? (res.ok ? 'Upgraded' : 'Checkout failed'),
      icon: res.ok ? Ico.checkCircle : Ico.x,
      iconColor: res.ok ? C.accent : C.danger,
    );
  }

  Future<void> _manage() async {
    if (_needsAccount()) return;
    final AppState app = context.read<AppState>();
    final bool? confirmed = await _confirm(
      title: 'Cancel subscription?',
      body: 'You keep Premium features until the end of the current billing '
          'period, then drop back to Freemium.',
      confirmLabel: 'Cancel subscription',
      danger: true,
    );
    if (confirmed != true) return;

    setState(() => _busy = 'portal');
    final CheckoutResult res = await BackendService.cancelSubscription();
    if (!mounted) return;
    setState(() => _busy = null);
    await app.refreshSubscription();
    if (!mounted) return;
    app.showToast(res.message ?? 'Updated', icon: Ico.check);
  }

  // ---- Cloud ---------------------------------------------------------------
  Future<void> _backupNow() async {
    if (_needsAccount()) return;
    final AppState app = context.read<AppState>();
    setState(() => _busy = 'backup');
    final bool ok = await app.backupNow();
    if (!mounted) return;
    setState(() => _busy = null);
    app.showToast(
      ok ? 'Backed up (encrypted)' : 'Backup failed',
      icon: ok ? Ico.check : Ico.x,
      iconColor: ok ? C.accent : C.danger,
    );
  }

  Future<void> _restore() async {
    if (_needsAccount()) return;
    final AppState app = context.read<AppState>();
    final bool? confirmed = await _confirm(
      title: 'Restore cloud backup?',
      body: 'This replaces your current on-device profile with the encrypted '
          'copy from the cloud.',
      confirmLabel: 'Restore',
    );
    if (confirmed != true) return;

    setState(() => _busy = 'restore');
    final bool ok = await app.restoreFromCloud();
    if (!mounted) return;
    setState(() => _busy = null);
    app.showToast(
      ok ? 'Profile restored' : 'No backup found',
      icon: ok ? Ico.check : Ico.info,
      iconColor: ok ? C.accent : null,
    );
  }

  Future<void> _testAlert() async {
    if (_needsAccount()) return;
    final AppState app = context.read<AppState>();
    setState(() => _busy = 'alert');
    final AlertOutcome res = await BackendService.notifyEmergencyContacts(
      patientPublicId: app.profile.patientId,
      patientName: app.profile.name.isEmpty ? null : app.profile.name,
      message: 'Test emergency alert for '
          '${app.profile.name.isEmpty ? 'a Patient-Tap user' : app.profile.name}.',
    );
    if (!mounted) return;
    setState(() => _busy = null);
    app.showToast(
      res.message ?? (res.ok ? 'Alert sent' : 'Alert failed'),
      icon: Ico.alert,
      iconColor: res.ok ? C.caution : C.danger,
    );
  }

  // ---- Share ---------------------------------------------------------------
  Future<void> _makeShare() async {
    if (_needsAccount()) return;
    final AppState app = context.read<AppState>();
    setState(() => _busy = 'share');
    final Map<String, dynamic> card =
        projectForWrite(app.profile, WriteSelection.forShare())
          ..['ts'] = DateTime.now().millisecondsSinceEpoch;
    final ShareLink? link = await BackendService.createShareLink(card);
    if (!mounted) return;
    setState(() {
      _busy = null;
      _share = link;
    });
    if (link == null) {
      app.showToast('Could not create link', icon: Ico.x, iconColor: C.danger);
    }
  }

  // ---- Demo controls -------------------------------------------------------
  Future<void> _loadDemo() async {
    final AppState app = context.read<AppState>();
    await app.setProfile(demoProfile());
    if (!mounted) return;
    app.showToast('Demo profile loaded', icon: Ico.check, iconColor: C.accent);
  }

  Future<void> _clearProfile() async {
    final AppState app = context.read<AppState>();
    final bool? ok = await _confirm(
      title: 'Clear your local profile?',
      body: "This can't be undone. Your cloud backup, if any, is untouched.",
      confirmLabel: 'Clear profile',
      danger: true,
    );
    if (ok != true) return;
    await app.setProfile(emptyProfile());
    if (!mounted) return;
    app.showToast('Profile cleared', icon: Ico.check);
  }

  Future<void> _wipeTag() async {
    final AppState app = context.read<AppState>();
    final bool? ok = await _confirm(
      title: 'Erase the NFC card?',
      body: 'Hold the card against your phone after confirming. This clears '
          'the medical payload from the card itself.',
      confirmLabel: 'Erase card',
      danger: true,
    );
    if (ok != true) return;
    try {
      await NfcService.wipeTag();
      if (!mounted) return;
      app.showToast('Card erased', icon: Ico.check, iconColor: C.accent);
    } on TagError catch (e) {
      if (!mounted) return;
      app.showToast(e.message, icon: Ico.x, iconColor: C.danger);
    }
    setState(() {});
  }

  Future<void> _inspectTag() async {
    final AppState app = context.read<AppState>();
    try {
      final ({int maxSize, bool writable, int used, String type}) info =
          await NfcService.inspectTag();
      if (!mounted) return;
      setState(() => _tagInfo = info);
      app.showToast('Card read', icon: Ico.checkCircle, iconColor: C.accent);
    } on TagError catch (e) {
      if (!mounted) return;
      app.showToast(e.message, icon: Ico.x, iconColor: C.danger);
    }
  }

  Future<bool?> _confirm({
    required String title,
    required String body,
    required String confirmLabel,
    bool danger = false,
  }) =>
      f.showAppSheet<bool>(
        context: context,
        title: title,
        builder: (BuildContext ctx) => Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Text(body, style: T.caption()),
            ),
            w.Btn(
              label: confirmLabel,
              kind: danger ? w.BtnKind.danger : w.BtnKind.primary,
              onTap: () => Navigator.of(ctx).pop(true),
            ),
            const SizedBox(height: 8),
            w.Btn(
              label: 'Cancel',
              kind: w.BtnKind.ghost,
              onTap: () => Navigator.of(ctx).pop(false),
            ),
          ],
        ),
      );

  // ==========================================================================
  @override
  Widget build(BuildContext context) {
    final AppState app = context.watch<AppState>();
    final Tier tier = app.tier;
    final AppUser? user = app.session?.user;
    final bool offline = app.session?.isLocal ?? false;
    final String accountSub = offline
        ? 'Stored only on this phone · no account'
        : '${user?.email ?? ''}${app.isLive ? '' : ' · demo session'}';

    return w.Screen(
      children: <Widget>[
        Padding(
          padding: const EdgeInsets.fromLTRB(2, 10, 2, 0),
          child: Text('Settings', style: T.largeTitle),
        ),

        // ---------------- Account ----------------
        const w.SectionTitle('Account', top: 16),
        w.Card(
          padding: const EdgeInsets.fromLTRB(14, 4, 14, 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              w.RowTile(
                title: user?.name ?? 'Signed in',
                subtitle: accountSub,
                divider: false,
                trailing: null,
                icon: null,
                subtitleWidget: Text(accountSub, style: T.rowSub),
              ),
              const SizedBox(height: 6),
              if (offline) ...<Widget>[
                w.Btn(
                  label: 'Sign in with Google for backup & alerts',
                  icon: Ico.wifi,
                  small: true,
                  busy: _busy == 'signin',
                  onTap: _signInFromOffline,
                ),
                const SizedBox(height: 8),
              ],
              w.Btn(
                label: offline ? 'Leave offline mode' : 'Sign out',
                kind: w.BtnKind.secondary,
                icon: Ico.lock,
                small: true,
                onTap: app.signOutApp,
              ),
            ],
          ),
        ),

        // ---------------- Subscription ----------------
        w.SectionTitle(
          'Subscription',
          trailing: w.Badge(kTiers[tier]!.displayName, tint: Tint.accent),
        ),
        w.Card(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              Text('${kTiers[tier]!.displayName} plan',
                  style: T.headline),
              const SizedBox(height: 2),
              Text(
                tier == Tier.free
                    ? 'Upgrade for cloud backup, alerts & sharing'
                    : <String>[
                        app.subscription.status ?? 'active',
                        if (app.subscription.currentPeriodEnd != null)
                          'renews ${DateFormat.yMMMd().format(app.subscription.currentPeriodEnd!)}',
                      ].join(' · '),
                style: T.rowSub,
              ),
              const SizedBox(height: 12),

              // Billing cycle
              f.Segmented<BillingCycle>(
                value: _cycle,
                onChanged: (BillingCycle c) => setState(() => _cycle = c),
                options: const <f.SegmentOption<BillingCycle>>[
                  f.SegmentOption<BillingCycle>(
                      BillingCycle.monthly, 'Monthly'),
                  f.SegmentOption<BillingCycle>(
                      BillingCycle.yearly, 'Yearly · save 10%'),
                ],
              ),
              const SizedBox(height: 14),

              // Plan options
              for (final Tier t in kTierOrder) ...<Widget>[
                _PlanCard(
                  meta: kTiers[t]!,
                  cycle: _cycle,
                  isCurrent: t == tier,
                  isUpgrade: tierRank(t) > tierRank(tier),
                  busy: _busy == t.key,
                  onUpgrade: () => _upgrade(t),
                  onManage: _manage,
                ),
                const SizedBox(height: 10),
              ],

              if (!AppConfig.hasRazorpay)
                Text(
                  'Demo mode — upgrades are simulated locally. Add your '
                  'Razorpay key at build time to take real payments.',
                  style: T.captionMuted,
                ),
            ],
          ),
        ),

        // ---------------- Cloud & sync ----------------
        const w.SectionTitle('Cloud & sync'),
        w.Card(
          padding: const EdgeInsets.fromLTRB(14, 4, 14, 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              w.RowTile(
                icon: Ico.wifi,
                tint: Tint.info,
                title: 'Cloud backup',
                subtitle:
                    'End-to-end encrypted — the server stores ciphertext only',
                trailing: f.AppSwitch(
                  value: app.cloudBackup,
                  onChanged: (bool v) {
                    if (!_needsAccount()) app.setCloudBackup(v);
                  },
                ),
              ),
              w.RowTile(
                icon: Ico.alert,
                tint: Tint.caution,
                title: 'Emergency alerts',
                subtitle: 'Notify your contacts when your tag is scanned',
                divider: false,
                trailing: f.AppSwitch(
                  value: app.alertsEnabled,
                  onChanged: (bool v) {
                    if (!_needsAccount()) app.setAlertsEnabled(v);
                  },
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: <Widget>[
                  Expanded(
                    child: w.Btn(
                      label: 'Back up now',
                      kind: w.BtnKind.secondary,
                      small: true,
                      busy: _busy == 'backup',
                      onTap: app.cloudBackup ? _backupNow : null,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: w.Btn(
                      label: 'Restore',
                      kind: w.BtnKind.secondary,
                      small: true,
                      busy: _busy == 'restore',
                      onTap: _restore,
                    ),
                  ),
                ],
              ),
              if (app.alertsEnabled) ...<Widget>[
                const SizedBox(height: 8),
                w.Btn(
                  label: 'Send a test alert',
                  kind: w.BtnKind.ghost,
                  icon: Ico.alert,
                  small: true,
                  busy: _busy == 'alert',
                  onTap: _testAlert,
                ),
              ],
            ],
          ),
        ),

        // ---------------- Secure share ----------------
        const w.SectionTitle('Secure share'),
        w.Card(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              Text(
                'Create a revocable, time-limited link to your emergency card '
                "for when there's no NFC reader. The decryption key stays in "
                'the link and never reaches our servers.',
                style: T.rowSub,
              ),
              const SizedBox(height: 12),
              w.Btn(
                label: 'Create emergency link',
                kind: w.BtnKind.secondary,
                icon: Ico.share,
                small: true,
                busy: _busy == 'share',
                onTap: _makeShare,
              ),
              if (_share != null) ...<Widget>[
                const SizedBox(height: 12),
                w.CardAlt(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: <Widget>[
                      SelectableText(
                        _share!.url,
                        style: T.mono(size: 12, color: C.textSecondary),
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: <Widget>[
                          Expanded(
                            child: w.Btn(
                              label: 'Share',
                              icon: Ico.share,
                              small: true,
                              onTap: () => SharePlus.instance.share(
                                ShareParams(
                                  text: _share!.url,
                                  subject: 'My Patient-Tap emergency card',
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: w.Btn(
                              label: 'Revoke',
                              kind: w.BtnKind.secondary,
                              small: true,
                              onTap: () async {
                                await BackendService.revokeShareLink(
                                    _share!.token);
                                if (!mounted) return;
                                setState(() => _share = null);
                                app.showToast('Link revoked', icon: Ico.check);
                              },
                            ),
                          ),
                        ],
                      ),
                      if (_share!.expiresAt != null) ...<Widget>[
                        const SizedBox(height: 8),
                        Text(
                          'Expires ${DateFormat.yMMMd().add_jm().format(_share!.expiresAt!)}',
                          style: T.rowSub,
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),

        // ---------------- Security ----------------
        const w.SectionTitle('Security'),
        w.Card(
          child: w.Rows(
            children: const <Widget>[
              w.RowTile(
                icon: Ico.lock,
                title: 'App lock (PIN)',
                subtitle: 'Enabled · SHA-256 hashed, never stored in plaintext',
              ),
              w.RowTile(
                icon: Ico.fingerprint,
                title: 'Biometric unlock',
                subtitle: 'Real fingerprint / face unlock via BiometricPrompt',
              ),
              w.RowTile(
                icon: Ico.key,
                title: 'Encryption',
                subtitle: 'AES-256-GCM · tamper detection via auth tag',
                divider: false,
              ),
            ],
          ),
        ),

        // ---------------- Tag & platform ----------------
        const w.SectionTitle('Tag & platform'),
        w.Card(
          padding: const EdgeInsets.fromLTRB(14, 4, 14, 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              const w.RowTile(
                icon: Ico.nfc,
                title: 'Platform',
                subtitle: '$kPlatformLabel · read + write (NTAG215)',
              ),
              w.RowTile(
                icon: Ico.wifi,
                tint: _nfcEnabled ? Tint.accent : Tint.caution,
                title: 'NFC radio',
                subtitle: _nfcEnabled
                    ? 'Enabled — real taps supported'
                    : 'Off or unsupported — enable NFC in system settings',
              ),
              w.RowTile(
                icon: Ico.shield,
                tint: LocalStore.tagIsSetUp() ? Tint.accent : Tint.caution,
                title: 'Last written payload',
                subtitle: LocalStore.tagIsSetUp()
                    ? 'This device has written a card'
                    : 'None yet — write a profile from the Tag screen',
                divider: _tagInfo == null,
              ),
              if (_tagInfo != null)
                w.RowTile(
                  icon: Ico.info,
                  tint: Tint.info,
                  title: 'Card capacity',
                  subtitle: '${_tagInfo!.type} · ${_tagInfo!.used}/'
                      '${_tagInfo!.maxSize} bytes used · '
                      '${_tagInfo!.writable ? 'writable' : 'locked'}',
                  divider: false,
                ),
              const SizedBox(height: 12),
              w.Btn(
                label: 'Read card details',
                kind: w.BtnKind.secondary,
                icon: Ico.scan,
                small: true,
                onTap: _inspectTag,
              ),
            ],
          ),
        ),

        // ---------------- Demo controls ----------------
        const w.SectionTitle('Data & demo controls'),
        w.Btn(
          label: 'Load demo profile',
          kind: w.BtnKind.secondary,
          icon: Ico.sparkle,
          onTap: _loadDemo,
        ),
        const SizedBox(height: 10),
        w.Btn(
          label: 'Erase NFC card',
          kind: w.BtnKind.secondary,
          icon: Ico.nfc,
          onTap: _wipeTag,
        ),
        const SizedBox(height: 10),
        w.Btn(
          label: 'Clear profile',
          kind: w.BtnKind.ghost,
          color: C.danger,
          onTap: _clearProfile,
        ),
        const SizedBox(height: 10),
        w.Btn(
          label: 'Lock app',
          kind: w.BtnKind.ghost,
          icon: Ico.lock,
          onTap: () => app.setUnlocked(false),
        ),

        const SizedBox(height: 16),
        f.Banner(
          kind: f.BannerKind.blue,
          title: 'About this build',
          body: 'Patient-Tap $kPlatformLabel — Flutter build of PRD v2.0. '
              '${app.isLive ? 'Connected to the live backend.' : 'Running in demo mode — add backend keys to go live.'} '
              'Encryption, NFC read/write, backup, billing, sharing and alerts '
              'are wired end-to-end.',
          icon: Ico.info,
        ),
        Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Text(
            'Version 2.0.0 · ${app.profile.patientId}',
            textAlign: TextAlign.center,
            style: T.captionMuted,
          ),
        ),
      ],
    );
  }
}

class _PlanCard extends StatelessWidget {
  const _PlanCard({
    required this.meta,
    required this.cycle,
    required this.isCurrent,
    required this.isUpgrade,
    required this.busy,
    required this.onUpgrade,
    required this.onManage,
  });

  final TierMeta meta;
  final BillingCycle cycle;
  final bool isCurrent;
  final bool isUpgrade;
  final bool busy;
  final VoidCallback onUpgrade;
  final VoidCallback onManage;

  @override
  Widget build(BuildContext context) {
    final int price = meta.priceFor(cycle);

    return w.CardAlt(
      borderColor: isCurrent ? C.accent : C.border,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    Text(meta.displayName, style: T.rowTitle),
                    const SizedBox(height: 1),
                    Text(meta.blurb, style: T.rowSub),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  Text(
                    meta.tier == Tier.free ? 'Free' : _inr(price),
                    style: T.rowValue.copyWith(fontSize: 16),
                  ),
                  if (meta.tier != Tier.free)
                    Text(
                      '/${cycle == BillingCycle.monthly ? 'mo' : 'yr'}',
                      style: T.rowSub,
                    ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 10),
          if (isCurrent)
            w.Btn(
              label: 'Current plan',
              kind: w.BtnKind.secondary,
              icon: Ico.check,
              small: true,
              onTap: null,
            )
          else if (isUpgrade)
            w.Btn(
              label: 'Upgrade to ${meta.displayName}',
              small: true,
              busy: busy,
              onTap: onUpgrade,
            )
          else
            w.Btn(
              label: 'Switch / manage',
              kind: w.BtnKind.secondary,
              small: true,
              onTap: onManage,
            ),
        ],
      ),
    );
  }
}
