// src/hooks/useTransaction.ts
import { useState } from 'react';
import { WalletService } from '@services/wallet.service';
import { KeychainService } from '@services/keychain.service';
import { getProvider } from '@api/kortana';
import { useNetworkStore } from '@store/network.store';
import { useWalletStore } from '@store/wallet.store';
import { useTransactionStore } from '@store/transaction.store';
import { TransactionStatus } from '@app-types/transaction.types';

interface SendParams {
  to: string;
  amount: string;
  tokenSymbol?: string;
}

export const useTransaction = () => {
  const [isSending, setIsSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { networks, activeNetworkId } = useNetworkStore();
  const { accounts, activeAccountIndex } = useWalletStore();
  const { addTransaction } = useTransactionStore();

  const sendTransaction = async ({ to, amount, tokenSymbol }: SendParams): Promise<string | null> => {
    setIsSending(true);
    setError(null);
    setTxHash(null);

    try {
      const mnemonic = await KeychainService.getMnemonic();
      if (!mnemonic) throw new Error('Wallet credentials not found. Please re-import your wallet.');

      const network = networks.find(n => n.id === activeNetworkId);
      if (!network) throw new Error('Network configuration not found.');

      const wallet = WalletService.fromMnemonic(mnemonic, activeAccountIndex);
      const provider = getProvider(network.rpcUrl);
      const tx = await WalletService.sendTransaction(wallet.privateKey, to, amount, provider);

      // Save to transaction history
      addTransaction({
        hash: tx.hash,
        from: wallet.address,
        to: to,
        value: amount,
        symbol: tokenSymbol || network.symbol,
        timestamp: Date.now(),
        status: TransactionStatus.CONFIRMED, // In a real app, this might start as PENDING
        type: 'SENT'
      });

      setTxHash(tx.hash);
      return tx.hash;
    } catch (err: any) {
      const message = err?.message || 'An unknown error occurred.';
      setError(message);
      return null;
    } finally {
      setIsSending(false);
    }
  };

  return { sendTransaction, isSending, txHash, error };
};
