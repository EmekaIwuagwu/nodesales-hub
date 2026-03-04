import { ethers } from 'ethers';
import { IDE_CONFIG } from '../config';

const DEFAULT_NETWORK = IDE_CONFIG.NETWORKS.TESTNET;

/**
 * BlockchainService — Kortana Protocol Adapter
 */
export class BlockchainService {
    private static instance: BlockchainService;
    private browserProvider: ethers.BrowserProvider | null = null;
    private customSigner: ethers.Wallet | null = null;
    private rpcProvider: ethers.JsonRpcProvider;
    private currentNetwork = DEFAULT_NETWORK;

    private constructor() {
        // Always maintain a direct RPC connection
        this.rpcProvider = new ethers.JsonRpcProvider(this.currentNetwork.rpcUrls[0], {
            chainId: parseInt(this.currentNetwork.chainId, 16),
            name: this.currentNetwork.chainName
        });
    }

    public static getInstance(): BlockchainService {
        if (!BlockchainService.instance) {
            BlockchainService.instance = new BlockchainService();
        }
        return BlockchainService.instance;
    }

    public async connectWallet(providerType: 'metamask' | 'kortana' = 'metamask'): Promise<string> {
        const isElectron = typeof window.ipcRenderer !== 'undefined';
        let provider: any;

        if (providerType === 'metamask') {
            provider = window.ethereum;
            if (!provider || !provider.isMetaMask) {
                if (isElectron) {
                    window.open('http://localhost:3000', '_blank');
                    throw new Error('REDIRECTING_TO_WEB');
                }
                const msg = 'MetaMask not detected. Please install the extension.';
                alert(msg);
                throw new Error(msg);
            }
        } else {
            // Kortana Wallet detection (Assuming window.kortana or similar)
            provider = (window as any).kortana || window.ethereum;
            if (!provider) {
                const msg = 'Kortana Wallet not detected. Please install the Kortana extension.';
                alert(msg);
                throw new Error(msg);
            }
        }

        try {
            this.browserProvider = new ethers.BrowserProvider(provider);
            const accounts = await this.browserProvider.send("eth_requestAccounts", []);
            await this.ensureKortanaNetwork();
            this.customSigner = null;
            return accounts[0];
        } catch (error: any) {
            console.error(`${providerType} connection error:`, error);
            throw new Error(error.message || `Failed to connect ${providerType} wallet`);
        }
    }

    public async connectWithPrivateKey(privateKey: string): Promise<string> {
        try {
            this.customSigner = new ethers.Wallet(privateKey, this.rpcProvider);
            this.browserProvider = null;
            return this.customSigner.address;
        } catch (error: any) {
            console.error('Private Key connection error:', error);
            throw new Error('Invalid Private Key or RPC unreachable.');
        }
    }

    public async setNetwork(networkKey: 'TESTNET' | 'MAINNET') {
        const network = IDE_CONFIG.NETWORKS[networkKey];
        this.currentNetwork = network;
        this.rpcProvider = new ethers.JsonRpcProvider(this.currentNetwork.rpcUrls[0], {
            chainId: parseInt(this.currentNetwork.chainId, 16),
            name: this.currentNetwork.chainName
        });

        // Re-sync MetaMask if connected
        if (this.browserProvider) {
            await this.ensureKortanaNetwork();
        }

        console.log(`Switched to ${network.chainName}`);
    }

    private async ensureKortanaNetwork() {
        if (!window.ethereum) return;
        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [this.currentNetwork],
            });
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: this.currentNetwork.chainId }],
            });
            console.log(`Network synchronized with ${this.currentNetwork.chainName}`);
        } catch (error: any) {
            if (error.code !== 4001) {
                console.warn("Network switch warning:", error.message);
            }
        }
    }

    /**
     * Deploy a smart contract.
     * Works with both MetaMask (EIP-1559) and Private Key (Legacy) connections.
     * The Kortana node now handles both transaction types after the blockchain fix.
     */
    public async deploy(
        bytecode: string,
        abi: any[],
        config?: { gasLimit: string; gasPrice: string; args: any[] }
    ): Promise<ethers.ContractTransactionResponse> {

        console.log("🚀 [BlockchainService] Starting Kortana deployment...");

        // Determine signer: prefer customSigner (private key), fall back to MetaMask
        const signer = this.customSigner ||
            (this.browserProvider ? await this.browserProvider.getSigner() : null);

        if (!signer) {
            throw new Error('No wallet connected. Please connect via MetaMask or Private Key first.');
        }

        const deployerAddress = await signer.getAddress();
        const provider = signer.provider ?? this.rpcProvider;

        // 1. Balance check
        const balance = await provider.getBalance(deployerAddress);
        console.log(`   Deployer: ${deployerAddress}`);
        console.log(`   Balance: ${ethers.formatEther(balance)} DNR`);

        if (balance === 0n) {
            throw new Error("Insufficient balance! Your account has 0 DNR. Please fund it before deploying.");
        }

        // 2. Parse constructor arguments with correct types
        const constructorAbi = abi.find((item: any) => item.type === 'constructor');
        const formattedArgs = (constructorAbi?.inputs || []).map((input: any, index: number) => {
            const rawValue = (config?.args || [])[index] ?? "";
            if (input.type.startsWith('uint') || input.type.startsWith('int')) {
                const cleanVal = rawValue.toString().replace(/[^0-9]/g, '');
                return cleanVal ? BigInt(cleanVal) : 0n;
            }
            return rawValue;
        });
        console.log("   Constructor Args:", formattedArgs);

        // 3. Deploy using ContractFactory — works for both MetaMask and Private Key
        const factory = new ethers.ContractFactory(abi, bytecode, signer);
        const contract = await factory.deploy(...formattedArgs, {
            gasLimit: BigInt(config?.gasLimit ?? "3000000"),
        });

        const txResponse = contract.deploymentTransaction();
        if (!txResponse) {
            throw new Error("Protocol failed to return a transaction hash.");
        }

        console.log(`✅ [BlockchainService] Transaction broadcast! Hash: ${txResponse.hash}`);
        return txResponse as ethers.ContractTransactionResponse;
    }

    public getProvider() {
        return this.rpcProvider;
    }

    /**
     * Returns the best available signer for write (state-changing) contract calls.
     * Prefers MetaMask (BrowserProvider) for EIP-1559, falls back to private key wallet.
     */
    public async getSignerForInteraction(): Promise<ethers.Signer | null> {
        if (this.customSigner) return this.customSigner;
        if (this.browserProvider) return await this.browserProvider.getSigner();
        return null;
    }
}

