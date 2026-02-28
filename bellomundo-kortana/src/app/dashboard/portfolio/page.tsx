"use client";

import { motion } from "framer-motion";
import {
    Activity, Building2, Car, ShieldCheck,
    ArrowUpRight, TrendingUp, PieChart as PieChartIcon,
    Wallet, Briefcase, ChevronRight, Globe, Layers,
    Zap, Gem, Target, Sparkles
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

const chartData = [
    { name: 'JAN', value: 45000 },
    { name: 'FEB', value: 52000 },
    { name: 'MAR', value: 48000 },
    { name: 'APR', value: 61000 },
    { name: 'MAY', value: 59000 },
    { name: 'JUN', value: 72000 },
];

const COLORS = ['#38BDF8', '#F59E0B', '#10B981', '#6366F1'];

export default function PortfolioPage() {
    const { data: session } = useSession();
    const { address } = useAccount();
    const { data: balance } = useBalance({ address });

    const totalEquity = "142,500";
    const dnrBalance = balance ? parseFloat(formatUnits(balance.value, 18)).toLocaleString() : "1,247.50";

    const assetAllocation = [
        { name: 'Real Estate', value: 65, icon: <Building2 />, dnr: "92,625" },
        { name: 'Mobility Fleet', value: 20, icon: <Car />, dnr: "28,500" },
        { name: 'DNR Liquidity', value: 10, icon: <Wallet />, dnr: dnrBalance },
        { name: 'Governance Nodes', value: 5, icon: <Globe />, dnr: "7,125" },
    ];

    return (
        <div className="flex flex-col gap-12 max-w-[1440px] mx-auto pb-40">
            {/* Portfolio Header */}
            <div className="flex flex-col lg:flex-row items-end justify-between gap-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.6em] text-primary-bright">
                        <Briefcase className="w-4 h-4" />
                        Metropolis Asset Ledger
                    </div>
                    <h1 className="text-7xl md:text-9xl text-white font-display font-black leading-[0.8] tracking-tight uppercase">
                        URBAN <br />
                        <span className="sexy-gradient-text">EQUITY.</span>
                    </h1>
                </motion.div>

                <div className="flex gap-4">
                    <button className="btn-sexy min-w-[200px] !bg-white/[0.03] !border-white/10">
                        <Layers className="w-4 h-4" /> Structural Audit
                    </button>
                    <button className="btn-sexy-gold">
                        <TrendingUp className="w-4 h-4" /> Market Projection
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">

                {/* Left Side: Financial Core */}
                <div className="xl:col-span-8 flex flex-col gap-12">

                    {/* Equity Card */}
                    <div className="sexy-card relative overflow-hidden p-16 flex flex-col md:flex-row items-center gap-16 group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-bright/5 blur-[120px] rounded-full" />

                        <div className="relative z-10 space-y-8 flex-1">
                            <div className="space-y-2">
                                <span className="text-[10px] text-white/30 uppercase tracking-[0.6em] font-black block">Aggregated Asset Value</span>
                                <div className="text-8xl text-white font-display font-black tracking-tighter leading-none">
                                    ◈ {totalEquity}
                                    <span className="text-2xl text-primary-bright/40 ml-4">DNR</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-12">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                                    <span className="text-xs text-success font-black uppercase tracking-widest">+12.4% MONTHLY GROWTH</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                    <span className="text-xs text-white/40 font-black uppercase tracking-widest">METROPOLIS REVENUE SHARE ACTIVE</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-64 h-64 relative shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={assetAllocation}
                                        cx="50%" cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {assetAllocation.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[8px] text-white/20 uppercase tracking-[0.4em] font-black">Allocation</span>
                                <div className="text-2xl text-white font-display font-black uppercase">Alpha</div>
                            </div>
                        </div>
                    </div>

                    {/* Growth Analytics */}
                    <div className="sexy-card p-0 overflow-hidden border-white/5 bg-white/[0.01]">
                        <div className="p-10 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-[10px] text-white font-black uppercase tracking-[0.6em] flex items-center gap-4">
                                <Activity className="w-4 h-4 text-primary-bright" />
                                Equity Appraisal History
                            </h3>
                            <div className="flex gap-4">
                                <button className="text-[9px] font-black text-white px-6 py-2 rounded-full bg-primary-bright">12M</button>
                                <button className="text-[9px] font-black text-white/20 px-6 py-2 rounded-full hover:bg-white/5">YTD</button>
                            </div>
                        </div>
                        <div className="h-[400px] w-full p-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="rgba(255,255,255,0.1)"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#070707', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }}
                                        itemStyle={{ color: '#fff', fontSize: '12px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#38BDF8"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Right Side: Inventory Nodes */}
                <div className="xl:col-span-4 flex flex-col gap-12">
                    <div className="sexy-card p-10 space-y-10 border-white/5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[11px] text-white font-black uppercase tracking-[0.5em]">Inventory Nodes</h3>
                            <span className="text-[9px] text-white/20 font-black tracking-widest uppercase">7 Registered Assets</span>
                        </div>

                        <div className="flex flex-col gap-6">
                            {assetAllocation.map((asset, idx) => (
                                <div key={idx} className="p-8 rounded-[2rem] bg-neutral-obsidian border border-white/5 flex items-center justify-between group hover:border-primary-bright/20 transition-all duration-700 cursor-pointer">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/20 group-hover:text-primary-bright transition-all">
                                            {asset.icon}
                                        </div>
                                        <div>
                                            <span className="text-[11px] font-black text-white uppercase tracking-widest block mb-1">{asset.name}</span>
                                            <span className="text-[9px] font-mono text-white/30 tracking-tight">{asset.value}% Weight</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-display font-black text-white tracking-tighter">◈ {asset.dnr}</div>
                                        <div className="text-[9px] text-primary-bright font-black uppercase tracking-widest mt-1">VERIFIED</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full btn-sexy !bg-white/[0.03] !border-white/10 mt-4">
                            Expand Portfolio <PlusIcon className="w-4 h-4 ml-2" />
                        </button>
                    </div>

                    {/* Strategic Suggestions */}
                    <div className="sexy-card p-10 space-y-8 bg-gradient-to-br from-secondary-warm/10 to-transparent border-secondary-warm/20">
                        <div className="flex items-center gap-4 text-secondary-warm">
                            <Sparkles className="w-5 h-5 fill-current" />
                            <span className="text-[10px] font-black uppercase tracking-[0.6em]">Urban Advisory</span>
                        </div>
                        <h4 className="text-2xl text-white font-display font-black tracking-tight uppercase leading-snug">
                            Portfolio under-weighted in fractional mobility.
                        </h4>
                        <p className="text-white/40 text-xs leading-relaxed font-medium">
                            Sector 4 transport yields have increased by 18% this cycle. Acquiring 5% of a Nexus Prime fleet could optimize your monthly DNR dividends.
                        </p>
                        <button className="text-secondary-warm font-black uppercase tracking-[0.6em] text-[9px] flex items-center gap-4 group">
                            VIEW TRANSIT NODES <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const PlusIcon = ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
)
