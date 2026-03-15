import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:kortana_wallet/core/theme/app_theme.dart';
import 'package:kortana_wallet/core/theme/radius.dart';
import 'package:kortana_wallet/core/theme/spacing.dart';
import 'package:kortana_wallet/core/theme/text_styles.dart';
import 'package:kortana_wallet/core/widgets/glass_card.dart';
import 'package:kortana_wallet/core/widgets/kortana_button.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> with SingleTickerProviderStateMixin {
  late AnimationController _orbController;

  @override
  void initState() {
    super.initState();
    _orbController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..repeat();
  }

  @override
  void dispose() {
    _orbController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.abyssBlack,
      body: Stack(
        children: [
          // Background Gradient
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF010817), Color(0xFF050F2E)],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
          ),
          
          // Hero (top 55%): Luminous Orb
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            height: MediaQuery.of(context).size.height * 0.55,
            child: Column(
              children: [
                const Spacer(),
                AnimatedBuilder(
                  animation: _orbController,
                  builder: (context, child) => CustomPaint(
                    painter: _OrbPainter(_orbController.value),
                    size: Size(MediaQuery.of(context).size.width, MediaQuery.of(context).size.height * 0.4),
                  ),
                ),
                Image.asset(
                  'assets/images/logo.png',
                  width: 120,
                  height: 120,
                ),
                const Spacer(),
              ],
            ),
          ),
          
          // Content Card (Bottom)
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: GlassCard(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
              padding: const EdgeInsets.symmetric(horizontal: KortanaSpacing.xxxl, vertical: KortanaSpacing.xxxl),
              backgroundOpacity: 0.95,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                   Text(
                    'Your Keys.\nYour Coins.\nYour Future.',
                    textAlign: TextAlign.center,
                    style: KortanaTextStyles.displayLG.copyWith(
                      color: AppTheme.pureWhite,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: KortanaSpacing.lg),
                  Text(
                    'The most beautiful non-custodial wallet on the Kortana Network.',
                    textAlign: TextAlign.center,
                    style: KortanaTextStyles.bodyMD.copyWith(
                      color: const Color(0xFFCCE5FF).withOpacity(0.8),
                    ),
                  ),
                  const SizedBox(height: KortanaSpacing.xxxl),
                  KortanaButton(
                    label: 'Create New Wallet',
                    onTap: () => context.push('/create'),
                  ),
                  const SizedBox(height: KortanaSpacing.lg),
                  KortanaButton(
                    label: 'Import Existing Wallet',
                    variant: KortanaButtonVariant.secondary,
                    onTap: () => context.push('/import'),
                  ),
                  const SizedBox(height: KortanaSpacing.xxxl),
                  RichText(
                    textAlign: TextAlign.center,
                    text: TextSpan(
                      style: KortanaTextStyles.bodySM.copyWith(color: const Color(0xFF4A7DAA)),
                      children: const [
                        TextSpan(text: 'By continuing you agree to '),
                        TextSpan(
                          text: 'Terms of Service',
                          style: TextStyle(color: AppTheme.kortanaBlue),
                        ),
                        TextSpan(text: ' and '),
                        TextSpan(
                          text: 'Privacy Policy',
                          style: TextStyle(color: AppTheme.kortanaBlue),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: KortanaSpacing.xxxl),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _OrbPainter extends CustomPainter {
  final double animationValue;
  _OrbPainter(this.animationValue);

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final baseRadius = size.width * 0.35;

    // Draw background glow
    final glowPaint = Paint()
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 30.0)
      ..color = AppTheme.kortanaBlue.withOpacity(0.12);
    canvas.drawCircle(center, baseRadius * 1.5, glowPaint);

    // Draw concentric circles for depth
    for (int i = 0; i < 5; i++) {
       final pulse = (animationValue + (i * 0.2)) % 1.0;
       final radius = baseRadius * (0.8 + (i * 0.1) + pulse * 0.1);
       final opacity = (0.2 - (i * 0.04) + pulse * 0.05).clamp(0.0, 1.0);
       
       canvas.drawCircle(
         center,
         radius,
         Paint()
           ..style = PaintingStyle.stroke
           ..strokeWidth = 1.0
           ..color = AppTheme.kortanaBlue.withOpacity(opacity),
       );
    }

    // Inner core
    final coreGradient = RadialGradient(
      colors: [
        AppTheme.kortanaBlue,
        AppTheme.kortanaBlue.withOpacity(0.1),
      ],
    ).createShader(Rect.fromCircle(center: center, radius: baseRadius * 0.8));

    canvas.drawCircle(
      center,
      baseRadius * 0.8,
      Paint()..shader = coreGradient,
    );
  }

  @override
  bool shouldRepaint(covariant _OrbPainter oldDelegate) => true;
}
