import 'package:flutter/material.dart';
import 'package:kortana_wallet/core/theme/app_theme.dart';
import 'package:kortana_wallet/core/theme/spacing.dart';
import 'package:kortana_wallet/core/theme/text_styles.dart';

class TokenRow extends StatelessWidget {
  final String icon;
  final String name;
  final String symbol;
  final double amount;
  final double usdBalance;
  final String change;
  final VoidCallback onTap;

  const TokenRow({
    super.key,
    required this.icon,
    required this.name,
    required this.symbol,
    required this.amount,
    required this.usdBalance,
    required this.change,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isPositive = change.startsWith('+');
    
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: KortanaSpacing.xl, vertical: 12),
        child: Row(
          children: [
            CircleAvatar(
              radius: 22,
              backgroundColor: AppTheme.kortanaBlue.withOpacity(0.1),
              child: Text(
                symbol[0],
                style: const TextStyle(color: AppTheme.kortanaBlue, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: KortanaTextStyles.bodyLG.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    '$amount $symbol',
                    style: KortanaTextStyles.bodySM.copyWith(color: Colors.white70),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                   '\$${usdBalance.toStringAsFixed(2)}',
                   style: KortanaTextStyles.bodyLG.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
                ),
                Text(
                   change,
                   style: KortanaTextStyles.bodySM.copyWith(
                     color: isPositive ? AppTheme.successTeal : AppTheme.errorRed,
                     fontWeight: FontWeight.bold,
                   ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
