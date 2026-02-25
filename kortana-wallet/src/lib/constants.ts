export const NETWORKS = {
    testnet: {
        name: 'Kortana Testnet',
        rpc: 'https://poseidon-rpc.testnet.kortana.xyz/',
        chainId: 72511,
        symbol: 'DNR',
        explorer: 'https://explorer.testnet.kortana.xyz',
    },
    mainnet: {
        name: 'Kortana Mainnet',
        rpc: 'https://zeus-rpc.mainnet.kortana.xyz',
        chainId: 9002,
        symbol: 'DNR',
        explorer: 'https://explorer.mainnet.kortana.xyz',
    },
};

export type NetworkType = keyof typeof NETWORKS;
