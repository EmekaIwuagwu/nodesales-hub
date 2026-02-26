// Kortana Network Constants — source of truth for the frontend
export const NETWORK = {
    mainnet: {
        name: "Kortana Mainnet",
        chainId: 9002,
        chainIdHex: "0x232A",
        rpcUrl: "https://zeus-rpc.mainnet.kortana.xyz",
        explorerUrl: "https://explorer.mainnet.kortana.xyz",
        symbol: "DNR",
        decimals: 18,
        blockTime: 2,         // seconds
        totalSupply: "500,000,000,000", // 500B DNR
        status: "🟢 LIVE",
    },
    testnet: {
        name: "Kortana Testnet",
        chainId: 72511,
        chainIdHex: "0x11B3F",
        rpcUrl: "https://poseidon-rpc.testnet.kortana.xyz/",
        explorerUrl: "https://explorer.testnet.kortana.xyz",
        symbol: "DNR",
        decimals: 18,
        blockTime: 2,
        status: "🟢 LIVE",
    },
} as const;

type NetworkKey = keyof typeof NETWORK;

async function fetchBlockHeight(rpcUrl: string): Promise<string> {
    try {
        const response = await fetch(rpcUrl, {
            method: "POST",
            cache: "no-store",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "eth_blockNumber",
                params: [],
                id: 1,
            }),
        });
        const data = await response.json();
        if (data.result) {
            return parseInt(data.result, 16).toLocaleString();
        }
        return "N/A";
    } catch {
        return "N/A";
    }
}

/** Fetch live block height from mainnet (default) or testnet */
export async function getBlockHeight(network: NetworkKey = "mainnet"): Promise<string> {
    return fetchBlockHeight(NETWORK[network].rpcUrl);
}

/** Fetch a generic eth_call result from the given network */
export async function ethCall(
    to: string,
    data: string,
    network: NetworkKey = "mainnet"
): Promise<string | null> {
    try {
        const response = await fetch(NETWORK[network].rpcUrl, {
            method: "POST",
            cache: "no-store",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "eth_call",
                params: [{ to, data }, "latest"],
                id: 1,
            }),
        });
        const json = await response.json();
        return json.result ?? null;
    } catch {
        return null;
    }
}

/**
 * Fetch the EXACT total transaction count from the mainnet.
 * Scans every block from 0 → latest using concurrent individual RPC calls
 * (JSON-RPC batch is not supported by the Kortana node).
 */
export async function getTotalTransactions(network: NetworkKey = "mainnet"): Promise<string> {
    const rpcUrl = NETWORK[network].rpcUrl;
    const CHUNK = 20; // concurrent requests per round

    try {
        // 1. Get latest block number
        const bnResp = await fetch(rpcUrl, {
            method: "POST",
            cache: "no-store",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 }),
        });
        const bnData = await bnResp.json();
        if (!bnData.result) return "N/A";
        const latestBlock = parseInt(bnData.result, 16);

        // 2. Fetch every block individually in concurrent chunks
        let totalTx = 0;

        for (let start = 0; start <= latestBlock; start += CHUNK) {
            const end = Math.min(start + CHUNK - 1, latestBlock);
            const blockNums = Array.from({ length: end - start + 1 }, (_, i) => start + i);

            const results = await Promise.all(
                blockNums.map(n =>
                    fetch(rpcUrl, {
                        method: "POST",
                        cache: "no-store",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            jsonrpc: "2.0",
                            method: "eth_getBlockByNumber",
                            // false = return tx hashes only (lighter payload)
                            params: ["0x" + n.toString(16), false],
                            id: n,
                        }),
                    })
                        .then(r => r.json())
                        .catch(() => null)
                )
            );

            for (const item of results) {
                const txs = item?.result?.transactions;
                if (Array.isArray(txs)) {
                    totalTx += txs.length;
                }
            }
        }

        return totalTx.toLocaleString();
    } catch {
        return "N/A";
    }
}
