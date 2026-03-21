"use client";

import { useState, useEffect } from "react";
import { useWalletStore } from "@/store/useWalletStore";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Globe } from "lucide-react";

interface PendingConnectRequest {
    address: string;
    status: "pending" | "approved" | "rejected";
    reqId: string;
}

export const ConnectRequest: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
    const [request, setRequest] = useState<PendingConnectRequest | null>(null);
    const [approving, setApproving] = useState(false);
    const { address } = useWalletStore();

    useEffect(() => {
        if (typeof chrome === "undefined" || !chrome.storage?.session) return;
        chrome.storage.session.get("pendingConnect", (data: any) => {
            if (data.pendingConnect?.status === "pending") {
                setRequest(data.pendingConnect);
            }
        });
    }, []);

    const handleApprove = async () => {
        if (!request) return;
        setApproving(true);
        await chrome.storage.session.set({
            pendingConnect: { ...request, status: "approved" },
        });
        window.close();
    };

    const handleReject = async () => {
        if (!request) {
            onDismiss();
            return;
        }
        await chrome.storage.session.set({
            pendingConnect: { ...request, status: "rejected" },
        });
        window.close();
    };

    if (!request) return null;

    const displayAddress = request.address
        ? `${request.address.slice(0, 6)}...${request.address.slice(-4)}`
        : address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : "—";

    return (
        <div className="grid place-items-center h-screen w-screen bg-deep-space overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] nebula-purple opacity-40" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] nebula-cyan opacity-30" />
                <div className="grainy-overlay" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="w-full max-w-sm glass-panel rounded-[2.5rem] p-6 space-y-5 relative z-10 border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]"
            >
                {/* Header */}
                <div className="flex flex-col items-center text-center space-y-1 pb-2">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden mb-2 bg-white/5 border border-white/10 p-2 shadow-inner">
                        <img src="/images/logo.png" alt="Kortana" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-xl font-black tracking-tighter text-white uppercase leading-none">
                        Connect Wallet
                    </h1>
                    <p className="text-cyan-400 text-[9px] uppercase tracking-[0.3em] font-bold">
                        Site Connection Request
                    </p>
                </div>

                {/* Info */}
                <div className="space-y-3">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 shadow-inner flex items-center gap-3">
                        <Globe size={14} className="text-cyan-400 shrink-0" />
                        <div>
                            <p className="text-[8px] text-gray-500 uppercase tracking-widest font-black mb-0.5">Requesting Access</p>
                            <p className="text-[10px] text-white font-mono opacity-80">A site is requesting access to your wallet</p>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 shadow-inner">
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest font-black mb-1">Account to Connect</p>
                        <p className="text-[11px] text-cyan-400 font-mono font-bold">{displayAddress}</p>
                    </div>

                    <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-3">
                        <p className="text-[9px] text-cyan-400/80 uppercase tracking-widest font-bold text-center">
                            This site will be able to see your address and request transactions. You can revoke access at any time.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                    <button
                        onClick={handleReject}
                        disabled={approving}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-[11px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all disabled:opacity-50"
                    >
                        <XCircle size={12} />
                        Reject
                    </button>
                    <button
                        onClick={handleApprove}
                        disabled={approving}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-cyan-400 text-black text-[11px] font-black uppercase tracking-widest hover:bg-cyan-300 transition-all disabled:opacity-50"
                    >
                        <CheckCircle2 size={12} />
                        {approving ? "Connecting..." : "Connect"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
