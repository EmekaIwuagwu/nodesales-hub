// src/services/wallet.service.ts
import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import { HDKey } from 'hdkey';
import { Buffer } from 'buffer';

export class WalletService {
  // Generate new HD wallet mnemonic
  static generateMnemonic(wordCount: 12 | 24 = 12): string {
    const strength = wordCount === 12 ? 128 : 256;
    return bip39.generateMnemonic(strength);
  }

  // Validate mnemonic
  static validateMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic);
  }

  // Derive wallet from mnemonic
  static fromMnemonic(mnemonic: string, index: number = 0): ethers.HDNodeWallet {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const hdkey = HDKey.fromMasterSeed(Buffer.from(seed));
    const path = `m/44'/60'/0'/0/${index}`;
    const childKey = hdkey.derive(path);
    const privateKey = childKey.privateKey.toString('hex');
    return new ethers.Wallet(privateKey) as unknown as ethers.HDNodeWallet;
  }

  // Import from private key
  static fromPrivateKey(privateKey: string): ethers.Wallet {
    if (!privateKey.startsWith('0x')) {
      privateKey = '0x' + privateKey;
    }
    return new ethers.Wallet(privateKey);
  }

  // Get native balance
  static async getNativeBalance(address: string, provider: ethers.JsonRpcProvider): Promise<string> {
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  // Get ERC-20 token balance
  static async getTokenBalance(
    tokenAddress: string,
    walletAddress: string,
    provider: ethers.JsonRpcProvider
  ): Promise<string> {
    const abi = ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'];
    const contract = new ethers.Contract(tokenAddress, abi, provider);
    const [balance, decimals] = await Promise.all([
      contract.balanceOf(walletAddress),
      contract.decimals(),
    ]);
    return ethers.formatUnits(balance, decimals);
  }
  // Send native transaction
  static async sendTransaction(
    privateKey: string,
    to: string,
    amount: string,
    provider: ethers.JsonRpcProvider
  ): Promise<ethers.TransactionResponse> {
    const wallet = new ethers.Wallet(privateKey, provider);
    const tx = {
      to,
      value: ethers.parseEther(amount),
    };
    return await wallet.sendTransaction(tx);
  }
}
