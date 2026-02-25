import { ethers, JsonRpcProvider } from 'ethers';
import { NETWORKS, NetworkType } from './constants';

class ProviderService {
    private providers: Map<NetworkType, JsonRpcProvider> = new Map();
    private activeNetwork: NetworkType = 'mainnet';

    getProvider(network: NetworkType = this.activeNetwork): JsonRpcProvider {
        if (!this.providers.has(network)) {
            const config = NETWORKS[network];
            const provider = new JsonRpcProvider(config.rpc, {
                chainId: config.chainId,
                name: config.name,
            });
            this.providers.set(network, provider);
        }
        return this.providers.get(network)!;
    }

    setActiveNetwork(network: NetworkType) {
        this.activeNetwork = network;
    }

    async getBalance(address: string, network: NetworkType = this.activeNetwork): Promise<string> {
        try {
            const provider = this.getProvider(network);
            const balance = await provider.getBalance(address);
            return ethers.formatEther(balance);
        } catch (error) {
            console.error(`Failed to fetch balance for ${address} on ${network}:`, error);
            return '0.00';
        }
    }

    async checkHealth(network: NetworkType = this.activeNetwork): Promise<boolean> {
        try {
            const provider = this.getProvider(network);
            await provider.getNetwork();
            return true;
        } catch (error) {
            console.error(`Health check failed for ${network}:`, error);
            return false;
        }
    }

    async estimateGas(tx: ethers.TransactionRequest, network: NetworkType = this.activeNetwork): Promise<bigint> {
        const provider = this.getProvider(network);
        return await provider.estimateGas(tx);
    }

    async getGasPrice(network: NetworkType): Promise<string> {
        const provider = this.getProvider(network);
        const feeData = await provider.getFeeData();
        return ethers.formatUnits(feeData.gasPrice || 0, 'gwei');
    }

    async getAddressHistory(address: string, network: NetworkType): Promise<any[]> {
        const provider = this.getProvider(network);
        try {
            const txs = await provider.send("eth_getAddressHistory", [address]);
            return txs || [];
        } catch (error) {
            console.error('Failed to fetch address history:', error);
            return [];
        }
    }

    async sendTransaction(signedTx: string, network: NetworkType = this.activeNetwork): Promise<ethers.TransactionResponse> {
        const provider = this.getProvider(network);
        return await provider.broadcastTransaction(signedTx);
    }

    async getTransactionReceipt(hash: string, network: NetworkType = this.activeNetwork): Promise<ethers.TransactionReceipt | null> {
        const provider = this.getProvider(network);
        return await provider.getTransactionReceipt(hash);
    }
}

export const providerService = new ProviderService();
