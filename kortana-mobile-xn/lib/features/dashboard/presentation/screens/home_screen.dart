import 'package:flutter/material.dart';
import 'package:kortana_wallet/core/theme/app_theme.dart';
import 'package:kortana_wallet/core/theme/spacing.dart';
import 'package:kortana_wallet/core/theme/text_styles.dart';
import 'package:kortana_wallet/features/dashboard/presentation/widgets/balance_card.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.abyssBlack,
      body: NestedScrollView(
        headerSliverBuilder: (context, isScrolled) => [
          SliverAppBar(
            pinned: true,
            backgroundColor: isScrolled ? AppTheme.cardDark.withOpacity(0.8) : Colors.transparent,
            title: Row(
              children: [
                const CircleAvatar(
                   radius: 18,
                   backgroundColor: AppTheme.kortanaBlue,
                   child: Text('MA', style: TextStyle(color: Colors.white, fontSize: 12)),
                ),
                const SizedBox(width: 8),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Main Account', style: KortanaTextStyles.bodyMD.copyWith(color: Colors.white, fontWeight: FontWeight.bold)),
                    _buildNetworkBadge(),
                  ],
                ),
                const Icon(Icons.arrow_drop_down, color: Colors.white),
              ],
            ),
            actions: [
              IconButton(icon: const Icon(Icons.search, color: Colors.white), onPressed: () {}),
              IconButton(icon: const Icon(Icons.notifications_outlined, color: Colors.white), onPressed: () {}),
              IconButton(icon: const Icon(Icons.settings_outlined, color: Colors.white), onPressed: () {}),
            ],
          ),
        ],
        body: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: KortanaSpacing.xl, vertical: KortanaSpacing.lg),
                child: Column(
                  children: [
                    const BalanceCard(),
                    const SizedBox(height: KortanaSpacing.xxxl),
                    _buildSparklinePlaceholder(),
                  ],
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: KortanaSpacing.xl, vertical: KortanaSpacing.lg),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                     Text('Assets', style: KortanaTextStyles.headingMD.copyWith(color: AppTheme.pureWhite)),
                     Text('Refresh', style: KortanaTextStyles.bodySM.copyWith(color: AppTheme.kortanaBlue)),
                  ],
                ),
              ),
            ),
            SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) => _buildTokenRow(index),
                childCount: 5,
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: _KortanaBottomNav(),
    );
  }

  Widget _buildNetworkBadge() => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: const BoxDecoration(shape: BoxShape.circle, color: AppTheme.successTeal),
          ),
          const SizedBox(width: 4),
          Text('Kortana Mainnet', style: KortanaTextStyles.bodySM.copyWith(color: AppTheme.successTeal, fontSize: 10)),
        ],
      );

  Widget _buildSparklinePlaceholder() => Container(
        height: 100,
        decoration: BoxDecoration(
          color: AppTheme.cardDark.withOpacity(0.3),
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Center(
          child: Icon(Icons.show_chart, color: AppTheme.kortanaBlue, size: 48),
        ),
      );

  Widget _buildTokenRow(int index) {
     final tokens = ['Kortana', 'Ethereum', 'USDT', 'BNB', 'Polygon'];
     final symbols = ['KRTN', 'ETH', 'USDT', 'BNB', 'MATIC'];
     final prices = [5.24, 3421.12, 1.00, 582.32, 0.72];
     final changes = ['+12.4%', '-2.1%', '0.0%', '+0.5%', '-4.2%'];

     return ListTile(
       contentPadding: const EdgeInsets.symmetric(horizontal: KortanaSpacing.xl, vertical: 8),
       leading: CircleAvatar(
         backgroundColor: AppTheme.kortanaBlue.withOpacity(0.1),
         child: Text(symbols[index][0], style: const TextStyle(color: AppTheme.kortanaBlue)),
       ),
       title: Text(tokens[index], style: KortanaTextStyles.bodyLG.copyWith(color: Colors.white)),
       subtitle: Text('${prices[index]} ${symbols[index]}', style: KortanaTextStyles.bodySM.copyWith(color: Colors.white70)),
       trailing: Column(
         mainAxisAlignment: MainAxisAlignment.center,
         crossAxisAlignment: CrossAxisAlignment.end,
         children: [
           Text('\$${(prices[index] * 100).toStringAsFixed(2)}', style: KortanaTextStyles.bodyLG.copyWith(color: Colors.white)),
           Text(changes[index], style: KortanaTextStyles.bodySM.copyWith(color: changes[index].startsWith('+') ? AppTheme.successTeal : AppTheme.errorRed)),
         ],
       ),
     );
  }
}

class _KortanaBottomNav extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 80,
      decoration: BoxDecoration(
        color: AppTheme.charcoalNavy.withOpacity(0.95),
        border: const Border(top: BorderSide(color: Color(0x330066FF))),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildNavItem(Icons.home_filled, 'Home', true),
          _buildNavItem(Icons.history, 'History', false),
          _buildCenterFab(),
          _buildNavItem(Icons.wallet, 'Receive', false),
          _buildNavItem(Icons.settings, 'Settings', false),
        ],
      ),
    );
  }

  Widget _buildNavItem(IconData icon, String label, bool active) => Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: active ? AppTheme.kortanaBlue : Colors.white38),
          const SizedBox(height: 4),
          Text(label, style: KortanaTextStyles.bodySM.copyWith(color: active ? AppTheme.kortanaBlue : Colors.white38, fontSize: 10)),
        ],
      );

  Widget _buildCenterFab() => Container(
        width: 56,
        height: 56,
        decoration: const BoxDecoration(
          shape: BoxShape.circle,
          gradient: LinearGradient(colors: [Color(0xFF1A8CFF), Color(0xFF0052CC)]),
        ),
        child: const Icon(Icons.qr_code_scanner, color: Colors.white),
      );
}
