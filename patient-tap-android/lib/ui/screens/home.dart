// Home — the patient's medical ID card, critical strip, stats and quick actions.

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../config/app_config.dart';
import '../../core/local_store.dart';
import '../../models/patient_profile.dart';
import '../../state/app_state.dart';
import '../../theme/tokens.dart';
import '../../theme/type.dart';
import '../icons.dart';
import '../widgets/base.dart' as w;
import '../widgets/feedback.dart' as f;

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _range = 'week';

  /// One accent family — depth via shade, not a rainbow.
  static const List<Color> _palette = <Color>[
    Color(0xFF3EC9A7),
    Color(0xFF2B9B81),
    Color(0xFF7ADDC4),
    Color(0xFF1F7361),
    Color(0xFFA9E9D8),
  ];

  @override
  Widget build(BuildContext context) {
    final AppState app = context.watch<AppState>();
    final PatientProfile p = app.profile;
    final bool synced = LocalStore.tagIsSetUp();

    final List<f.RingSegment> segments = p.medications.isEmpty
        ? <f.RingSegment>[const f.RingSegment(1, C.surface2)]
        : List<f.RingSegment>.generate(
            p.medications.length,
            (int i) => f.RingSegment(1, _palette[i % _palette.length]),
          );

    return w.Screen(
      children: <Widget>[
        // ---- Top bar: identity + reminders ----
        Padding(
          padding: const EdgeInsets.fromLTRB(0, 10, 0, 16),
          child: Row(
            children: <Widget>[
              w.Avatar(
                initials: app.initials,
                photoUrl: app.session?.user.avatarUrl,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    Text('Patient-Tap', style: T.brandName),
                    const SizedBox(height: 1),
                    Text(
                      kCanWriteTag ? 'NTAG215 · READ/WRITE' : 'NDEF · READ ONLY',
                      style: T.brandSub,
                    ),
                  ],
                ),
              ),
              w.IconBtn(
                icon: Ico.bell,
                dot: p.medications.any((MedEntry m) => m.reminderEnabled),
                onTap: () => app.setTab(TabKey.reminders),
              ),
            ],
          ),
        ),

        // ---- Hero: medical ID card ----
        _HeroCard(profile: p, synced: synced),

        // ---- Critical strip ----
        if (p.allergies.isNotEmpty) ...<Widget>[
          const SizedBox(height: 10),
          f.Banner(
            kind: f.BannerKind.danger,
            title: 'Allergies',
            body: p.allergies.join(' · '),
            icon: Ico.drop,
            margin: EdgeInsets.zero,
          ),
        ],

        // ---- Two-up stat tiles ----
        const SizedBox(height: 10),
        Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            Expanded(
              child: _StatTile(
                icon: Ico.pill,
                tint: Tint.accent,
                value: '${p.medications.length}',
                label: 'Medications',
                onTap: () => app.setTab(TabKey.reminders),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _StatTile(
                icon: Ico.contact,
                tint: Tint.info,
                value: '${p.emergencyContacts.length}',
                label: 'Emergency contacts',
                onTap: () => app.setRoute(AppRoute.profileEdit),
              ),
            ),
          ],
        ),

        // ---- Adherence ----
        const SizedBox(height: 10),
        w.Card(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              Text('Medication adherence', style: T.headline),
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.only(top: 6, bottom: 14),
                child: Center(
                  child: f.Ring(
                    segments: segments,
                    centerLabel: 'this $_range',
                    centerValue: p.medications.isEmpty ? '—' : '87%',
                  ),
                ),
              ),
              f.Segmented<String>(
                value: _range,
                onChanged: (String v) => setState(() => _range = v),
                options: const <f.SegmentOption<String>>[
                  f.SegmentOption<String>('today', 'Today'),
                  f.SegmentOption<String>('week', 'Week'),
                  f.SegmentOption<String>('month', 'Month'),
                ],
              ),
            ],
          ),
        ),

        // ---- Quick actions ----
        const w.SectionTitle('Quick actions'),
        _QuickRow(
          icon: Ico.doc,
          tint: Tint.caution,
          title: 'Scan a document',
          sub: 'Auto-fill from a prescription or report',
          onTap: () => app.setRoute(AppRoute.scanDoc),
        ),
        const SizedBox(height: 10),
        _QuickRow(
          icon: Ico.edit,
          tint: Tint.accent,
          title: 'Edit profile',
          sub: 'Name, blood type, allergies, medications',
          onTap: () => app.setRoute(AppRoute.profileEdit),
        ),
        const SizedBox(height: 10),
        _QuickRow(
          icon: Ico.nfc,
          tint: Tint.accent,
          title: 'Write to tag',
          sub: 'Choose what to store on the wristband',
          onTap: () => app.setRoute(AppRoute.writeTag),
        ),
        const SizedBox(height: 10),
        _QuickRow(
          icon: Ico.stethoscope,
          tint: Tint.info,
          title: 'Responder mode',
          sub: 'Scan a patient tag — no login needed',
          onTap: () => app.setTab(TabKey.responder),
        ),
      ],
    );
  }
}

/// The medical ID card — layered gradient, hairline sheen, NFC watermark.
class _HeroCard extends StatelessWidget {
  const _HeroCard({required this.profile, required this.synced});
  final PatientProfile profile;
  final bool synced;

  @override
  Widget build(BuildContext context) => ClipRRect(
        borderRadius: R.cardR,
        child: Container(
          decoration: heroDecoration(),
          child: Stack(
            children: <Widget>[
              // Teal wash from the top-right corner.
              Positioned.fill(
                child: DecoratedBox(
                  decoration: const BoxDecoration(
                    gradient: RadialGradient(
                      center: Alignment(0.76, -1.24),
                      radius: 1.3,
                      colors: <Color>[Color(0x293EC9A7), Color(0x003EC9A7)],
                      stops: <double>[0, 0.52],
                    ),
                  ),
                ),
              ),
              // The 1px vertical hairline sheen.
              const Positioned.fill(child: _Sheen()),
              // Oversized NFC watermark, bleeding off the corner.
              Positioned(
                right: -8,
                bottom: -14,
                child: Opacity(
                  opacity: 0.07,
                  child: const AppIcon(Ico.nfc, size: 130),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: <Widget>[
                        const w.Eyebrow('Medical ID'),
                        w.Badge(
                          synced ? 'tag synced' : 'not written',
                          icon: Ico.nfc,
                          tint: synced ? Tint.accent : Tint.caution,
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      profile.name.isEmpty
                          ? 'Set up your profile'
                          : profile.name,
                      style: T.display(),
                    ),
                    const SizedBox(height: 16),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: <Widget>[
                        w.Badge(
                          profile.bloodType.isEmpty
                              ? 'blood —'
                              : profile.bloodType,
                          icon: Ico.drop,
                          tint: Tint.danger,
                        ),
                        if (profile.dnrFlag)
                          const w.Badge('DNR', tint: Tint.danger),
                        w.Badge(profile.patientId),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
}

class _Sheen extends StatelessWidget {
  const _Sheen();

  @override
  Widget build(BuildContext context) => IgnorePointer(
        child: CustomPaint(painter: _SheenPainter()),
      );
}

class _SheenPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    // repeating-linear-gradient(90deg, rgba(255,255,255,.014) 0 1px, transparent 1px 7px)
    final Paint p = Paint()..color = const Color(0x04FFFFFF);
    for (double x = 0; x < size.width; x += 7) {
      canvas.drawRect(Rect.fromLTWH(x, 0, 1, size.height), p);
    }
  }

  @override
  bool shouldRepaint(covariant _SheenPainter oldDelegate) => false;
}

class _StatTile extends StatelessWidget {
  const _StatTile({
    required this.icon,
    required this.tint,
    required this.value,
    required this.label,
    required this.onTap,
  });

  final String icon;
  final Tint tint;
  final String value;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => w.CardAlt(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: <Widget>[
                w.IconTile(icon, tint: tint, size: 34, iconSize: 18),
                Text(value, style: T.mono(size: 22, weight: 600)),
              ],
            ),
            const SizedBox(height: 10),
            Text(label, style: T.caption()),
          ],
        ),
      );
}

class _QuickRow extends StatelessWidget {
  const _QuickRow({
    required this.icon,
    required this.tint,
    required this.title,
    required this.sub,
    required this.onTap,
  });

  final String icon;
  final Tint tint;
  final String title;
  final String sub;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => w.CardAlt(
        onTap: onTap,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        child: w.RowTile(
          icon: icon,
          tint: tint,
          title: title,
          subtitle: sub,
          divider: false,
          padding: EdgeInsets.zero,
          trailing: const AppIcon(
            Ico.chevronRight,
            size: 20,
            color: C.textMuted,
          ),
        ),
      );
}
