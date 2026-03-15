import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:kortana_wallet/core/theme/app_theme.dart';
import 'package:kortana_wallet/core/theme/radius.dart';
import 'package:kortana_wallet/core/theme/spacing.dart';
import 'package:kortana_wallet/core/theme/text_styles.dart';

class AddressBadge extends StatelessWidget {
  final String address;
  final bool showCopy;

  const AddressBadge({
    super.key, 
    required this.address, 
    this.showCopy = true,
  });

  String get truncated {
    if (address.length < 12) return address;
    return '${address.substring(0, 6)}...${address.substring(address.length - 4)}';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: AppTheme.pureWhite.withOpacity(0.06),
        borderRadius: BorderRadius.circular(KortanaRadius.pillRadius.bottomLeft.x), // Simplified pill radius
        border: Border.all(color: AppTheme.pureWhite.withOpacity(0.1)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            truncated,
            style: KortanaTextStyles.monoSM.copyWith(color: AppTheme.pureWhite.withOpacity(0.6)),
          ),
          if (showCopy) ...[
            const SizedBox(width: 8),
            GestureDetector(
              onTap: () {
                Clipboard.setData(ClipboardData(text: address));
                HapticFeedback.lightImpact();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Address copied to clipboard'), behavior: SnackBarBehavior.floating),
                );
              },
              child: Icon(Icons.copy, size: 14, color: AppTheme.pureWhite.withOpacity(0.6)),
            ),
          ],
        ],
      ),
    );
  }
}
