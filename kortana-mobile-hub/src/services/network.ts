import { ethers } from 'ethers';
import { NetworkConfig } from '../types/network.types';

export class NetworkService {
    private provider: ethers.JsonRpcProvider;

    constructor(network: NetworkConfig) {
        this.provider = new ethers.JsonRpcProvider(network.rpcUrl);
    }

    async getBalance(address: string): Promise<string> {
        try {
            const balance = await this.provider.getBalance(address);
            return ethers.formatEther(balance);
        } catch (error) {
            console.error('Error fetching balance:', error);
            return '0.0';
        }
    }

    async getTokenBalance(tokenAddress: string, accountAddress: string): Promise<string> {
        try {
            const abi = ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'];
            const contract = new ethers.Contract(tokenAddress, abi, this.provider);
            const [balance, decimals] = await Promise.all([
                contract.balanceOf(accountAddress),
                contract.decimals()
            ]);
            return ethers.formatUnits(balance, decimals);
        } catch (error) {
            console.error('Error fetching token balance:', error);
            return '0.0';
        }
    }

    async estimateGas(tx: ethers.TransactionRequest): Promise<bigint> {
        try {
            return await this.provider.estimateGas(tx);
        } catch (error) {
            console.error('Error estimating gas:', error);
            return BigInt(21000);
        }
    }

    async getGasPrice(): Promise<bigint> {
        try {
            const { gasPrice } = await this.provider.getFeeData();
            return gasPrice || BigInt(0);
        } catch (error) {
            console.error('Error fetching gas price:', error);
            return BigInt(0);
        }
    }

    async getTransactionCount(address: string): Promise<number> {
        try {
            return await this.provider.getTransactionCount(address);
        } catch (error) {
            console.error('Error fetching nonce:', error);
            return 0;
        }
    }
}

export const createNetworkService = (network: NetworkConfig) => new NetworkService(network);
