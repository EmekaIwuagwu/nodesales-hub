import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:kortana_wallet/core/theme/app_theme.dart';
import 'package:kortana_wallet/core/theme/spacing.dart';
import 'package:kortana_wallet/core/theme/text_styles.dart';
import 'package:kortana_wallet/features/auth/presentation/widgets/pin_dot_row.dart';
import 'package:kortana_wallet/features/auth/presentation/widgets/numeric_keypad.dart';

class LockScreen extends StatefulWidget {
  const LockScreen({super.key});

  @override
  State<LockScreen> createState() => _LockScreenState();
}

class _LockScreenState extends State<LockScreen> {
  String _pin = '';

  void _onKeyPress(String value) {
    if (_pin.length < 6) {
      setState(() {
        _pin += value;
      });
      if (_pin.length == 6) {
        // Authenticate
        _authenticate();
      }
    }
  }

  void _onBackspace() {
    if (_pin.isNotEmpty) {
      setState(() {
        _pin = _pin.substring(0, _pin.length - 1);
      });
    }
  }

  void _authenticate() {
    // Check PIN logic
    // For now, auto-navigate to home
    Future.delayed(const Duration(milliseconds: 300), () {
      context.go('/home');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.abyssBlack,
      body: Stack(
        children: [
          // Background Glow
          Positioned(
            top: -100,
            left: MediaQuery.of(context).size.width * 0.2,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.kortanaBlue.withOpacity(0.08),
              ),
            ),
          ),
          
          SafeArea(
            child: Column(
              children: [
                const SizedBox(height: 64),
                // Logo
                Image.asset(
                  'assets/images/logo.png',
                  width: 100,
                  height: 100,
                ),
                const SizedBox(height: 24),
                Text(
                  'Welcome back',
                  style: KortanaTextStyles.displayLG.copyWith(color: AppTheme.pureWhite),
                ),
                const SizedBox(height: 8),
                Text(
                  '0x4f2a...9b3c',
                  style: KortanaTextStyles.monoSM.copyWith(color: const Color(0xFF4A7DAA)),
                ),
                
                const Spacer(),
                
                PinDotRow(filledCount: _pin.length),
                
                const Spacer(),
                
                NumericKeypad(
                  onKeyPress: _onKeyPress,
                  onBackspace: _onBackspace,
                  onBiometricTap: () {
                    // Biometric auth
                  },
                ),
                
                const SizedBox(height: 48),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
