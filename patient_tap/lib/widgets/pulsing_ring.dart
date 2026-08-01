import 'package:flutter/material.dart';

/// A filled circle with concentric rings that pulse outward while [animate] is
/// true. Used for the NFC write/scan "hold steady" visuals.
class PulsingRing extends StatefulWidget {
  const PulsingRing({
    super.key,
    required this.color,
    required this.child,
    this.animate = true,
  });

  final Color color;
  final Widget child;
  final bool animate;

  @override
  State<PulsingRing> createState() => _PulsingRingState();
}

class _PulsingRingState extends State<PulsingRing>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1800),
  );

  @override
  void initState() {
    super.initState();
    if (widget.animate) _controller.repeat();
  }

  @override
  void didUpdateWidget(covariant PulsingRing oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.animate && !_controller.isAnimating) {
      _controller.repeat();
    } else if (!widget.animate && _controller.isAnimating) {
      _controller.stop();
      _controller.value = 0;
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        return Stack(
          alignment: Alignment.center,
          children: [
            if (widget.animate) ...[
              _ripple(0.0),
              _ripple(0.5),
            ],
            // Solid core.
            Container(
              width: 132,
              height: 132,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: widget.color,
                boxShadow: [
                  BoxShadow(
                    color: widget.color.withValues(alpha: 0.4),
                    blurRadius: 30,
                    offset: const Offset(0, 12),
                  ),
                ],
              ),
              child: Center(child: widget.child),
            ),
          ],
        );
      },
    );
  }

  Widget _ripple(double phase) {
    final t = (_controller.value + phase) % 1.0;
    final size = 132 + t * 108; // grow outward
    final opacity = (1.0 - t) * 0.35;
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: widget.color.withValues(alpha: opacity),
      ),
    );
  }
}
