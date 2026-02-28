"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Home, Car, Sparkles, ExternalLink, CheckCircle2, AlertTriangle, ArrowRight, Activity } from "lucide-react";
import Link from "next/link";

interface Transaction {
    _id: string;
    description: string;
    amountDNR: number;
    status: string;
    createdAt: string;
    txHash: string;
    paymentType: string;
}

export default function RecentTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/transactions")
            .then(res => res.json())
            .then(data => {
                if (data.transactions) setTransactions(data.transactions);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    const getIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'utility': return <Zap className="w-5 h-5 text-secondary-warm" />;
            case 'housing': return <Home className="w-5 h-5 text-primary-bright" />;
            case 'transport': return <Car className="text-success" />;
            default: return <Sparkles className="w-5 h-5 text-primary-bright" />;
        }
    };

    if (loading) return (
        <div className="p-20 text-center space-y-4">
            <Activity className="w-8 h-8 text-primary-bright animate-spin mx-auto" />
            <div className="text-[10px] text-white/20 uppercase tracking-[0.5em] font-black">Syncing Ledger...</div>
        </div>
    );

    return (
        <div className="flex flex-col">
            {transactions.length === 0 ? (
                <div className="p-32 text-center text-white/5 uppercase tracking-[1em] text-[10px] font-black">Registry Empty</div>
            ) : (
                <>
                    <div className="flex items-center justify-between px-10 py-6 text-[9px] text-white/20 uppercase tracking-[0.4em] font-black border-b border-white/5">
                        <span className="w-1/2">Operational Description</span>
                        <span className="w-1/4 text-center">Protocol</span>
                        <span className="w-1/4 text-right">Settlement</span>
                    </div>

                    {transactions.map((tx, idx) => (
                        <motion.div
                            key={tx._id}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-center justify-between px-10 py-6 hover:bg-white/[0.02] transition-all duration-500 border-b border-white/[0.03] group cursor-pointer"
                        >
                            <div className="flex items-center gap-6 w-1/2">
                                <div className="w-12 h-12 rounded-xl bg-neutral-obsidian flex items-center justify-center border border-white/5 group-hover:border-primary-bright/20 transition-all duration-700">
                                    {getIcon(tx.paymentType)}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h4 className="text-xs font-display font-black text-white uppercase tracking-tight group-hover:text-primary-bright transition-colors">{tx.description}</h4>
                                    <span className="text-[9px] text-white/20 font-black uppercase tracking-widest leading-none">
                                        {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center w-1/4">
                                <div className="px-4 py-1.5 rounded-full border border-success/20 bg-success/5 text-success text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle2 className="w-3 h-3" /> VERIFIED
                                </div>
                            </div>

                            <div className="w-1/4 text-right">
                                <span className="text-xl font-display font-black text-white tracking-tighter uppercase whitespace-nowrap">◈ {tx.amountDNR}</span>
                            </div>
                        </motion.div>
                    ))}
                </>
            )}

            <Link href="/dashboard/history" className="p-8 text-center text-[10px] text-white/20 uppercase tracking-[0.6em] font-black hover:text-white transition-all flex items-center justify-center gap-4 group">
                ACCESS HISTORICAL REGISTRY <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
        </div>
    );
}
