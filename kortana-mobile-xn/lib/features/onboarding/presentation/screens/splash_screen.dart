import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lottie/lottie.dart';
import 'package:kortana_wallet/core/theme/app_theme.dart';
import 'package:kortana_wallet/core/theme/text_styles.dart';
import 'package:kortana_wallet/features/wallet/presentation/providers/wallet_provider.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> with TickerProviderStateMixin {
  late final AnimationController _textController;

  @override
  void initState() {
    super.initState();
    _textController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    _textController.forward();
    _bootSequence();
  }

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  Future<void> _bootSequence() async {
    // Wait for the Lottie animation and some extra time
    await Future.delayed(const Duration(milliseconds: 3200));

    // Check if the widget is still mounted
    if (!mounted) return;

    final hasWallet = await ref.read(walletProvider.notifier).checkExistingWallet();

    if (mounted) {
      if (hasWallet) {
        context.go('/lock');
      } else {
        context.go('/welcome');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.abyssBlack,
      body: Stack(
        children: [
          // Radial Gradient Background
          Container(
            decoration: const BoxDecoration(
              gradient: RadialGradient(
                colors: [Color(0xFF020D24), Color(0xFF010817)],
                center: Alignment.center,
                radius: 1.0,
              ),
            ),
          ),
          // Particle Field (Simplified for now - can use CustomPainter if needed)
          // Center Animation
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Image.asset(
                  'assets/images/logo.png',
                  width: 200,
                  height: 200,
                ),
                const SizedBox(height: 20),
                FadeTransition(
                  opacity: _textController,
                  child: Column(
                    children: [
                      Text(
                        'KORTANA WALLET',
                        style: KortanaTextStyles.displayLG.copyWith(
                          color: AppTheme.pureWhite,
                          letterSpacing: 8.0,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'The Future of Finance',
                        style: KortanaTextStyles.bodySM.copyWith(
                          color: AppTheme.neonAzure,
                          letterSpacing: 6.0,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
