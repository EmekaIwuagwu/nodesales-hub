"use client";

import React, { useState, useEffect } from "react";
import "@rainbow-me/rainbowkit/styles.css";
import {
  RainbowKitProvider,
  darkTheme,
  connectorsForWallets,
  Wallet,
} from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { WagmiProvider, http, createConfig, createConnector } from "wagmi";
import { injected } from "wagmi/connectors";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { kortanaTestnet, kortanaMainnet } from "../lib/constants/chains";

const projectId = "YOUR_PROJECT_ID";

// ─── Kortana Provider Resolver ───────────────────────────────────────────────
// Same priority chain as BelloMundo's getProvider('kortana').
// Also polyfills addListener/removeListener — Wagmi v2 calls these internally
// but the Kortana extension only exposes addEventListener/on.
function resolveKortanaProvider(): any {
  if (typeof window === "undefined") return undefined;
  const w = window as any;

  const raw =
    w.kortana ||
    w.ethereum?.providers?.find(
      (p: any) => p.isKortana || p.isKortanaWallet || p.kortana
    ) ||
    (w.ethereum?.isKortana || w.ethereum?.isKortanaWallet
      ? w.ethereum
      : undefined);

  if (!raw) return undefined;

  if (!raw.addListener) raw.addListener = raw.on.bind(raw);
  if (!raw.removeListener) {
    raw.removeListener = raw.removeEventListener
      ? raw.removeEventListener.bind(raw)
      : raw.on.bind(raw);
  }

  return raw;
}

// ─── Custom Kortana Wallet for RainbowKit ────────────────────────────────────
// Replicates the BelloMundo auth handshake inside Wagmi's connector lifecycle:
//   1. eth_accounts (silent — reads current address, no popup)
//   2. eth_requestAccounts (only when wallet is locked — shows unlock popup)
//   3. personal_sign  ← ALWAYS opens the Kortana extension popup
//   4. base.connect() — finalises the Wagmi/RainbowKit connection state
//
// The Kortana extension's background.js calls openPopup() unconditionally for
// personal_sign, so step 3 is the explicit user-approval the user expects —
// identical to the BelloMundo WalletModal experience.
const kortanaWallet = (): Wallet => ({
  id: "kortana",
  name: "Kortana Wallet",
  iconUrl: "https://www.kortana.network/favicon.ico",
  iconBackground: "#050505",
  downloadUrls: {
    chrome:
      "https://chromewebstore.google.com/detail/kortana-wallet/efbbdbedokefmdafkkddahekohlimdep",
  },
  createConnector: (walletDetails) =>
    createConnector((config) => {
      const base = injected({
        target: () => ({
          id: "kortana",
          name: "Kortana Wallet",
          provider: resolveKortanaProvider(),
        }),
      })(config);

      return {
        ...base,
        // Spread RainbowKit metadata so the modal renders name/icon correctly
        ...(walletDetails as any),

        connect: async (params?: {
          chainId?: number;
          isReconnecting?: boolean;
        }) => {
          // On auto-reconnect (page refresh / session restore) skip the popup
          // and let Wagmi silently restore the existing session.
          if (params?.isReconnecting) {
            return base.connect(params);
          }

          const provider = (await base.getProvider()) as any;
          if (!provider) {
            throw new Error(
              "Kortana Wallet not found. Please install the extension."
            );
          }

          // Step 1 — silent address read (no popup at all)
          let accounts: string[] =
            (await provider
              .request({ method: "eth_accounts" })
              .catch(() => [])) ?? [];

          // Step 2 — if locked, eth_requestAccounts opens the unlock popup
          if (!accounts.length) {
            accounts = await provider.request({
              method: "eth_requestAccounts",
            });
          }

          const address = accounts[0];

          // Step 3 — personal_sign ALWAYS opens the Kortana extension popup.
          // The user must explicitly approve here before the DEX connection
          // completes — same behaviour as BelloMundo's WalletModal.
          const timestamp = Date.now();
          const message =
            `Kortana DEX\n\n` +
            `Sign to connect your wallet.\n` +
            `This does not cost gas or send any transaction.\n\n` +
            `Address: ${address}\n` +
            `Timestamp: ${timestamp}`;

          await provider.request({
            method: "personal_sign",
            params: [message, address],
          });

          // Step 4 — let Wagmi finish the connection handshake
          return base.connect(params);
        },
      };
    }),
});

const connectors = connectorsForWallets(
  [
    {
      groupName: "Kortana Ecosystem",
      wallets: [kortanaWallet],
    },
    {
      groupName: "Universal Wallets",
      wallets: [metaMaskWallet, rainbowWallet, walletConnectWallet],
    },
  ],
  {
    appName: "KORTANA EXCHANGE",
    projectId,
  }
);

const config = createConfig({
  connectors,
  chains: [kortanaTestnet, kortanaMainnet],
  transports: {
    [kortanaTestnet.id]: http(),
    [kortanaMainnet.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function KortanaProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
