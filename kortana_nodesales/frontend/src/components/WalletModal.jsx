/**
 * WalletModal — wallet-selection + SIWE auth flow
 *
 * Detects Kortana Wallet, MetaMask, and generic injected providers using the
 * same multi-provider resolution strategy as bellomundo-kortana/WalletModal.tsx.
 * Stores auth JWT in Zustand (persisted via useStore).
 */

import { useState } from "react";
import { ethers }   from "ethers";
import axios from "axios";
import { KORTANA_NETWORK } from "../utils/contracts";
import { useStore, setActiveProvider } from "../store/useStore";

const API = import.meta.env.VITE_API_URL || "";

// ─── Provider detection (EIP-5164 aware) ─────────────────────────────────────
// When multiple extensions are installed, browsers expose window.ethereum.providers[].
// We resolve the correct one per wallet type.

function detectProvider(walletId) {
  if (typeof window === "undefined") return null;
  const w         = window;
  const providers = w.ethereum?.providers ?? [];

  if (walletId === "kortana") {
    // 1. Dedicated injection point (Kortana browser / mobile)
    if (w.kortana) return w.kortana;
    // 2. providers[] array — Kortana-flagged entry
    const k = providers.find(p => p.isKortana || p.isKortanaWallet || p.kortana);
    if (k) return k;
    // 3. window.ethereum itself is the Kortana wallet
    if (w.ethereum?.isKortana || w.ethereum?.isKortanaWallet) return w.ethereum;
    return null;
  }

  if (walletId === "metamask") {
    // providers[] first — MetaMask but NOT Kortana
    if (providers.length) {
      const mm = providers.find(p => p.isMetaMask && !p.isKortana && !p.isKortanaWallet);
      if (mm) return mm;
    }
    // Single-wallet fallback
    if (w.ethereum?.isMetaMask && !w.ethereum?.isKortana) return w.ethereum;
    return null;
  }

  // "injected" — whatever is available
  return w.ethereum ?? null;
}

// ─── Wallet options ───────────────────────────────────────────────────────────

const WALLETS = [
  {
    id:       "kortana",
    name:     "Kortana Wallet",
    subtitle: "Native Kortana Network Wallet",
    emoji:    "⬡",
    native:   true,
  },
  {
    id:       "metamask",
    name:     "MetaMask",
    subtitle: "Universal EVM Wallet",
    emoji:    "🦊",
    native:   false,
  },
  {
    id:       "injected",
    name:     "Other Wallet",
    subtitle: "Any browser-injected wallet",
    emoji:    "💼",
    native:   false,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function WalletModal({ isOpen, onClose }) {
  const { setWallet, setToken } = useStore();
  const [connecting, setConnecting] = useState(null); // walletId being connected
  const [error,      setError]      = useState(null);
  const [hint,       setHint]       = useState(null);

  if (!isOpen) return null;

  async function handleConnect(wallet) {
    setConnecting(wallet.id);
    setError(null);
    setHint(null);

    try {
      // 1 — Resolve the raw EIP-1193 provider
      const raw = detectProvider(wallet.id);

      // Store this specific provider so getProvider() uses it everywhere,
      // avoiding the broken composite window.ethereum wrapper.
      if (raw) setActiveProvider(raw);

      if (!raw) {
        setError(
          wallet.id === "kortana"
            ? "Kortana Wallet not detected. Download it from kortana.xyz."
            : wallet.id === "metamask"
            ? "MetaMask not detected. Install the MetaMask extension."
            : "No browser wallet detected. Please install a Web3 wallet."
        );
        setConnecting(null);
        return;
      }

      // 2 — Get accounts
      // Kortana Wallet: eth_accounts (silent) then eth_requestAccounts only if locked.
      // MetaMask / others: eth_requestAccounts shows the normal connect popup.
      let accounts;
      if (wallet.id === "kortana") {
        accounts = await raw.request({ method: "eth_accounts" });
        if (!accounts?.length) {
          accounts = await raw.request({ method: "eth_requestAccounts" });
        }
        setHint("Check your Kortana Wallet — approve the sign request in the extension popup");
      } else {
        accounts = await raw.request({ method: "eth_requestAccounts" });
      }

      if (!accounts?.length) {
        setError("No accounts found in wallet. Make sure it is unlocked.");
        setConnecting(null);
        return;
      }

      const address = accounts[0].toLowerCase();
      setWallet(address);

      // 3 — Switch / add Kortana network
      // Kortana Wallet manages its own network internally — skip for it.
      if (wallet.id !== "kortana") {
        try {
          await raw.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: KORTANA_NETWORK.chainId }],
          });
        } catch (switchErr) {
          // Chain not added yet (EIP-3085)
          if (switchErr.code === 4902 || switchErr.code === -32603) {
            await raw.request({
              method: "wallet_addEthereumChain",
              params: [KORTANA_NETWORK],
            });
          }
          // If user rejected the switch, continue — signing still works on the wrong chain
          // (auth only; purchases will validate chain separately)
        }
      }

      // 4 — Get nonce (no address needed — identity comes from signature)
      const nonceRes = await axios.post(`${API}/api/auth/nonce`);
      const nonce    = nonceRes.data.nonce;

      // 5 — Build a clear, human-readable sign message
      //     We include the address from eth_accounts as a display hint only.
      //     The backend derives the true wallet address from the signature itself.
      const issuedAt = new Date().toISOString();
      const message = [
        "Sign in to Kortana Node Sale",
        "",
        `URI: ${window.location.origin}`,
        `Nonce: ${nonce}`,
        `Issued At: ${issuedAt}`,
      ].join("\n");

      // 6 — Sign with personal_sign on the raw provider.
      //     Passing address as params[1] is a hint for the wallet UI only.
      const signature = await raw.request({
        method: "personal_sign",
        params: [message, address],
      });

      // 7 — Recover the TRUE signing address client-side so we can update
      //     wallet state with the correct address (not just what eth_accounts claimed).
      const trueAddress = ethers.verifyMessage(message, signature).toLowerCase();
      setWallet(trueAddress);

      // 8 — Verify with backend → recover address there too → issue JWT
      const verifyRes = await axios.post(`${API}/api/auth/verify`, { message, signature });
      setToken(verifyRes.data.token, verifyRes.data.isAdmin);

      setHint(null);
      onClose();

    } catch (err) {
      setHint(null);
      const msg = err?.message ?? "";
      if (
        err?.code === 4001 ||
        msg.toLowerCase().includes("user rejected") ||
        msg.toLowerCase().includes("user denied") ||
        err?.name === "UserRejectedRequestError"
      ) {
        setError("Connection rejected — you denied the request.");
      } else if (err?.response?.data?.error) {
        const serverErr = err.response.data.error;
        setError(typeof serverErr === "string" ? serverErr : "Server error. Please try again.");
      } else {
        setError(msg || "Connection failed. Please try again.");
      }
    } finally {
      setConnecting(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative w-full max-w-md bg-kortana-800 border border-kortana-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-kortana-700">
          <div>
            <h2 className="text-xl font-bold">Connect Wallet</h2>
            <p className="text-sm text-gray-400 mt-1">
              Choose your wallet to sign in securely
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-kortana-700 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Error banner */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Hint banner (Kortana Wallet extension pop-up reminder) */}
          {hint && !error && (
            <div className="p-3 rounded-lg bg-kortana-accent/10 border border-kortana-accent/20 text-kortana-accent text-sm">
              {hint}
            </div>
          )}

          {/* Wallet buttons */}
          {WALLETS.map((wallet) => {
            const isConnecting      = connecting === wallet.id;
            const isOtherConnecting = connecting !== null && !isConnecting;

            return (
              <button
                key={wallet.id}
                onClick={() => handleConnect(wallet)}
                disabled={connecting !== null}
                className={[
                  "w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all",
                  wallet.native
                    ? "border-kortana-accent/40 hover:border-kortana-accent hover:bg-kortana-accent/5"
                    : "border-kortana-700 hover:border-kortana-600 hover:bg-kortana-700/40",
                  isOtherConnecting ? "opacity-30 cursor-not-allowed" : "cursor-pointer",
                ].join(" ")}
              >
                {/* Icon */}
                <div
                  className={[
                    "w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0",
                    wallet.native ? "bg-kortana-accent/10" : "bg-kortana-900",
                  ].join(" ")}
                >
                  {isConnecting
                    ? <span className="text-base animate-spin inline-block">⟳</span>
                    : wallet.emoji}
                </div>

                {/* Labels */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold flex items-center gap-2 flex-wrap">
                    {wallet.name}
                    {wallet.native && (
                      <span className="text-xs text-kortana-accent border border-kortana-accent/30 px-1.5 py-0.5 rounded-full leading-none">
                        Native
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 mt-0.5">
                    {isConnecting ? "Connecting…" : wallet.subtitle}
                  </div>
                </div>

                {/* Arrow */}
                <span className="text-gray-600 flex-shrink-0 text-lg">→</span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 pb-5">
          By connecting you agree to the{" "}
          <a
            href="https://kortana.xyz/legal"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-gray-400"
          >
            Terms of Service
          </a>
        </p>
      </div>
    </div>
  );
}
