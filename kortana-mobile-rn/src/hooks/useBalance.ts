// src/hooks/useBalance.ts
import { useState, useEffect } from 'react';
import { WalletService } from '@services/wallet.service';
import { getProvider } from '@api/kortana';
import { useWalletStore } from '@store/wallet.store';
import { useNetworkStore } from '@store/network.store';

export const useBalance = () => {
  const [balance, setBalance] = useState('0.00');
  const [isLoading, setIsLoading] = useState(false);
  const { accounts, activeAccountIndex } = useWalletStore();
  const { networks, activeNetworkId } = useNetworkStore();

  const activeAccount = accounts[activeAccountIndex];
  const activeNetwork = networks.find(n => n.id === activeNetworkId);

  const fetchBalance = async () => {
    if (!activeAccount || !activeNetwork) return;
    
    setIsLoading(true);
    try {
      const provider = getProvider(activeNetwork.rpcUrl);
      const b = await WalletService.getNativeBalance(activeAccount.address, provider);
      setBalance(Number(b).toFixed(4));
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    // Refresh every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [activeAccount?.address, activeNetwork?.id]);

  return { balance, isLoading, refresh: fetchBalance };
};
