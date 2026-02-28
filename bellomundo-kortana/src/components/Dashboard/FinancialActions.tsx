"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Plus, Loader2, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TransferModal({ isOpen, onClose }: ModalProps) {
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [txError, setTxError] = useState<string | null>(null);
    const [txStatus, setTxStatus] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleTransfer = async () => {
        if (!recipient || !amount) return;
        setIsPending(true);
        setTxError(null);
        setTxStatus('Connecting to wallet...');

        try {
            setTxStatus('Waiting for wallet approval...');
            // Need to import executeSettlement from @/lib/walletProvider at top level
            // but we can assume it's imported (will add to imports if missing)
            const { executeSettlement } = await import("@/lib/walletProvider");

            const { txHash } = await executeSettlement({
                to: recipient,
                valueEther: amount,
                paymentType: 'transfer',
                description: `P2P Transfer to ${recipient.slice(0, 6)}...`,
                serviceType: 'TRANSFER',
                amount: amount,
            });

            setTxStatus('Recording on ledger...');

            await fetch("/api/transactions", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    txHash,
                    paymentType: "transfer",
                    recipient,
                    amount: amount,
                    amountDNR: parseFloat(amount),
                    description: `Transfer to ${recipient.slice(0, 6)}...`,
                    serviceType: 'TRANSFER',
                }),
            });

            setTxStatus('Protocol Successful.');
            setIsSuccess(true);

            setTimeout(() => {
                onClose();
                // Reset state for next open
                setTimeout(() => {
                    setIsSuccess(false);
                    setRecipient("");
                    setAmount("");
                    setTxStatus(null);
                }, 500);
            }, 1500);

        } catch (e: any) {
            console.error('[Transfer] Failed:', e);
            const code = e?.code;
            const msg: string = e?.message || '';
            if (code === 4001 || msg.toLowerCase().includes('rejected') || msg.toLowerCase().includes('denied')) {
                setTxError('Transaction rejected. Please approve in your wallet.');
            } else {
                setTxError(msg || 'Transfer failed. Check address and balance.');
            }
        } finally {
            setIsPending(false);
            if (!isSuccess) {
                setTxStatus(null);
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 pointer-events-auto">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-neutral-obsidian/90 backdrop-blur-xl" />

                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg luxury-glass p-12 rounded-[3rem] border border-white/10 z-10 pointer-events-auto">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter">Transfer <span className="sexy-gradient-text">Assets.</span></h2>
                            <button onClick={onClose} className="p-3 rounded-full hover:bg-white/5 text-white/40"><X className="w-6 h-6" /></button>
                        </div>

                        {isSuccess ? (
                            <div className="flex flex-col items-center gap-4 py-8 text-success font-black uppercase tracking-[0.4em] text-xs">
                                <CheckCircle2 className="w-16 h-16" />
                                Protocol Successful
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-white/40">Recipient Address</label>
                                    <input
                                        type="text"
                                        value={recipient}
                                        onChange={(e) => setRecipient(e.target.value)}
                                        placeholder="0x..."
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-white font-mono text-sm focus:outline-none focus:border-primary-bright/40 relative z-20 pointer-events-auto"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-white/40">Amount (DNR)</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-white font-display font-black text-2xl focus:outline-none focus:border-primary-bright/40 relative z-20 pointer-events-auto"
                                    />
                                </div>

                                <AnimatePresence>
                                    {txStatus && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-primary-bright font-black uppercase tracking-widest pt-2">
                                            {txStatus}
                                        </motion.div>
                                    )}
                                    {txError && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-error/10 border border-error/20 flex items-center gap-3 text-error text-xs font-black uppercase tracking-widest">
                                            <AlertCircle className="w-4 h-4" /> {txError}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    type="button"
                                    onClick={handleTransfer}
                                    disabled={isPending}
                                    style={{ position: 'relative', zIndex: 10, pointerEvents: 'all' }}
                                    className="btn-sexy w-full flex items-center justify-center gap-4 group"
                                >
                                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authorize Transfer"}
                                    {!isPending && <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export function MintDNRModal({ isOpen, onClose }: ModalProps) {
    // For MVP, "Minting" can be a simulated faucet call or a specific treasury request
    const [isMinting, setIsMinting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleMint = async () => {
        setIsMinting(true);
        // Simulate treasury verification
        await new Promise(r => setTimeout(r, 2000));
        setSuccess(true);
        setIsMinting(false);
        setTimeout(onClose, 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-neutral-obsidian/90 backdrop-blur-xl" />
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg luxury-glass p-12 rounded-[3rem] border border-white/10 text-center">
                        <div className="w-24 h-24 bg-secondary-warm/10 rounded-[2rem] flex items-center justify-center text-secondary-warm mx-auto mb-8 border border-secondary-warm/20">
                            <Plus className="w-12 h-12" />
                        </div>
                        <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter mb-4">Mint <span className="sexy-gradient-text">Dinar.</span></h2>
                        <p className="text-neutral-dim text-sm font-medium mb-12">Authorized citizens can request a foundational DNR stipend from the city treasury once per cycle.</p>

                        {success ? (
                            <div className="flex flex-col items-center gap-4 text-success">
                                <CheckCircle2 className="w-16 h-16" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Stipend Distributed</span>
                            </div>
                        ) : (
                            <button
                                onClick={handleMint}
                                disabled={isMinting}
                                className="btn-sexy-gold w-full"
                            >
                                {isMinting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Request 1,000 DNR Stipend"}
                            </button>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
