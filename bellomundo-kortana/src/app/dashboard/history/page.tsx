"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Zap, Home, Car, Sparkles, Search, SlidersHorizontal,
    Download, ExternalLink, Activity, Filter, Calendar,
    ArrowUpRight, CheckCircle2, AlertTriangle, ChevronDown
} from "lucide-react";
import { formatUnits } from "viem";

interface Transaction {
    _id: string;
    description: string;
    amountDNR: number;
    status: string;
    createdAt: string;
    txHash: string;
    paymentType: string;
    recipient: string;
}

export default function HistoryPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch("/api/transactions")
            .then(res => res.json())
            .then(data => {
                if (data.transactions) setTransactions(data.transactions);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    const filteredTx = transactions.filter(tx => {
        const matchesFilter = filter === "ALL" || tx.paymentType.toUpperCase() === filter;
        const matchesSearch = tx.description.toLowerCase().includes(search.toLowerCase()) ||
            tx.txHash.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'utility': return <Zap className="w-5 h-5 text-secondary-warm" />;
            case 'housing': return <Home className="w-5 h-5 text-primary-bright" />;
            case 'transport': return <Car className="w-5 h-5 text-success" />;
            default: return <Sparkles className="w-5 h-5 text-primary-bright" />;
        }
    };

    return (
        <div className="flex flex-col gap-12 max-w-[1400px] mx-auto pb-40">
            {/* Header Module */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row lg:items-end justify-between gap-10"
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.6em] text-primary-bright">
                        <Activity className="w-4 h-4" />
                        Metropolis Block Explorer
                    </div>
                    <h1 className="text-7xl md:text-8xl font-display font-black text-white leading-none tracking-tighter uppercase">
                        ACTIVITY <span className="sexy-gradient-text">LEDGER.</span>
                    </h1>
                </div>

                <div className="flex gap-4">
                    <button className="btn-sexy min-w-[200px] !bg-white/[0.03] !border-white/10 hover:!border-white/20">
                        <Download className="w-4 h-4" /> Export Protocol
                    </button>
                </div>
            </motion.div>

            {/* Filter Hub */}
            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 relative w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 w-5 h-5" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="SEARCH PROTOCOLS, HASHES, OR DESCRIPTIONS..."
                        className="w-full bg-white/[0.02] border border-white/5 rounded-3xl py-6 pl-16 pr-8 text-[11px] font-black tracking-widest text-white placeholder:text-white/10 focus:outline-none focus:border-primary-bright/30 transition-all uppercase"
                    />
                </div>

                <div className="flex gap-4 p-2 bg-white/[0.02] border border-white/5 rounded-3xl">
                    {["ALL", "HOUSING", "TRANSPORT", "UTILITY"].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-8 py-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all ${filter === cat ? 'bg-primary-bright text-neutral-obsidian shadow-lg' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* The Ledger Grid */}
            <div className="sexy-card !p-0 overflow-hidden border-white/5">
                <div className="grid grid-cols-12 px-10 py-8 text-[9px] font-black text-white/20 uppercase tracking-[0.4em] border-b border-white/5">
                    <div className="col-span-5">Operation Details</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-2 text-center">Asset Class</div>
                    <div className="col-span-3 text-right">Settlement Value</div>
                </div>

                <div className="min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-40 gap-6">
                            <Activity className="w-12 h-12 text-primary-bright animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Syncing with Metropolis Node...</span>
                        </div>
                    ) : filteredTx.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-40 gap-6 text-white/5 font-black uppercase tracking-[1em] text-xs">
                            No matching protocols found
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filteredTx.map((tx, idx) => (
                                <motion.div
                                    layout
                                    key={tx._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                                    className="grid grid-cols-12 items-center px-10 py-10 hover:bg-white/[0.01] transition-all border-b border-white/[0.03] group cursor-pointer"
                                >
                                    <div className="col-span-5 flex items-center gap-8">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-neutral-obsidian border border-white/5 flex items-center justify-center text-white/40 group-hover:border-primary-bright/20 transition-all duration-700">
                                            {getIcon(tx.paymentType)}
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-[13px] font-display font-black text-white uppercase tracking-tight group-hover:text-primary-bright transition-colors">{tx.description}</h4>
                                            <div className="flex items-center gap-4 text-[9px] font-mono text-white/20 group-hover:text-white/40 transition-colors">
                                                <span>TX:{tx.txHash.slice(0, 12)}...</span>
                                                <div className="w-1 h-1 rounded-full bg-white/10" />
                                                <span>{new Date(tx.createdAt).toLocaleDateString().toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-2 flex justify-center">
                                        <div className="px-6 py-2 rounded-full border border-success/20 bg-success/5 text-success text-[9px] font-black uppercase tracking-widest flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> VERIFIED
                                        </div>
                                    </div>

                                    <div className="col-span-2 flex flex-col items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white">{tx.paymentType}</span>
                                        <span className="text-[8px] font-mono text-white/50">L2-SETTLEMENT</span>
                                    </div>

                                    <div className="col-span-3 text-right">
                                        <div className="text-3xl font-display font-black text-white tracking-tighter uppercase whitespace-nowrap">
                                            ◈ {tx.amountDNR.toLocaleString()}
                                            <span className="text-xs text-primary-bright/40 ml-2 tracking-widest">DNR</span>
                                        </div>
                                        <div className="text-[9px] text-white/20 font-black uppercase tracking-widest mt-1 group-hover:text-white/40 transition-colors">
                                            FINALITY ACHIEVED
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* Ledger Footer Status */}
                <div className="p-10 border-t border-white/5 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-success" />
                        Live Ledger Sync Active
                    </div>
                    <div>Page 1 of {Math.ceil(filteredTx.length / 10) || 1}</div>
                </div>
            </div>
        </div>
    );
}
