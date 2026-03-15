export interface NetworkConfig {
    chainId: number;
    name: string;
    symbol: string;
    decimals: number;
    rpcUrl: string;
    explorerUrl: string;
    logoUri?: string | number;
    isTestnet: boolean;
}

export interface NetworkState {
    activeNetwork: NetworkConfig;
    networks: NetworkConfig[];
}
