import 'package:flutter/material.dart';
import 'package:kortana_wallet/core/theme/app_theme.dart';
import 'package:kortana_wallet/core/theme/radius.dart';
import 'package:kortana_wallet/core/theme/spacing.dart';
import 'package:kortana_wallet/core/theme/text_styles.dart';
import 'package:kortana_wallet/core/widgets/glass_card.dart';

class BalanceCard extends StatefulWidget {
  const BalanceCard({super.key});

  @override
  State<BalanceCard> createState() => _BalanceCardState();
}

class _BalanceCardState extends State<BalanceCard> {
  bool _isVisible = true;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      borderRadius: const BorderRadius.all(Radius.circular(32)),
      padding: const EdgeInsets.symmetric(horizontal: KortanaSpacing.xxl, vertical: KortanaSpacing.xxl),
      backgroundOpacity: 0.8,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Total Balance',
                style: KortanaTextStyles.bodyMD.copyWith(color: AppTheme.pureWhite.withOpacity(0.6)),
              ),
              IconButton(
                icon: Icon(
                  _isVisible ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                  color: AppTheme.pureWhite.withOpacity(0.6),
                  size: 20,
                ),
                onPressed: () => setState(() => _isVisible = !_isVisible),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            _isVisible ? '\$12,847.32' : '••••••••',
            style: KortanaTextStyles.displayXL.copyWith(color: AppTheme.pureWhite),
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              Text(
                _isVisible ? '2,441.23 KRTN' : '•••• KRTN',
                style: KortanaTextStyles.bodyLG.copyWith(color: AppTheme.pureWhite.withOpacity(0.6)),
              ),
              const SizedBox(width: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppTheme.successTeal.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(KortanaRadius.xs),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.arrow_upward, color: AppTheme.successTeal, size: 12),
                    Text(
                      '2.26%',
                      style: KortanaTextStyles.bodySM.copyWith(color: AppTheme.successTeal, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: KortanaSpacing.xxxl),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _QuickAction(icon: Icons.north_east, label: 'Send', onTap: () {}),
              _QuickAction(icon: Icons.south_west, label: 'Receive', onTap: () {}),
              _QuickAction(icon: Icons.swap_horiz, label: 'Swap', onTap: () {}),
              _QuickAction(icon: Icons.credit_card, label: 'Buy', onTap: () {}),
            ],
          ),
        ],
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _QuickAction({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppTheme.kortanaBlue.withOpacity(0.1),
            border: Border.all(color: AppTheme.kortanaBlue.withOpacity(0.3)),
          ),
          child: IconButton(
            icon: Icon(icon, color: Colors.white, size: 24),
            onPressed: onTap,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: KortanaTextStyles.bodySM.copyWith(color: AppTheme.pureWhite),
        ),
      ],
    );
  }
}
