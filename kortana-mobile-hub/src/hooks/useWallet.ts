import { useState, useCallback, useEffect } from 'react';
import { useWalletStore } from '../store/walletStore';
import { useNetworkStore } from '../store/networkStore';
import { createNetworkService } from '../services/network';
import { ethers } from 'ethers';

export const useWallet = () => {
    const { accounts, activeAccountIndex } = useWalletStore();
    const { activeNetwork } = useNetworkStore();
    const [balance, setBalance] = useState('0.00');
    const [loading, setLoading] = useState(false);

    const activeAccount = accounts[activeAccountIndex] || null;
    const address = activeAccount?.address || '';

    const fetchBalance = useCallback(async () => {
        if (!address) return;
        setLoading(true);
        try {
            const service = createNetworkService(activeNetwork);
            const bal = await service.getBalance(address);
            setBalance(Number(bal).toFixed(4));
        } catch (error) {
            console.error('Failed to fetch balance', error);
        } finally {
            setLoading(false);
        }
    }, [address, activeNetwork]);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    return {
        address,
        balance,
        loading,
        refresh: fetchBalance,
        activeNetwork,
    };
};
