"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Shield, X, ArrowRight, Zap, Loader2, Wallet } from "lucide-react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getAddress } from "viem";
import { setActiveWalletId } from "@/lib/walletProvider";

interface WalletModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// ─── Direct EIP-1193 Provider Resolver ───────────────────────────────────────
// We bypass Wagmi connectors entirely for auth to avoid all the addListener /
// connector-ID detection issues. We talk directly to the wallet provider.

function getProvider(walletId: string): any | null {
    if (typeof window === 'undefined') return null;
    const w = window as any;
    const providers: any[] = w.ethereum?.providers || [];

    if (walletId === 'kortana') {
        // Priority 1: Dedicated window.kortana injection point
        if (w.kortana) return w.kortana;

        // Priority 2: EIP-5164 providers[] array — Kortana flagged entries
        const k = providers.find((p: any) => p.isKortana || p.isKortanaWallet || p.kortana);
        if (k) return k;

        // Priority 3: window.ethereum itself is the Kortana wallet
        if (w.ethereum?.isKortana || w.ethereum?.isKortanaWallet) return w.ethereum;

        return null;
    }

    if (walletId === 'metamask') {
        // EIP-5164: some browsers expose window.ethereum.providers[] when
        // multiple wallets are installed. Find MetaMask specifically.
        if (providers.length) {
            const mm = providers.find((p: any) => p.isMetaMask && !p.isKortana && !p.isKortanaWallet);
            if (mm) return mm;
        }
        // Fallback: if only MetaMask is installed, window.ethereum IS MetaMask
        if (w.ethereum?.isMetaMask && !w.ethereum?.isKortana) return w.ethereum;
        return null;
    }

    // Generic injected (Brave, Core, etc.)
    return w.ethereum || null;
}

const WALLET_OPTIONS = [
    {
        id: "kortana",
        name: "Kortana Wallet",
        subtitle: "Native Kortana Network Wallet",
        icon: "kortana",
    },
    {
        id: "metamask",
        name: "MetaMask",
        subtitle: "Universal EVM Wallet",
        icon: "metamask",
    },
    {
        id: "injected",
        name: "Other Wallet",
        subtitle: "Any browser wallet",
        icon: "shield",
    },
];

const KORTANA_CHAIN_ID = Number(process.env.NEXT_PUBLIC_KORTANA_CHAIN_ID) || 72511;
const KORTANA_CHAIN_HEX = `0x${KORTANA_CHAIN_ID.toString(16)}`;

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
    const [connecting, setConnecting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleConnect = async (walletOption: typeof WALLET_OPTIONS[0]) => {
        setConnecting(walletOption.id);
        setError(null);

        try {
            // 1. Get the raw EIP-1193 wallet provider
            const provider = getProvider(walletOption.id);

            if (!provider) {
                setError(`${walletOption.name} not detected. Please install the extension.`);
                setConnecting(null);
                return;
            }

            // 2. Request accounts
            // For Kortana Wallet: use wallet_requestPermissions to ALWAYS trigger
            // the extension popup — even when the site was previously approved.
            // eth_requestAccounts alone silently returns without any popup if already trusted.
            let accounts: string[];
            if (walletOption.id === 'kortana') {
                try {
                    await provider.request({
                        method: 'wallet_requestPermissions',
                        params: [{ eth_accounts: {} }],
                    });
                    accounts = await provider.request({ method: 'eth_accounts' });
                } catch (permErr: any) {
                    // User rejected the popup
                    if (permErr?.code === 4001 || permErr?.message?.toLowerCase().includes('user rejected')) {
                        throw permErr;
                    }
                    // wallet_requestPermissions not supported — fall back gracefully
                    accounts = await provider.request({ method: 'eth_requestAccounts' });
                }
            } else {
                accounts = await provider.request({ method: 'eth_requestAccounts' });
            }

            if (!accounts || accounts.length === 0) {
                setError("NO ACCOUNT FOUND IN WALLET.");
                setConnecting(null);
                return;
            }

            const rawAddress = accounts[0];

            // 3. Switch / add Kortana network if not already on it
            try {
                await provider.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: KORTANA_CHAIN_HEX }],
                });
            } catch (switchErr: any) {
                // Chain not added yet — add it
                if (switchErr.code === 4902 || switchErr.code === -32603) {
                    await provider.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: KORTANA_CHAIN_HEX,
                            chainName: 'Kortana Testnet',
                            nativeCurrency: { name: 'Dinar', symbol: 'DNR', decimals: 18 },
                            rpcUrls: [process.env.NEXT_PUBLIC_KORTANA_RPC_URL || 'https://poseidon-rpc.testnet.kortana.xyz/'],
                            blockExplorerUrls: [process.env.NEXT_PUBLIC_KORTANA_EXPLORER || 'https://explorer.testnet.kortana.xyz'],
                        }],
                    });
                }
                // If the user rejected the switch, continue anyway — signature still works
            }

            // 4. Normalize address to EIP-55 checksum format
            const checksumAddress = getAddress(rawAddress);

            // 5. Build sign message
            const timestamp = Date.now();
            const message = `Welcome to BelloMundo.\n\nSign this message to authenticate your sovereign identity.\n\nAddress: ${checksumAddress}\nTimestamp: ${timestamp}`;

            // 6. Sign via personal_sign (raw EIP-1193, no Wagmi)
            // Pass the human-readable plaintext — wallets encode it internally.
            // viem.verifyMessage on the server side uses the same encoding.
            const signature: string = await provider.request({
                method: 'personal_sign',
                params: [message, rawAddress],
            });

            // 7. Authenticate with NextAuth
            const result = await signIn("credentials", {
                message,
                signature,
                address: checksumAddress,
                redirect: false,
                callbackUrl: "/dashboard",
            });

            if (result?.ok) {
                // Persist which wallet was used — transactions will use this same wallet
                setActiveWalletId(walletOption.id as 'kortana' | 'metamask' | 'injected');
                router.push("/dashboard");
                onClose();
            } else {
                setError("AUTHENTICATION FAILED. PLEASE TRY AGAIN.");
            }
        } catch (e: any) {
            console.error("Metropolis Authentication Failed:", e);
            const msg: string = e?.message || '';
            if (e?.code === 4001 || msg.includes("User rejected") || msg.includes("user rejected") || e?.name === 'UserRejectedRequestError') {
                setError("CONNECTION REJECTED: USER DENIED ACCESS.");
            } else {
                setError(msg || "AUTHENTICATION PROTOCOL INTERRUPTED.");
            }
        } finally {
            setConnecting(null);
        }
    };

    const WalletIcon = ({ type }: { type: string }) => {
        if (type === "metamask") return <Zap className="w-8 h-8" />;
        if (type === "kortana") return <Wallet className="w-8 h-8" />;
        return <Shield className="w-8 h-8" />;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-neutral-obsidian/80 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-xl luxury-glass border border-white/10 rounded-[4rem] overflow-hidden shadow-2xl p-12"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-12">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-primary-bright">
                                    <Shield className="w-5 h-5" />
                                    Auth Protocol
                                </div>
                                <h2 className="text-5xl font-display font-black text-white uppercase tracking-tight">
                                    IDENTITY <br />
                                    <span className="sexy-gradient-text">PORTAL.</span>
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-4 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Error Banner */}
                        <div className="grid gap-6">
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest text-center"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Wallet Buttons */}
                            {WALLET_OPTIONS.map((wallet) => {
                                const isConnecting = connecting === wallet.id;
                                const isOtherConnecting = connecting !== null && !isConnecting;
                                return (
                                    <button
                                        key={wallet.id}
                                        onClick={() => handleConnect(wallet)}
                                        disabled={connecting !== null}
                                        className={`sexy-card group !p-8 !bg-white/[0.02] flex items-center justify-between hover:!bg-white/[0.05] transition-all ${isOtherConnecting ? "opacity-20 cursor-wait" : ""} ${wallet.id === "kortana" ? "border border-primary-bright/20 hover:border-primary-bright/40" : ""}`}
                                    >
                                        <div className="flex items-center gap-8">
                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all group-hover:text-neutral-obsidian ${wallet.id === "kortana" ? "bg-primary-bright/10 border-primary-bright/30 text-primary-bright group-hover:bg-primary-bright" : "bg-white/5 border-white/10 text-white group-hover:bg-primary-bright"}`}>
                                                {isConnecting ? (
                                                    <Loader2 className="w-8 h-8 animate-spin" />
                                                ) : (
                                                    <WalletIcon type={wallet.icon} />
                                                )}
                                            </div>
                                            <div className="text-left">
                                                <div className="text-2xl text-white font-display font-black tracking-tight uppercase group-hover:text-primary-bright transition-colors">
                                                    {wallet.name.toUpperCase()}
                                                    {wallet.id === "kortana" && (
                                                        <span className="ml-3 text-[9px] text-primary-bright/60 font-black uppercase tracking-widest align-middle border border-primary-bright/30 px-2 py-0.5 rounded-full">
                                                            NATIVE
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[9px] text-white/30 font-black uppercase tracking-widest">
                                                    {isConnecting ? "SYNCING LEDGER..." : wallet.subtitle}
                                                </div>
                                            </div>
                                        </div>
                                        {isConnecting ? (
                                            <div className="text-primary-bright text-[10px] font-black uppercase tracking-[0.2em]">
                                                Authenticating
                                            </div>
                                        ) : (
                                            <ArrowRight className="w-6 h-6 text-white/10 group-hover:text-white group-hover:translate-x-2 transition-all" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="mt-12 text-center">
                            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest leading-loose">
                                By connecting, you authorize the metropolis synchronization <br />
                                protocol and accept the citizen charter.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
