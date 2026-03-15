import 'package:flutter/material.dart';
import 'package:kortana_wallet/core/theme/app_theme.dart';
import 'package:kortana_wallet/core/theme/radius.dart';
import 'package:kortana_wallet/core/theme/spacing.dart';
import 'package:kortana_wallet/core/theme/text_styles.dart';

class KortanaInput extends StatelessWidget {
  const KortanaInput({
    super.key,
    this.controller,
    this.hintText,
    this.labelText,
    this.prefixIcon,
    this.suffixIcon,
    this.obscureText = false,
    this.keyboardType,
    this.validator,
    this.onChanged,
    this.height = 64.0,
    this.isMonospace = false,
  });

  final TextEditingController? controller;
  final String? hintText;
  final String? labelText;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final bool obscureText;
  final TextInputType? keyboardType;
  final String? Function(String?)? validator;
  final Function(String)? onChanged;
  final double height;
  final bool isMonospace;

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (labelText != null) ...[
            Text(
              labelText!,
              style: KortanaTextStyles.bodySM.copyWith(
                color: AppTheme.pureWhite.withOpacity(0.6),
                fontWeight: FontWeight.w600,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: KortanaSpacing.sm),
          ],
          Container(
            height: height,
            decoration: BoxDecoration(
              color: AppTheme.cardDark.withOpacity(0.4),
              borderRadius: BorderRadius.circular(KortanaRadius.md),
              border: Border.all(
                color: AppTheme.kortanaBlue.withOpacity(0.2),
                width: 1.0,
              ),
            ),
            child: TextFormField(
              controller: controller,
              obscureText: obscureText,
              keyboardType: keyboardType,
              onChanged: onChanged,
              validator: validator,
              style: (isMonospace ? KortanaTextStyles.monoMD : KortanaTextStyles.bodyLG).copyWith(
                color: AppTheme.pureWhite,
              ),
              decoration: InputDecoration(
                hintText: hintText,
                hintStyle: KortanaTextStyles.bodyMD.copyWith(
                  color: AppTheme.pureWhite.withOpacity(0.2),
                ),
                prefixIcon: prefixIcon,
                suffixIcon: suffixIcon,
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(KortanaRadius.md),
                  borderSide: const BorderSide(color: AppTheme.kortanaBlue, width: 1.5),
                ),
                errorBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(KortanaRadius.md),
                  borderSide: const BorderSide(color: AppTheme.errorRed, width: 1.5),
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: KortanaSpacing.lg,
                  vertical: 18,
                ),
              ),
            ),
          ),
        ],
      );
}
