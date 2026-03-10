"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Activity, Users, DollarSign, Zap, 
    ArrowUpRight, ArrowDownRight, Globe, 
    ShieldCheck, BarChart3, TrendingUp,
    CheckCircle2, Clock, Wallet, ExternalLink
} from "lucide-react";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
    AreaChart, Area
} from "recharts";

interface AnalyticsData {
    totalResidents: number;
    economicOverview: number;
    walletLeaderboard: Array<{ _id: string; count: number; totalSpent: number }>;
    utilityAnalytics: Array<{ _id: string; count: number }>;
    recentTransactions: any[];
}

export default function AnalyticsDashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [liveBlocks, setLiveBlocks] = useState<number[]>([]);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch("/api/analytics");
            const result = await res.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (err) {
            console.error("Failed to fetch analytics:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
        const interval = setInterval(fetchAnalytics, 10000); // Poll every 10s for "Production Grade" real-time
        return () => clearInterval(interval);
    }, []);

    // Simulate block updates for higher fidelity real-time feel
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveBlocks(prev => [Math.floor(Math.random() * 1000000), ...prev].slice(0, 5));
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    if (loading || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <Activity className="w-12 h-12 text-primary-bright animate-spin" />
                <div className="text-[10px] font-black uppercase tracking-[0.8em] text-white/20">Syncing Metropolis Intelligence...</div>
            </div>
        );
    }

    const COLORS = ['#38BDF8', '#F59E0B', '#10B981', '#6366F1', '#EC4899'];

    return (
        <div className="flex flex-col gap-10 max-w-[1600px] mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.5em] text-white/20 mb-2">
                        System-Wide Intelligence Matrix
                    </div>
                    <h1 className="text-4xl font-display font-black text-white tracking-tight uppercase">
                        REAL-TIME <span className="sexy-gradient-text">ANALYTICS.</span>
                    </h1>
                </div>

                <div className="flex items-center gap-6 px-8 py-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Network Pulse</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            <span className="text-xs font-mono text-white/60 uppercase">ACTIVE BLOCKSTREAM</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                <MetricCard 
                    label="Total Residents" 
                    value={data.totalResidents.toString()} 
                    subvalue="Unique Citizens"
                    icon={<Users className="w-6 h-6 text-primary-bright" />}
                    trend="+12% Since Genesis"
                />
                <MetricCard 
                    label="Economic Overview" 
                    value={`◈ ${data.economicOverview.toLocaleString()}`} 
                    subvalue="Total DNR Volume"
                    icon={<DollarSign className="w-6 h-6 text-secondary-warm" />}
                    trend="Velocity: Optimal"
                />
                <MetricCard 
                    label="Metropolis Health" 
                    value="99.9%" 
                    subvalue="Uptime Status"
                    icon={<ShieldCheck className="w-6 h-6 text-success" />}
                    trend="NOMINAL OPERATIONS"
                />
                <MetricCard 
                    label="Protocol Yield" 
                    value="8.4%" 
                    subvalue="Avg Economy Growth"
                    icon={<TrendingUp className="w-6 h-6 text-primary-bright" />}
                    trend="Accelerating"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Utility Analytics Chart */}
                <div className="xl:col-span-8 sexy-card flex flex-col gap-8 p-10">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Utility Consumption Matrix</h3>
                            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest leading-none">Usage Frequency by Protocol Layer</p>
                        </div>
                        <BarChart3 className="w-5 h-5 text-white/20" />
                    </div>
                    
                    <div className="h-[350px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.utilityAnalytics}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis 
                                    dataKey="_id" 
                                    stroke="rgba(255,255,255,0.2)" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tickFormatter={(val) => val.toUpperCase()} 
                                />
                                <YAxis hide />
                                <Tooltip 
                                    cursor={{fill: 'rgba(255,255,255,0.02)'}}
                                    contentStyle={{ 
                                        backgroundColor: '#0A0A0A', 
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        fontSize: '10px',
                                        color: '#fff',
                                        textTransform: 'uppercase'
                                    }}
                                />
                                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                    {data.utilityAnalytics.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Economic Allocation (Pie) */}
                <div className="xl:col-span-4 sexy-card p-10 flex flex-col gap-8">
                    <div className="space-y-1">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Global Allocation</h3>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Liquidity Distribution</p>
                    </div>
                    
                    <div className="h-[250px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.utilityAnalytics}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={8}
                                    dataKey="count"
                                    nameKey="_id"
                                >
                                    {data.utilityAnalytics.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-4">
                        {data.utilityAnalytics.map((item, i) => (
                            <div key={item._id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                                    <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">{item._id}</span>
                                </div>
                                <span className="text-[10px] text-white font-black">{item.count} TXS</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Leaderboard & Live Feed Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Wallet Leaderboard */}
                <div className="xl:col-span-7 sexy-card p-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="space-y-1">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Citizen Ranking</h3>
                            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Leaderboard by Transaction Output</p>
                        </div>
                        <Globe className="w-5 h-5 text-white/10" />
                    </div>

                    <div className="space-y-2">
                        <div className="grid grid-cols-10 px-4 py-2 text-[8px] font-black uppercase text-white/20 tracking-widest border-b border-white/5 mb-2">
                            <div className="col-span-1">Rank</div>
                            <div className="col-span-5">Identity Hash</div>
                            <div className="col-span-2 text-right">Activity</div>
                            <div className="col-span-2 text-right">Volume</div>
                        </div>
                        
                        {data.walletLeaderboard.map((wallet, idx) => (
                            <div key={wallet._id} className="grid grid-cols-10 items-center px-4 py-4 rounded-xl hover:bg-white/[0.02] transition-colors group">
                                <div className="col-span-1 text-xs font-mono text-white/40">#{idx + 1}</div>
                                <div className="col-span-5 flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary-bright/20" />
                                    <span className="text-xs font-mono text-white group-hover:text-primary-bright transition-colors">
                                        {wallet._id.slice(0, 8)}...{wallet._id.slice(-6)}
                                    </span>
                                </div>
                                <div className="col-span-2 text-right">
                                    <span className="text-[10px] font-black text-white/60">{wallet.count} TXS</span>
                                </div>
                                <div className="col-span-2 text-right">
                                    <span className="text-xs font-display font-black text-white tracking-tight">◈ {wallet.totalSpent.toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Real-time Block-Feed */}
                <div className="xl:col-span-5 flex flex-col gap-8">
                    <div className="sexy-card p-10 flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Live Ledger</h3>
                            <span className="px-3 py-1 rounded-full bg-success/10 border border-success/20 text-success text-[8px] font-black uppercase flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-success animate-pulse" /> STREAMING
                            </span>
                        </div>
                        
                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {data.recentTransactions.map((tx, i) => (
                                    <motion.div
                                        key={tx._id || i}
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="p-4 rounded-xl bg-white/[0.01] border border-white/5 flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-neutral-obsidian flex items-center justify-center border border-white/5">
                                                <Zap className="w-4 h-4 text-primary-bright opacity-40" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-white uppercase tracking-tight truncate max-w-[120px]">
                                                    {tx.description}
                                                </span>
                                                <span className="text-[8px] text-white/20 font-mono uppercase tracking-widest">
                                                    {tx.txHash.slice(0, 10)}...
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-display font-black text-white tracking-tighter">◈ {tx.amountDNR}</span>
                                            <span className="text-[7px] text-success font-black uppercase flex items-center gap-1">
                                                <CheckCircle2 className="w-2 h-2" /> CONFIRMED
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="sexy-card p-10 bg-primary-bright/5 border-primary-bright/20 border-dashed">
                        <div className="flex items-center gap-4 text-primary-bright mb-4">
                            <Clock className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Chain Pulse (Simulated RPC)</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {liveBlocks.map(block => (
                                <span key={block} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 font-mono text-[9px] text-white/40">
                                    #{block}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ label, value, subvalue, icon, trend }: { label: string, value: string, subvalue: string, icon: any, trend: string }) {
    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className="sexy-card p-10 space-y-6 relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                {icon}
            </div>
            
            <div className="space-y-1">
                <span className="text-[9px] text-white/20 font-black uppercase tracking-[0.4em]">{label}</span>
                <div className="flex items-baseline gap-2">
                    <h2 className="text-3xl font-display font-black text-white tracking-tighter uppercase">{value}</h2>
                </div>
                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">{subvalue}</p>
            </div>
            
            <div className="flex items-center gap-3 pt-6 border-t border-white/5">
                <div className="px-2 py-0.5 rounded bg-primary-bright/10 text-primary-bright text-[7px] font-black uppercase tracking-widest">
                    {trend}
                </div>
            </div>
        </motion.div>
    );
}
