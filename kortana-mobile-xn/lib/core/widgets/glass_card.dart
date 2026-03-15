import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:kortana_wallet/core/theme/app_theme.dart';
import 'package:kortana_wallet/core/theme/radius.dart';
import 'package:kortana_wallet/core/theme/spacing.dart';

class GlassCard extends StatelessWidget {
  const GlassCard({
    super.key,
    required this.child,
    this.padding,
    this.borderRadius,
    this.blurSigma = 20.0,
    this.backgroundOpacity = 0.72,
    this.borderOpacity = 0.18,
    this.glowColor,
  });

  final Widget child;
  final EdgeInsetsGeometry? padding;
  final BorderRadius? borderRadius;
  final double blurSigma;
  final double backgroundOpacity;
  final double borderOpacity;
  final Color? glowColor;

  @override
  Widget build(BuildContext context) => ClipRRect(
    borderRadius: borderRadius ?? BorderRadius.circular(KortanaRadius.lg),
    child: BackdropFilter(
      filter: ImageFilter.blur(sigmaX: blurSigma, sigmaY: blurSigma),
      child: Container(
        padding: padding ?? const EdgeInsets.all(KortanaSpacing.lg),
        decoration: BoxDecoration(
          color: AppTheme.cardDark.withOpacity(backgroundOpacity),
          borderRadius: borderRadius ?? BorderRadius.circular(KortanaRadius.lg),
          border: Border.all(
            color: AppTheme.kortanaBlue.withOpacity(borderOpacity),
            width: 1.0,
          ),
          boxShadow: [
            BoxShadow(
              color: (glowColor ?? AppTheme.kortanaBlue).withOpacity(0.15),
              blurRadius: 24,
              offset: const Offset(0, 8),
              spreadRadius: 0,
            ),
          ],
        ),
        child: child,
      ),
    ),
  );
}
