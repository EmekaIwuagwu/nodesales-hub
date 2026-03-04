export const IDE_CONFIG = {
    COMPILER: {
        BACKEND_URL: (import.meta as any).env.VITE_COMPILER_URL ||
            (typeof window !== 'undefined' ? `${window.location.origin}/api/v1/compile` : 'http://localhost:5160/api/v1/compile'),
        DEFAULT_VERSION: '0.8.19'
    },
    NETWORKS: {
        TESTNET: {
            chainId: '0x11b3f',
            chainName: 'Kortana Testnet',
            nativeCurrency: {
                name: 'Dinar',
                symbol: 'DNR',
                decimals: 18
            },
            rpcUrls: ['https://poseidon-rpc.testnet.kortana.xyz/'],
            blockExplorerUrls: ['https://explorer.testnet.kortana.xyz/']
        },
        MAINNET: {
            chainId: '0x232a',
            chainName: 'Kortana Mainnet',
            nativeCurrency: {
                name: 'Dinar',
                symbol: 'DNR',
                decimals: 18
            },
            rpcUrls: ['https://zeus-rpc.mainnet.kortana.xyz/'],
            blockExplorerUrls: ['https://explorer.mainnet.kortana.xyz/']
        }
    }
};
