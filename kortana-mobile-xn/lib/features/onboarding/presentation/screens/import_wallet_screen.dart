import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:kortana_wallet/core/theme/app_theme.dart';
import 'package:kortana_wallet/core/theme/spacing.dart';
import 'package:kortana_wallet/core/theme/text_styles.dart';
import 'package:kortana_wallet/core/widgets/glass_card.dart';
import 'package:kortana_wallet/core/widgets/kortana_button.dart';
import 'package:kortana_wallet/core/widgets/kortana_input.dart';

class ImportWalletScreen extends StatefulWidget {
  const ImportWalletScreen({super.key});

  @override
  State<ImportWalletScreen> createState() => _ImportWalletScreenState();
}

class _ImportWalletScreenState extends State<ImportWalletScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _mnemonicController = TextEditingController();
  final TextEditingController _privateKeyController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _mnemonicController.dispose();
    _privateKeyController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.abyssBlack,
      appBar: AppBar(
        title: const Text('Import Wallet'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppTheme.kortanaBlue,
          labelColor: AppTheme.pureWhite,
          unselectedLabelColor: AppTheme.pureWhite.withOpacity(0.4),
          indicatorPadding: const EdgeInsets.symmetric(horizontal: 16),
          tabs: const [
            Tab(text: 'Seed Phrase'),
            Tab(text: 'Private Key'),
            Tab(text: 'Hardware'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _SeedPhraseTab(controller: _mnemonicController),
          _PrivateKeyTab(controller: _privateKeyController),
          const _HardwareTab(),
        ],
      ),
    );
  }
}

class _SeedPhraseTab extends StatelessWidget {
  final TextEditingController controller;
  const _SeedPhraseTab({required this.controller});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(KortanaSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Enter your 12 or 24 word seed phrase separated by spaces.',
            style: KortanaTextStyles.bodyMD,
          ),
          const SizedBox(height: KortanaSpacing.xxxl),
          KortanaInput(
            controller: controller,
            hintText: 'e.g. apple banana cherry ...',
            height: 180,
            isMonospace: true,
            keyboardType: TextInputType.multiline,
            onChanged: (_) {},
          ),
          const Spacer(),
          KortanaButton(
            label: 'Import Seed Phrase',
            onTap: () => context.go('/home'),
          ),
          const SizedBox(height: KortanaSpacing.xxxl),
        ],
      ),
    );
  }
}

class _PrivateKeyTab extends StatelessWidget {
  final TextEditingController controller;
  const _PrivateKeyTab({required this.controller});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(KortanaSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Enter your string of 64 hexadecimal characters.',
            style: KortanaTextStyles.bodyMD,
          ),
          const SizedBox(height: KortanaSpacing.xxxl),
          KortanaInput(
            controller: controller,
            hintText: '0x...',
            height: 120,
            isMonospace: true,
            keyboardType: TextInputType.multiline,
          ),
          const Spacer(),
          KortanaButton(
            label: 'Import Private Key',
            onTap: () => context.go('/home'),
          ),
          const SizedBox(height: KortanaSpacing.xxxl),
        ],
      ),
    );
  }
}

class _HardwareTab extends StatelessWidget {
  const _HardwareTab();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(KortanaSpacing.xl),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Opacity(
              opacity: 0.4,
              child: GlassCard(
                child: Column(
                  children: [
                    const Icon(Icons.usb, color: AppTheme.pureWhite, size: 64),
                    const SizedBox(height: 16),
                    Text(
                      'Hardware Wallet Support',
                      style: KortanaTextStyles.headingMD,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Coming in v1.1',
                      style: KortanaTextStyles.bodySM.copyWith(color: const Color(0xFF4A7DAA)),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            KortanaButton(
              label: 'Notify Me',
              variant: KortanaButtonVariant.ghost,
              onTap: () {},
              icon: const Icon(Icons.notifications_none, color: AppTheme.pureWhite, size: 20),
            ),
          ],
        ),
      ),
    );
  }
}
