import 'package:flutter/material.dart';

import '../../theme/app_colors.dart';
import '../../theme/app_theme.dart';
import '../../widgets/circle_icon_button.dart';
import 'role_choice_screen.dart';

/// Content for a single onboarding page.
class _Page {
  const _Page({
    required this.icon,
    required this.accent,
    required this.title,
    required this.subtitle,
  });
  final IconData icon;
  final Color accent;
  final String title; // 2 lines, bold
  final String subtitle; // muted supporting copy
}

/// 3-screen swipeable onboarding explaining Patient-Tap, ending in a role
/// choice. Full-bleed hero icon, bold 2-line headline, muted subtext, page
/// dots, and a single circular arrow button bottom-center.
class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _controller = PageController();
  int _index = 0;

  static const List<_Page> _pages = [
    _Page(
      icon: Icons.contactless_rounded,
      accent: AppColors.accent,
      title: 'Your Medical Record,\nOn You',
      subtitle:
          'Allergies, medications and DNR status live encrypted on an NFC '
          'wristband. Any phone can read it — no signal, no account, no cloud '
          'required.',
    ),
    _Page(
      icon: Icons.fact_check_rounded,
      accent: Color(0xFF7A5CF0),
      title: 'A Tamper-Evident\nChain of Custody',
      subtitle:
          'Every responder appends what they did and when. The treatment log '
          'travels with the patient, building a verifiable record from scene '
          'to hospital.',
    ),
    _Page(
      icon: Icons.sms_rounded,
      accent: Color(0xFF1FB57A),
      title: 'Reaches Out\nWhen It Can',
      subtitle:
          'The moment a signal appears, Patient-Tap opportunistically texts '
          'your emergency contacts your location — best-effort, never '
          'blocking care.',
    ),
  ];

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  bool get _isLast => _index == _pages.length - 1;

  void _next() {
    if (_isLast) {
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => const RoleChoiceScreen()),
      );
    } else {
      _controller.nextPage(
        duration: const Duration(milliseconds: 320),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Align(
              alignment: Alignment.centerRight,
              child: Padding(
                padding: const EdgeInsets.only(right: 12, top: 4),
                child: TextButton(
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute(
                        builder: (_) => const RoleChoiceScreen()),
                  ),
                  child: const Text(
                    'Skip',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _controller,
                itemCount: _pages.length,
                onPageChanged: (i) => setState(() => _index = i),
                itemBuilder: (_, i) => _OnboardingPage(page: _pages[i]),
              ),
            ),
            const SizedBox(height: AppTheme.s24),
            _Dots(count: _pages.length, index: _index),
            const SizedBox(height: AppTheme.s24),
            Padding(
              padding: const EdgeInsets.only(bottom: AppTheme.s32),
              child: CircleIconButton(
                icon: _isLast ? Icons.check_rounded : Icons.arrow_forward_rounded,
                background: _pages[_index].accent,
                onPressed: _next,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OnboardingPage extends StatelessWidget {
  const _OnboardingPage({required this.page});
  final _Page page;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppTheme.s32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Full-bleed centered hero.
          Center(
            child: Container(
              width: 220,
              height: 220,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: page.accent.withValues(alpha: 0.10),
              ),
              child: Center(
                child: Container(
                  width: 132,
                  height: 132,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: page.accent,
                    boxShadow: [
                      BoxShadow(
                        color: page.accent.withValues(alpha: 0.35),
                        blurRadius: 30,
                        offset: const Offset(0, 14),
                      ),
                    ],
                  ),
                  child: Icon(page.icon, size: 60, color: Colors.white),
                ),
              ),
            ),
          ),
          const SizedBox(height: 56),
          Text(
            page.title,
            style: Theme.of(context)
                .textTheme
                .headlineMedium
                ?.copyWith(fontSize: 32, height: 1.1),
          ),
          const SizedBox(height: AppTheme.s16),
          Text(
            page.subtitle,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                  height: 1.5,
                  fontSize: 15,
                ),
          ),
        ],
      ),
    );
  }
}

class _Dots extends StatelessWidget {
  const _Dots({required this.count, required this.index});
  final int count;
  final int index;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        for (int i = 0; i < count; i++)
          AnimatedContainer(
            duration: const Duration(milliseconds: 250),
            margin: const EdgeInsets.symmetric(horizontal: 4),
            width: i == index ? 24 : 8,
            height: 8,
            decoration: BoxDecoration(
              color: i == index ? AppColors.accent : AppColors.border,
              borderRadius: BorderRadius.circular(999),
            ),
          ),
      ],
    );
  }
}
