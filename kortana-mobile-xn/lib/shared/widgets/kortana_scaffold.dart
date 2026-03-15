import 'package:flutter/material.dart';
import 'package:kortana_wallet/core/theme/app_theme.dart';

class KortanaScaffold extends StatelessWidget {
  const KortanaScaffold({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: AppTheme.abyssBlack,
    body: child,
  );
}
