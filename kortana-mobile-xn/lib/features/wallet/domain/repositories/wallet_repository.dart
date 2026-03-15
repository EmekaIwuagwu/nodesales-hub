import 'package:kortana_wallet/features/wallet/domain/entities/account.dart';

abstract class WalletRepository {
  Future<String> createWallet(String mnemonic, String pin);
  Future<List<DerivedAccount>> loadAccounts();
  Future<bool> unlock(String pin);
  Future<bool> checkHasWallet();
}
