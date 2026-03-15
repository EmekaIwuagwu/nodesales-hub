import 'package:flutter/material.dart';
import 'package:kortana_wallet/core/theme/app_theme.dart';

class PinDotRow extends StatelessWidget {
  final int filledCount;
  final int totalCount;
  final bool hasError;

  const PinDotRow({
    super.key,
    required this.filledCount,
    this.totalCount = 6,
    this.hasError = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(totalCount, (index) {
        final isFilled = index < filledCount;
        return AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          margin: const EdgeInsets.symmetric(horizontal: 12),
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: hasError
                ? AppTheme.errorRed
                : (isFilled ? AppTheme.kortanaBlue : Colors.transparent),
            border: Border.all(
              color: hasError
                  ? AppTheme.errorRed
                  : AppTheme.kortanaBlue.withOpacity(isFilled ? 1.0 : 0.25),
              width: 1.5,
            ),
            boxShadow: isFilled && !hasError ? [
              BoxShadow(
                color: AppTheme.kortanaBlue.withOpacity(0.5),
                blurRadius: 10,
                spreadRadius: 1,
              ),
            ] : null,
          ),
          curve: Curves.easeOutBack,
          transform: Matrix4.identity()..scale(isFilled ? 1.1 : 1.0),
        );
      }),
    );
  }
}
