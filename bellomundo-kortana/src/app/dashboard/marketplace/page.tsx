"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    ShoppingCart, TrendingUp, ArrowUpRight,
    Filter, Search, ArrowRight, ShieldCheck,
    Zap, Building2, Layers, Briefcase, CheckCircle2,
    X, Wallet, Globe, MapPin, Activity
} from "lucide-react";

interface MarketAsset {
    id: string;
    title: string;
    description: string;
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
        description: "Luxury high-rise residential equity in the Sector 7 skyline.",
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
        description: "Passive income from the city's self-healing transit network.",
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
        description: "Sustainable infrastructure yielding fixed returns from energy demand.",
        type: "Utility Infrastructure",
        price: "12.5",
        yield: "+5.2%",
        liquidity: "Instant",
        progress: 100,
        image: "https://images.unsplash.com/photo-1509391366360-fe5bb6583e2c?auto=format&fit=crop&w=800&q=80",
        sector: "Sector 4",
        totalShares: "10,000"
    },
    {
        id: "STO-004",
        title: "Vertical Harvest Co-op",
        description: "Ownership in the city's primary automated food-production deck.",
        type: "Agri-Tech Shares",
        price: "0.9",
        yield: "+15.2%",
        liquidity: "Low",
        progress: 68,
        image: "https://images.unsplash.com/photo-1530836361253-efcc5056d9fe?auto=format&fit=crop&w=800&q=80",
        sector: "Eco-Sector 2",
        totalShares: "12,500"
    },
    {
        id: "STO-005",
        title: "Cyber-Security Citadel Bond",
        description: "Bonds funding the Metropolis encryption and security layer.",
        type: "Defense & Cyber",
        price: "22.0",
        yield: "+4.1%",
        liquidity: "High",
        progress: 92,
        image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
        sector: "Command Core",
        totalShares: "1,000"
    },
    {
        id: "STO-006",
        title: "Terra-V Hydro-Plant",
        description: "Equity in water reclamation and desalination operations.",
        type: "Infrastructure",
        price: "3.5",
        yield: "+7.5%",
        liquidity: "Medium",
        progress: 31,
        image: "https://images.unsplash.com/photo-1464938701291-1d3397063cb4?auto=format&fit=crop&w=800&q=80",
        sector: "Sector 1",
        totalShares: "8,000"
    },
    {
        id: "STO-007",
        title: "Genesis Server-Node Deck",
        description: "Compute power fractionalized for institutional AI leasing.",
        type: "Compute Equity",
        price: "6.8",
        yield: "+18.2%",
        liquidity: "High",
        progress: 12,
        image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc4b?auto=format&fit=crop&w=800&q=80",
        sector: "Data Core",
        totalShares: "20,000"
    },
    {
        id: "STO-008",
        title: "M-Lev Transport Hub",
        description: "Shares in the primary Magnetic Levitation hub for Sector 3.",
        type: "Mobility Equity",
        price: "9.2",
        yield: "+6.8%",
        liquidity: "Instant",
        progress: 55,
        image: "https://images.unsplash.com/photo-1473163928189-39a0c8a92541?auto=format&fit=crop&w=800&q=80",
        sector: "Sector 3",
        totalShares: "4,000"
    }
];

export default function MarketplacePage() {
    const [filter, setFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const router = useRouter();

    const filteredAssets = marketAssets.filter(asset => {
        const matchesFilter = filter === "ALL" || 
            (filter === "REAL ESTATE" && asset.type.includes("Real Estate")) ||
            (filter === "MOBILITY" && asset.type.includes("Mobility")) ||
            (filter === "INFRA" && asset.type.includes("Infrastructure"));
        const matchesSearch = asset.title.toUpperCase().includes(search.toUpperCase()) || 
                             asset.sector.toUpperCase().includes(search.toUpperCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="flex flex-col gap-16 max-w-[1600px] mx-auto pb-40 relative">
            
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
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
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
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredAssets.map((asset, idx) => (
                    <motion.div
                        key={asset.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="sexy-card !p-0 overflow-hidden border-white/5 group cursor-pointer"
                        onClick={() => router.push(`/dashboard/marketplace/${asset.id}`)}
                    >
                        <div className="relative h-64 overflow-hidden">
                            <img src={asset.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-obsidian flex flex-col justify-end p-8">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <span className="text-[9px] text-primary-bright font-black uppercase tracking-widest">{asset.type}</span>
                                        <h3 className="text-xl text-white font-display font-black tracking-tight uppercase leading-tight">{asset.title}</h3>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg text-success font-display font-black tracking-tight">{asset.yield}</div>
                                        <div className="text-[8px] text-white/30 font-black uppercase tracking-widest">A.P.Y</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider line-clamp-2 h-10">
                                {asset.description}
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-[8px] text-white/20 font-black uppercase tracking-widest block">Entry Price</span>
                                    <span className="text-lg text-white font-display font-black uppercase tracking-tighter">◈ {asset.price} DNR</span>
                                </div>
                                <div className="space-y-1 text-right">
                                    <span className="text-[8px] text-white/20 font-black uppercase tracking-widest block">Liquidity</span>
                                    <span className="text-sm text-white font-black uppercase tracking-widest">{asset.liquidity}</span>
                                </div>
                            </div>

                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/dashboard/marketplace/${asset.id}`);
                                }}
                                className="w-full py-5 rounded-2xl bg-white/[0.03] border border-white/5 text-white group-hover:bg-white group-hover:text-neutral-obsidian text-[10px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3"
                            >
                                ACQUIRE EQUITY <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Footer Insights Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4">
                    <div className="sexy-card !bg-white/[0.01] border-white/5 p-10 space-y-8">
                        <div className="flex items-center gap-4">
                            <TrendingUp className="text-success w-6 h-6" />
                            <h4 className="text-white font-display font-black uppercase tracking-widest">Floor Performance</h4>
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
                    <div className="sexy-card !bg-gradient-to-br from-primary-bright/10 to-transparent border-primary-bright/20 p-12 flex flex-col md:flex-row items-center gap-12">
                        <div className="w-20 h-20 bg-primary-bright rounded-[2rem] flex items-center justify-center text-neutral-obsidian shrink-0 shadow-[0_0_20px_rgba(56,189,248,0.3)]">
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
