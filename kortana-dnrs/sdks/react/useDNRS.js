/**
 * Kortana DNRS — React Hook SDK
 * Powered by Ethers.js
 */
import { ethers } from 'ethers';
import { useState, useCallback } from 'react';
import { DNRS_ABI, BOARDROOM_ABI } from './abi';

// Testnet addresses from deployments.json
const DNRS_ADDRESS = "0xa1E9679c7AE524a09AbE34464A99d8D5daaEA92B";
const BOARDROOM_ADDRESS = "0x216E22FbBC3f891B38434bC92F3512B55Fd02C3f";

export function useDNRS() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getProvider = useCallback(() => {
    if (!window.ethereum) throw new Error("Metamask not found");
    return new ethers.BrowserProvider(window.ethereum);
  }, []);

  // -- DNRS Actions --

  const getBalance = async (address) => {
    const provider = getProvider();
    const contract = new ethers.Contract(DNRS_ADDRESS, DNRS_ABI, provider);
    return await contract.balanceOf(address);
  };

  const transferDNRS = async (to, amount) => {
    setLoading(true);
    try {
      const provider = getProvider();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(DNRS_ADDRESS, DNRS_ABI, signer);
      const tx = await contract.transfer(to, ethers.parseEther(amount.toString()));
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
      const boardroom = new ethers.Contract(BOARDROOM_ADDRESS, BOARDROOM_ABI, signer);
      
      const tx = await boardroom.stake(ethers.parseEther(amount.toString()));
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
    const boardroom = new ethers.Contract(BOARDROOM_ADDRESS, BOARDROOM_ABI, signer);
    const tx = await boardroom.claimReward();
    return await tx.wait();
  };

  return {
    getBalance,
    transferDNRS,
    stakeDNR,
    claimRewards,
    loading,
    error
  };
}
