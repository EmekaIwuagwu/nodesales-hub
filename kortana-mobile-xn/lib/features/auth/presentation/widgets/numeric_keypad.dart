import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:kortana_wallet/core/theme/app_theme.dart';
import 'package:kortana_wallet/core/theme/text_styles.dart';

class NumericKeypad extends StatelessWidget {
  final Function(String) onKeyPress;
  final VoidCallback onBackspace;
  final VoidCallback? onBiometricTap;

  const NumericKeypad({
    super.key,
    required this.onKeyPress,
    required this.onBackspace,
    this.onBiometricTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 48),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildKey('1'),
              _buildKey('2'),
              _buildKey('3'),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildKey('4'),
              _buildKey('5'),
              _buildKey('6'),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildKey('7'),
              _buildKey('8'),
              _buildKey('9'),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              onBiometricTap != null
                  ? _buildBiometricKey()
                  : const SizedBox(width: 72, height: 72),
              _buildKey('0'),
              _buildBackspaceKey(),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildKey(String label) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          HapticFeedback.lightImpact();
          onKeyPress(label);
        },
        borderRadius: BorderRadius.circular(36),
        child: Container(
          width: 72,
          height: 72,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: Colors.white.withOpacity(0.06),
          ),
          child: Center(
            child: Text(
              label,
              style: KortanaTextStyles.displayLG.copyWith(color: Colors.white, fontSize: 32),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBiometricKey() {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onBiometricTap,
        borderRadius: BorderRadius.circular(36),
        child: Container(
          width: 72,
          height: 72,
          child: const Center(
            child: Icon(Icons.face_unlock_outlined, color: AppTheme.kortanaBlue, size: 32),
          ),
        ),
      ),
    );
  }

  Widget _buildBackspaceKey() {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onBackspace,
        borderRadius: BorderRadius.circular(36),
        child: Container(
          width: 72,
          height: 72,
          child: const Center(
            child: Icon(Icons.backspace_outlined, color: Colors.white, size: 28),
          ),
        ),
      ),
    );
  }
}
