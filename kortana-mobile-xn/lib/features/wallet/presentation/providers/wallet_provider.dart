import 'package:flutter_riverpod/flutter_riverpod.dart';

// State for the wallet
class WalletState {
  const WalletState({
    required this.hasWallet,
    required this.isLocked,
  });

  final bool hasWallet;
  final bool isLocked;

  WalletState copyWith({bool? hasWallet, bool? isLocked}) {
    return WalletState(
      hasWallet: hasWallet ?? this.hasWallet,
      isLocked: isLocked ?? this.isLocked,
    );
  }
}

class WalletNotifier extends Notifier<WalletState> {
  @override
  WalletState build() {
    return const WalletState(hasWallet: false, isLocked: true);
  }

  Future<bool> checkExistingWallet() async {
    // Check for existing mnemonic in secure storage
    // For now, return false
    await Future.delayed(const Duration(seconds: 1));
    return false;
  }
}

final walletProvider = NotifierProvider<WalletNotifier, WalletState>(() {
  return WalletNotifier();
});
