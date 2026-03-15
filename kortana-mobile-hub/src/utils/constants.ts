import { NetworkConfig } from "../types/network.types";

export const KORTANA_MAINNET: NetworkConfig = {
    chainId: 1234,
    name: 'Kortana Mainnet',
    symbol: 'KRTN',
    decimals: 18,
    rpcUrl: 'https://rpc.kortana.network',
    explorerUrl: 'https://explorer.kortana.network',
    isTestnet: false,
};

export const KORTANA_TESTNET: NetworkConfig = {
    chainId: 12340,
    name: 'Kortana Testnet',
    symbol: 'tKRTN',
    decimals: 18,
    rpcUrl: 'https://testnet-rpc.kortana.network',
    explorerUrl: 'https://testnet-explorer.kortana.network',
    isTestnet: true,
};

export const DEFAULT_NETWORKS: NetworkConfig[] = [
    KORTANA_MAINNET,
    KORTANA_TESTNET,
];
