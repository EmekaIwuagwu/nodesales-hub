"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShoppingCart, TrendingUp, ArrowUpRight,
    Filter, Search, ArrowRight, ShieldCheck,
    Zap, Building2, Layers, Briefcase, CheckCircle2,
    X, Wallet
} from "lucide-react";

interface MarketAsset {
    id: string;
    title: string;
    type: string;
    price: string;
    yield: string;
    liquidity: string;
    progress: number;
    image: string;
    sector: string;
    totalShares: string;
}

const marketAssets: MarketAsset[] = [
    {
        id: "STO-001",
        title: "Aetheria Sky-Suite Shares",
        type: "Fractional Real Estate",
        price: "4.2",
        yield: "+12.4%",
        liquidity: "High",
        progress: 85,
        image: "/luxury_penthouse_interior.png",
        sector: "Sector 7",
        totalShares: "1,000"
    },
    {
        id: "STO-002",
        title: "Autonomous Fleet Node 4",
        type: "Mobility Equity",
        price: "1.8",
        yield: "+8.9%",
        liquidity: "Medium",
        progress: 42,
        image: "https://images.unsplash.com/photo-1549890762-0a3f8933bc76?auto=format&fit=crop&w=800&q=80",
        sector: "Transit Core",
        totalShares: "5,000"
    },
    {
        id: "STO-003",
        title: "Solaris Energy Grid Bond",
        type: "Utility Infrastructure",
        price: "12.5",
        yield: "+5.2%",
        liquidity: "Instant",
        progress: 100,
        image: "https://images.unsplash.com/photo-1509391366360-fe5bb6583e2c?auto=format&fit=crop&w=800&q=80",
        sector: "Sector 4",
        totalShares: "10,000"
    }
];

export default function MarketplacePage() {
    const [filter, setFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [selectedAsset, setSelectedAsset] = useState<MarketAsset | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'confirming' | 'success'>('idle');

    const handleAcquireClick = (asset: MarketAsset) => {
        setSelectedAsset(asset);
        setPaymentStatus('idle');
    };

    const handlePay = () => {
        setPaymentStatus('confirming');
        // Simulate wallet opening and transaction process
        setTimeout(() => {
            setPaymentStatus('success');
        }, 3000); // 3 seconds delay
    };

    return (
        <div className="flex flex-col gap-16 max-w-[1600px] mx-auto pb-40 relative">
            
            {/* Payment Modal */}
            <AnimatePresence>
                {selectedAsset && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                        >
                            <div className="p-6 border-b border-white/10 flex items-center justify-between relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-bright/20 to-transparent opacity-20"></div>
                                <h3 className="text-xl text-white font-display font-black tracking-widest uppercase z-10">
                                    {paymentStatus === 'success' ? 'TRANSACTION COMPLETE' : 'ASSET ACQUISITION'}
                                </h3>
                                {(paymentStatus === 'idle' || paymentStatus === 'success') && (
                                    <button onClick={() => setSelectedAsset(null)} className="text-white/50 hover:text-white transition-colors z-10">
                                        <X className="w-6 h-6" />
                                    </button>
                                )}
                            </div>

                            <div className="p-8 space-y-8 relative">
                                {paymentStatus === 'idle' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <img src={selectedAsset.image} alt={selectedAsset.title} className="w-20 h-20 rounded-xl object-cover" />
                                            <div>
                                                <div className="text-[10px] text-primary-bright font-black uppercase tracking-widest">{selectedAsset.type}</div>
                                                <div className="text-xl text-white font-display font-black uppercase">{selectedAsset.title}</div>
                                                <div className="text-sm text-white/50">{selectedAsset.sector}</div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-white/5 rounded-2xl p-6 space-y-4">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-white/50 uppercase tracking-widest font-black">Price</span>
                                                <span className="text-white font-mono font-bold">◈ {selectedAsset.price} DNR</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-white/50 uppercase tracking-widest font-black">Network Fee</span>
                                                <span className="text-white font-mono font-bold">◈ 0.005 DNR</span>
                                            </div>
                                            <div className="h-[1px] bg-white/10"></div>
                                            <div className="flex justify-between items-center text-lg">
                                                <span className="text-white uppercase tracking-widest font-black">Total</span>
                                                <span className="text-primary-bright font-mono font-black">◈ {(parseFloat(selectedAsset.price) + 0.005).toFixed(3)} DNR</span>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={handlePay}
                                            className="w-full py-5 rounded-2xl bg-primary-bright text-neutral-obsidian text-[12px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(56,189,248,0.3)]"
                                        >
                                            <Wallet className="w-5 h-5" /> AUTHORIZE PAYMENT
                                        </button>
                                    </motion.div>
                                )}

                                {paymentStatus === 'confirming' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
                                        <div className="w-24 h-24 relative flex items-center justify-center">
                                            <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
                                            <div className="absolute inset-0 rounded-full border-4 border-primary-bright border-t-transparent animate-spin"></div>
                                            <Wallet className="w-8 h-8 text-primary-bright animate-pulse" />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-white font-display font-black tracking-widest uppercase text-xl">Awaiting Wallet Signature</h4>
                                            <p className="text-white/50 text-sm">Please confirm the transaction in your wallet provider...</p>
                                        </div>
                                    </motion.div>
                                )}

                                {paymentStatus === 'success' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-6 space-y-6 text-center">
                                        <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center">
                                            <CheckCircle2 className="w-12 h-12 text-success" />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-white font-display font-black tracking-widest uppercase text-2xl">Acquisition Successful</h4>
                                            <p className="text-white/50 text-sm">You have successfully acquired {selectedAsset.title} equity.</p>
                                        </div>

                                        <div className="bg-white/5 rounded-2xl w-full p-4 mt-4 space-y-2 text-left">
                                            <div className="text-[10px] text-white/50 font-black uppercase tracking-widest">Transaction Hash</div>
                                            <div className="text-xs text-primary-bright font-mono break-all">0x7d9...a8f4b2e9c1d0f5e7a9b3c6d2e4f8a1b0c9d5e7f3</div>
                                        </div>

                                        <button 
                                            onClick={() => setSelectedAsset(null)}
                                            className="w-full py-4 mt-6 rounded-2xl bg-white/10 text-white hover:bg-white hover:text-neutral-obsidian text-[11px] font-black uppercase tracking-[0.2em] transition-all"
                                        >
                                            RETURN TO DASHBOARD
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Header Section */}
            <div className="flex flex-col xl:flex-row items-end justify-between gap-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.6em] text-primary-bright">
                        <ShoppingCart className="w-4 h-4" />
                        Urban Equity Exchange
                    </div>
                    <h1 className="text-7xl md:text-9xl text-white font-display font-black leading-[0.8] tracking-tight uppercase">
                        TRADING <br />
                        <span className="sexy-gradient-text">FLOOR.</span>
                    </h1>
                </motion.div>

                <div className="flex gap-4">
                    <div className="sexy-card !bg-white/[0.02] !p-6 flex flex-col items-end">
                        <span className="text-[9px] text-white/20 font-black uppercase tracking-widest mb-1">Market Volume (24h)</span>
                        <div className="text-2xl text-white font-display font-black tracking-tight uppercase">◈ 1.2M DNR</div>
                    </div>
                    <div className="sexy-card !bg-primary-bright/5 !p-6 border-primary-bright/20 flex flex-col items-end">
                        <span className="text-[9px] text-primary-bright/60 font-black uppercase tracking-widest mb-1">Index Growth</span>
                        <div className="text-2xl text-success font-display font-black tracking-tight uppercase">+4.82%</div>
                    </div>
                </div>
            </div>

            {/* Trading Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                    <div className="sexy-card flex items-center gap-8 !p-4 !bg-white/[0.01] border-white/5">
                        <div className="relative flex-1">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="SEARCH ASSET TICKER OR SECTOR..."
                                className="w-full bg-transparent py-5 pl-16 pr-8 text-[11px] font-black tracking-widest text-white placeholder:text-white/10 focus:outline-none uppercase"
                            />
                        </div>
                        <div className="h-10 w-[1px] bg-white/10 hidden md:block" />
                        <div className="flex items-center gap-4 px-4 overflow-x-auto no-scrollbar">
                            {["ALL", "REAL ESTATE", "MOBILITY", "INFRA"].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setFilter(t)}
                                    className={`px-6 py-2 rounded-full text-[9px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${filter === t ? 'bg-primary-bright text-neutral-obsidian' : 'bg-white/5 text-white/30 hover:text-white'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-4">
                    <button className="w-full h-full py-5 rounded-[2rem] bg-white text-neutral-obsidian text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-neutral-200 transition-all">
                        <Layers className="w-4 h-4" /> Portfolio Liquidation
                    </button>
                </div>
            </div>

            {/* Asset Board */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {marketAssets.map((asset, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="sexy-card !p-0 overflow-hidden border-white/5 group"
                    >
                        <div className="relative h-64 overflow-hidden">
                            <img src={asset.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-obsidian flex flex-col justify-end p-8">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <span className="text-[9px] text-primary-bright font-black uppercase tracking-widest">{asset.type}</span>
                                        <h3 className="text-2xl text-white font-display font-black tracking-tight uppercase">{asset.title}</h3>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl text-success font-display font-black tracking-tight">{asset.yield}</div>
                                        <div className="text-[8px] text-white/30 font-black uppercase tracking-widest">ANNUALIZED</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <span className="text-[9px] text-white/20 font-black uppercase tracking-widest block">Entry Price</span>
                                    <span className="text-lg text-white font-display font-black uppercase">◈ {asset.price} DNR</span>
                                </div>
                                <div className="space-y-1 text-right">
                                    <span className="text-[9px] text-white/20 font-black uppercase tracking-widest block">Market Cap</span>
                                    <span className="text-lg text-white font-display font-black uppercase">◈ {parseInt(asset.price) * parseInt(asset.totalShares.replace(',', '')) / 1000}K</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                    <span className="text-white/20">Ownership Subscription</span>
                                    <span className="text-primary-bright">{asset.progress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${asset.progress}%` }}
                                        className="h-full bg-primary-bright"
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={() => handleAcquireClick(asset)}
                                className="w-full py-5 rounded-2xl bg-white/[0.03] border border-white/5 text-white hover:bg-white hover:text-neutral-obsidian text-[10px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 group"
                            >
                                ACQUIRE EQUITY <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Analytics Sidebar Concept */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4">
                    <div className="sexy-card !bg-white/[0.01] border-white/5 p-10 space-y-8">
                        <div className="flex items-center gap-4">
                            <TrendingUp className="text-success w-6 h-6" />
                            <h4 className="text-white font-display font-black uppercase tracking-widest">Top Performers</h4>
                        </div>
                        <div className="space-y-6">
                            {[
                                { name: "SECTOR-4 GRID", change: "+14.2%", color: "text-success" },
                                { name: "AETHERIA PENT", change: "+8.9%", color: "text-success" },
                                { name: "SHUTTLE-FLEET", change: "-1.2%", color: "text-error" }
                            ].map((p, i) => (
                                <div key={i} className="flex justify-between items-center border-b border-white/5 pb-4">
                                    <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">{p.name}</span>
                                    <span className={`text-xs font-mono font-bold ${p.color}`}>{p.change}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-8">
                    <div className="sexy-card !bg-gradient-to-br from-secondary-warm/10 to-transparent border-secondary-warm/20 p-12 flex flex-col md:flex-row items-center gap-12">
                        <div className="w-20 h-20 bg-secondary-warm rounded-[2rem] flex items-center justify-center text-neutral-obsidian shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                            <Briefcase className="w-10 h-10" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-3xl text-white font-display font-black tracking-tight uppercase leading-tight">Institutional Underwriting</h3>
                            <p className="text-neutral-dim text-sm leading-relaxed font-medium tracking-wide">
                                All assets on the BelloMundo floor are backed by the Metropolis Treasury and insured via the Sovereign Risk Protocol. Minimum holding period for yield eligibility is 72 hours post-settlement.
                            </p>
                        </div>
                        <button className="btn-sexy gap-4 !bg-white/[0.03] !border-white/10 whitespace-nowrap">
                            AUDIT LOGS <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

