import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { KORTANA_CHAIN_ID } from "../utils/contracts";
import { useStore } from "../store/useStore";

const API = import.meta.env.VITE_API_URL || "";

export function useWallet() {
  const {
    walletAddress, token, isAdmin,
    setWallet, setToken, logout,
    openWalletModal,
  } = useStore();

  const [chainOk,    setChainOk]    = useState(false);
  const [connecting, setConnecting] = useState(false); // kept for compat; modal tracks its own state

  // ── Chain guard ────────────────────────────────────────────────────────────
  const checkChain = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      setChainOk(parseInt(chainId, 16) === KORTANA_CHAIN_ID);
    } catch {}
  }, []);

  useEffect(() => {
    checkChain();

    const handleChainChange = () => checkChain();
    const handleAccountChange = (accounts) => {
      if (accounts.length === 0) logout();
      else setWallet(accounts[0]);
    };

    if (window.ethereum) {
      window.ethereum.on("chainChanged",    handleChainChange);
      window.ethereum.on("accountsChanged", handleAccountChange);
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("chainChanged",    handleChainChange);
        window.ethereum.removeListener("accountsChanged", handleAccountChange);
      }
    };
  }, [checkChain, logout, setWallet]);

  // ── connect — opens the wallet-selection modal ─────────────────────────────
  const connect = useCallback(() => {
    openWalletModal();
  }, [openWalletModal]);

  // ── disconnect ─────────────────────────────────────────────────────────────
  const disconnect = useCallback(async () => {
    try {
      if (token) {
        await axios.post(
          `${API}/api/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch {}
    logout();
  }, [token, logout]);

  return {
    walletAddress,
    token,
    isAdmin,
    chainOk,
    connecting,       // always false now; kept so callers don't break
    error: null,      // kept for compat
    isConnected: !!walletAddress && !!token,
    connect,
    disconnect,
  };
}
