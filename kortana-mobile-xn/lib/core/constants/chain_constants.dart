import 'package:freezed_annotation/freezed_annotation.dart';

part 'chain_constants.freezed.dart';

@freezed
class NetworkConfig with _$NetworkConfig {
  const factory NetworkConfig({
    required int chainId,
    required String name,
    required String symbol,
    required int decimals,
    required String rpcUrl,
    required String explorerUrl,
    required String logoAsset,
    required bool isTestnet,
    String? multicallAddress,
    String? wrappedNativeAddress,
  }) = _NetworkConfig;
}

class KortanaChains {
  static const NetworkConfig mainnet = NetworkConfig(
    chainId:          1234,    // ⚠️ Verify exact Chain ID from kortana.network
    name:             'Kortana Mainnet',
    symbol:           'KRTN',
    decimals:         18,
    rpcUrl:           'https://rpc.kortana.network',
    explorerUrl:      'https://explorer.kortana.network',
    logoAsset:        'assets/icons/kortana-chain.svg',
    isTestnet:        false,
  );

  static const NetworkConfig testnet = NetworkConfig(
    chainId:          12340,   // ⚠️ Verify from kortana.network docs
    name:             'Kortana Testnet',
    symbol:           'tKRTN',
    decimals:         18,
    rpcUrl:           'https://testnet-rpc.kortana.network',
    explorerUrl:      'https://testnet-explorer.kortana.network',
    logoAsset:        'assets/icons/kortana-chain.svg',
    isTestnet:        true,
  );

  static final List<NetworkConfig> defaults = [
    mainnet, testnet,
  ];
}
