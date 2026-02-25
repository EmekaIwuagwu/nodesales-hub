/**
 * Kortana Wallet - Background Service Worker
 */

const NETWORKS = {
    testnet: {
        rpc: 'https://poseidon-rpc.testnet.kortana.xyz/',
        chainId: 72511
    },
    mainnet: {
        rpc: 'https://zeus-rpc.mainnet.kortana.xyz',
        chainId: 9002
    }
};

let currentNetwork = 'mainnet';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.source !== 'kortana-inpage') return;

    handleRequest(request).then(sendResponse);
    return true; // Keep message channel open for async response
});

// Get state from storage (Zustand persists under a specific key)
async function getStoredState() {
    const data = await chrome.storage.local.get('kortana-wallet-secure-storage');
    if (data['kortana-wallet-secure-storage']) {
        try {
            const parsed = JSON.parse(data['kortana-wallet-secure-storage']);
            return parsed.state || {};
        } catch (e) {
            return {};
        }
    }
    return {};
}

async function handleRequest(request) {
    const { method, params } = request;
    const state = await getStoredState();

    currentNetwork = state.network || 'mainnet';
    const address = state.address;
    const isLocked = state.isLocked !== false; // Default to true

    switch (method) {
        case 'eth_accounts':
        case 'eth_requestAccounts':
            if (isLocked || !address) return { result: [] };
            return { result: [address] };

        case 'eth_chainId':
            return { result: '0x' + NETWORKS[currentNetwork].chainId.toString(16) };

        case 'net_version':
            return { result: NETWORKS[currentNetwork].chainId.toString() };

        default:
            // Proxy other requests to the RPC
            try {
                const response = await fetch(NETWORKS[currentNetwork].rpc, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: request.id,
                        method,
                        params
                    })
                });
                const data = await response.json();
                return { result: data.result, error: data.error };
            } catch (error) {
                return { error: { code: -32603, message: 'Internal error' } };
            }
    }
}
