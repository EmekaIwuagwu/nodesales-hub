import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:bip39/bip39.dart' as bip39;
import 'package:kortana_wallet/core/theme/app_theme.dart';
import 'package:kortana_wallet/core/theme/spacing.dart';
import 'package:kortana_wallet/core/theme/text_styles.dart';
import 'package:kortana_wallet/core/widgets/glass_card.dart';
import 'package:kortana_wallet/core/widgets/kortana_button.dart';

class CreateWalletScreen extends StatefulWidget {
  const CreateWalletScreen({super.key});

  @override
  State<CreateWalletScreen> createState() => _CreateWalletScreenState();
}

class _CreateWalletScreenState extends State<CreateWalletScreen> {
  late final String _mnemonic;
  final List<bool> _revealed = List.generate(12, (_) => false);
  bool _allRevealed = false;

  @override
  void initState() {
    super.initState();
    _mnemonic = bip39.generateMnemonic();
  }

  void _revealWord(int index) {
    setState(() {
      _revealed[index] = true;
      _allRevealed = _revealed.every((r) => r);
    });
  }

  void _revealAll() {
    setState(() {
      for (int i = 0; i < _revealed.length; i++) {
        _revealed[i] = true;
      }
      _allRevealed = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    final words = _mnemonic.split(' ');

    return Scaffold(
      backgroundColor: AppTheme.abyssBlack,
      appBar: AppBar(
        title: const Text('New Wallet'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: KortanaSpacing.xl, vertical: KortanaSpacing.xl),
        child: Column(
          children: [
            const _ProgressIndicator(step: 1),
            const SizedBox(height: KortanaSpacing.xxxl),
            
            GlassCard(
              backgroundOpacity: 0.1,
              glowColor: AppTheme.warningAmber,
              borderOpacity: 0.1,
              child: Row(
                children: [
                   const Icon(Icons.shield_outlined, color: AppTheme.warningAmber, size: 32),
                   const SizedBox(width: 16),
                   Expanded(
                     child: Text(
                       'Write down your 12-word seed phrase and keep it somewhere safe. Never share it with anyone.',
                       style: KortanaTextStyles.bodyMD.copyWith(color: AppTheme.warningAmber),
                     ),
                   ),
                ],
              ),
            ),
            
            const SizedBox(height: KortanaSpacing.xxxl),
            
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.2,
              ),
              itemCount: words.length,
              itemBuilder: (context, index) {
                final revealed = _revealed[index];
                return GestureDetector(
                  onTap: () => _revealWord(index),
                  child: GlassCard(
                    padding: const EdgeInsets.all(8),
                    backgroundOpacity: revealed ? 0.3 : 0.1,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          '${index + 1}',
                          style: KortanaTextStyles.bodySM.copyWith(color: AppTheme.pureWhite.withOpacity(0.4)),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          revealed ? words[index] : '••••',
                          style: KortanaTextStyles.bodyMD.copyWith(
                            color: AppTheme.pureWhite,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
            
            const SizedBox(height: KortanaSpacing.xxxl),
            
            if (!_allRevealed)
              KortanaButton(
                label: 'Reveal All Words',
                variant: KortanaButtonVariant.ghost,
                onTap: _revealAll,
              ),

            if (_allRevealed)
              KortanaButton(
                label: 'Copy to Clipboard',
                variant: KortanaButtonVariant.ghost,
                onTap: () {
                  Clipboard.setData(ClipboardData(text: _mnemonic));
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        'Seed phrase copied to clipboard',
                        style: KortanaTextStyles.bodySM.copyWith(color: AppTheme.pureWhite),
                      ),
                      backgroundColor: AppTheme.abyssBlack,
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                },
              ),
            
            const SizedBox(height: KortanaSpacing.lg),
            
            KortanaButton(
              label: "I've Saved My Phrase",
              onTap: _allRevealed ? () => context.go('/home') : null,
            ),
          ],
        ),
      ),
    );
  }
}

class _ProgressIndicator extends StatelessWidget {
  final int step;
  const _ProgressIndicator({required this.step});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(3, (index) {
        final active = index < step;
        return Expanded(
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 4),
            height: 4,
            decoration: BoxDecoration(
              color: active ? AppTheme.kortanaBlue : AppTheme.pureWhite.withOpacity(0.1),
              borderRadius: BorderRadius.circular(2),
              boxShadow: active ? [
                BoxShadow(color: AppTheme.kortanaBlue.withOpacity(0.5), blurRadius: 4),
              ] : null,
            ),
            ),
          );
      }),
    );
  }
}
