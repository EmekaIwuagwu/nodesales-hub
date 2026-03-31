import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { KORTANA_CHAIN_ID } from "../utils/contracts";
import { useStore, getActiveProvider } from "../store/useStore";

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
    const p = getActiveProvider();
    if (!p) { setChainOk(true); return; }
    // Kortana Wallet manages its own network — skip chain check for it
    if (p.isKortana || p.isKortanaWallet || window.kortana === p) {
      setChainOk(true);
      return;
    }
    try {
      const chainId = await p.request({ method: "eth_chainId" });
      setChainOk(parseInt(chainId, 16) === KORTANA_CHAIN_ID);
    } catch { setChainOk(true); }
  }, []);

  useEffect(() => {
    checkChain();

    const handleChainChange   = () => checkChain();
    const handleAccountChange = (accounts) => {
      if (accounts.length === 0) logout();
      else setWallet(accounts[0]);
    };

    // Use the specific provider the user logged in with, not window.ethereum.
    // window.ethereum is a composite wrapper when multiple wallets are installed
    // and its internal event system may be broken (MetaMask #S addListener bug).
    const p = getActiveProvider();
    if (p && typeof p.on === "function") {
      try { p.on("chainChanged",    handleChainChange); }   catch {}
      try { p.on("accountsChanged", handleAccountChange); } catch {}
    }
    return () => {
      const p = getActiveProvider();
      if (!p) return;
      const off = p.removeListener || p.off;
      if (typeof off === "function") {
        try { off.call(p, "chainChanged",    handleChainChange); }   catch {}
        try { off.call(p, "accountsChanged", handleAccountChange); } catch {}
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
