/**
 * Kortana DNRS — React Hook SDK
 * Powered by Ethers.js
 */
import { ethers } from 'ethers';
import { useState, useCallback } from 'react';
import { DNRS_ABI, BOARDROOM_ABI, NETWORKS } from './abi';

export function useDNRS(networkName = 'KORTANA_TESTNET') {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const network = NETWORKS[networkName] || NETWORKS.KORTANA_TESTNET;

  const getProvider = useCallback(() => {
    if (!window.ethereum) throw new Error("Metamask not found");
    return new ethers.BrowserProvider(window.ethereum);
  }, []);

  const getDNRSAddress = () => network.dnrs;
  const getBoardroomAddress = () => network.boardroom;

  // -- DNRS Actions --

  const getBalance = async (address) => {
    const provider = getProvider();
    const contract = new ethers.Contract(getDNRSAddress(), DNRS_ABI, provider);
    return await contract.balanceOf(address);
  };

  const transferDNRS = async (to, amount) => {
    setLoading(true);
    try {
      const provider = getProvider();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(getDNRSAddress(), DNRS_ABI, signer);
      const tx = await contract.transfer(to, ethers.parseUnits(amount.toString(), 18));
      return await tx.wait();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // -- Staking Actions --

  const stakeDNR = async (amount) => {
    setLoading(true);
    try {
      const provider = getProvider();
      const signer = await provider.getSigner();
      const boardroom = new ethers.Contract(getBoardroomAddress(), BOARDROOM_ABI, signer);
      
      const tx = await boardroom.stake(ethers.parseUnits(amount.toString(), 18));
      return await tx.wait();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const claimRewards = async () => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    const boardroom = new ethers.Contract(getBoardroomAddress(), BOARDROOM_ABI, signer);
    const tx = await boardroom.claimReward();
    return await tx.wait();
  };

  return {
    getBalance,
    transferDNRS,
    stakeDNR,
    claimRewards,
    loading,
    error,
    currentNetwork: network
  };
}
