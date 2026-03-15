import 'package:web3dart/web3dart.dart';

class DerivedAccount {
  final EthereumAddress address;
  final String privateKey;
  final String publicKey;
  final String path;
  final int accountIndex;

  const DerivedAccount({
    required this.address,
    required this.privateKey,
    required this.publicKey,
    required this.path,
    required this.accountIndex,
  });
}
