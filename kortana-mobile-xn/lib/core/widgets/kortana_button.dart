import 'package:flutter/material.dart';
import 'package:kortana_wallet/core/theme/app_theme.dart';
import 'package:kortana_wallet/core/theme/radius.dart';
import 'package:kortana_wallet/core/theme/text_styles.dart';

enum KortanaButtonVariant { primary, secondary, ghost }

class KortanaButton extends StatelessWidget {
  const KortanaButton({
    super.key,
    required this.label,
    required this.onTap,
    this.variant = KortanaButtonVariant.primary,
    this.isLoading = false,
    this.icon,
    this.width,
    this.height = 56.0,
  });

  final String label;
  final VoidCallback? onTap;
  final KortanaButtonVariant variant;
  final bool isLoading;
  final Widget? icon;
  final double? width;
  final double height;

  @override
  Widget build(BuildContext context) {
    final isEnabled = onTap != null && !isLoading;

    return Opacity(
      opacity: isEnabled ? 1.0 : 0.6,
      child: Container(
        width: width ?? double.infinity,
        height: height,
        decoration: variant == KortanaButtonVariant.primary
            ? BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1A8CFF), Color(0xFF0052CC)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(KortanaRadius.lg),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.kortanaBlue.withOpacity(0.3),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              )
            : null,
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: isEnabled ? onTap : null,
            borderRadius: BorderRadius.circular(KortanaRadius.lg),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: variant == KortanaButtonVariant.secondary
                  ? BoxDecoration(
                      border: Border.all(
                        color: AppTheme.kortanaBlue,
                        width: 1.5,
                      ),
                      borderRadius: BorderRadius.circular(KortanaRadius.lg),
                    )
                  : null,
              child: Center(
                child: isLoading
                    ? const SizedBox(
                        height: 24,
                        width: 24,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (icon != null) ...[
                            icon!,
                            const SizedBox(width: 8),
                          ],
                          Text(
                            label,
                            style: KortanaTextStyles.bodyLG.copyWith(
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
