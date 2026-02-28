"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { defineChain } from "viem";
import { SessionProvider } from "next-auth/react";
import { metaMask, injected } from "wagmi/connectors";

const KORTANA_CHAIN_ID = Number(process.env.NEXT_PUBLIC_KORTANA_CHAIN_ID) || 72511;
const KORTANA_RPC_URL = process.env.NEXT_PUBLIC_KORTANA_RPC_URL || "https://poseidon-rpc.testnet.kortana.xyz/";

export const kortanaChain = defineChain({
    id: KORTANA_CHAIN_ID,
    name: "Kortana Testnet",
    nativeCurrency: {
        decimals: 18,
        name: "Dinar",
        symbol: "DNR",
    },
    rpcUrls: {
        default: { http: [KORTANA_RPC_URL] },
        public: { http: [KORTANA_RPC_URL] },
    },
    blockExplorers: {
        default: { name: "Kortana Explorer", url: process.env.NEXT_PUBLIC_KORTANA_EXPLORER || "https://explorer.testnet.kortana.xyz" },
    },
});

/**
 * Polyfills the Kortana Wallet provider to add 'addListener' and 'removeListener'
 * aliases. Wagmi's internal code calls these EventEmitter-style methods, but the
 * Kortana Wallet correctly implements the DOMEventTarget-style 'addEventListener'.
 */
function getKortanaProvider() {
    if (typeof window === 'undefined') return undefined;
    const provider = (window as any).kortana;
    if (!provider) return undefined;
    // Wagmi v3 calls provider.addListener / provider.removeListener internally.
    // Kortana Wallet exposes addEventListener / on. We alias them.
    if (!provider.addListener) {
        provider.addListener = provider.on.bind(provider);
    }
    if (!provider.removeListener) {
        provider.removeListener = provider.removeEventListener
            ? provider.removeEventListener.bind(provider)
            : provider.on.bind(provider);
    }
    return provider;
}

export const config = createConfig({
    chains: [kortanaChain],
    connectors: [
        metaMask(),
        // Native Kortana Wallet Connector
        injected({
            target: () => ({
                id: 'kortana',
                name: 'Kortana Wallet',
                provider: getKortanaProvider(),
            })
        }),
        // Generic Injected (for Core, Brave, etc.)
        injected(),
    ],
    transports: {
        [kortanaChain.id]: http(),
    },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <SessionProvider>
                    {children}
                </SessionProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
