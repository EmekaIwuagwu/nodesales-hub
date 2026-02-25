"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    Users,
    Globe,
    DollarSign,
    PieChart,
    Activity,
    ArrowUpRight,
    Calendar,
    MousePointer2
} from 'lucide-react';
import AdminSidebar from '@/components/admin/Sidebar';

export default function AnalyticsPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/presale/stats');
                const data = await res.json();
                setStats(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="bg-[#020410] min-h-screen text-white flex">
            <AdminSidebar />

            <main className="flex-1 lg:ml-[280px] p-8 md:p-12">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-7xl mx-auto space-y-12"
                >
                    {/* Header */}
                    <header>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                <BarChart3 size={20} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Intelligence Wing</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black font-space tracking-tight">Market Analytics</h1>
                        <p className="text-gray-500 font-medium mt-4 max-w-xl">Comprehensive overview of the Kortana liquidity event, capital distribution, and global investor footprint.</p>
                    </header>

                    {/* Quick KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <KPICard
                            label="Net Capital Raised"
                            value={stats?.totalAmountRaised || "$0"}
                            subValue="+12.5% from last week"
                            icon={DollarSign}
                            color="emerald"
                        />
                        <KPICard
                            label="Active Participants"
                            value={stats?.totalRegistrations || "0"}
                            subValue="Verified Wallets"
                            icon={Users}
                            color="indigo"
                        />
                        <KPICard
                            label="Target Completion"
                            value={`${stats?.percentageToGoal || "0"}%`}
                            subValue="Progress to $2M USD"
                            icon={TrendingUp}
                            color="amber"
                        />
                    </div>

                    {/* Main Charts Mocked for Visuals */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Capital Flow Chart */}
                        <motion.div variants={itemVariants} className="bg-white/5 border border-white/5 rounded-[32px] p-8 space-y-8">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold font-space">Capital Inflow</h3>
                                    <p className="text-xs text-gray-500">Real-time accumulation metrics</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-gray-400">7D</span>
                                    <span className="px-3 py-1 bg-indigo-600 rounded-lg text-[10px] font-bold text-white">30D</span>
                                </div>
                            </div>

                            <div className="h-64 flex items-end gap-2 px-4">
                                {[40, 60, 45, 90, 65, 80, 50, 70, 100, 85, 95, 110].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ delay: i * 0.05, duration: 1 }}
                                        className="flex-1 bg-gradient-to-t from-indigo-600/20 to-indigo-500 rounded-t-lg relative group"
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            ${h}k
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="flex justify-between text-[10px] font-black text-gray-600 uppercase tracking-widest pt-4 border-t border-white/5">
                                <span>Jan</span>
                                <span>Feb</span>
                                <span>Mar</span>
                            </div>
                        </motion.div>

                        {/* Tier Distribution */}
                        <motion.div variants={itemVariants} className="bg-white/5 border border-white/5 rounded-[32px] p-8 space-y-8">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold font-space">Tier Segments</h3>
                                    <p className="text-xs text-gray-500">Investor profile distribution</p>
                                </div>
                                <PieChart className="text-indigo-400" size={20} />
                            </div>

                            <div className="space-y-6">
                                <ProgressBar label="Enterprise (7.5M+ DNR)" percentage={45} color="bg-purple-500" />
                                <ProgressBar label="Professional (2M+ DNR)" percentage={30} color="bg-cyan-500" />
                                <ProgressBar label="Starter (<2M DNR)" percentage={25} color="bg-indigo-500" />
                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-8">
                                <div className="text-center">
                                    <p className="text-2xl font-black font-space">156</p>
                                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1">Institutions</p>
                                </div>
                                <div className="text-center border-x border-white/5">
                                    <p className="text-2xl font-black font-space">842</p>
                                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1">Professionals</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black font-space">2.1k</p>
                                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1">Retail</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Secondary Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <motion.div variants={itemVariants} className="bg-white/5 border border-white/5 rounded-[32px] p-8">
                            <h3 className="text-xl font-bold font-space mb-8 flex items-center gap-2">
                                <Globe size={18} className="text-indigo-400" />
                                Global Footprint
                            </h3>
                            <div className="space-y-4">
                                {['United States', 'United Kingdom', 'Germany', 'Singapore', 'UAE'].map((c, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                                            <span className="text-sm font-bold">{c}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-black">${(Math.random() * 500 + 100).toFixed(0)}k</span>
                                            <ArrowUpRight size={14} className="text-emerald-500" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-white/5 border border-white/5 rounded-[32px] p-8 flex flex-col justify-center items-center text-center space-y-6">
                            <div className="p-6 bg-indigo-500/10 rounded-full animate-pulse">
                                <Activity size={40} className="text-indigo-500" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black font-space">Live Audit Active</h3>
                                <p className="text-sm text-gray-500 max-w-xs mt-2">Every transaction is cross-referenced with your connected block explorers in real-time.</p>
                            </div>
                            <div className="flex gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                Node 01: Operational
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

function KPICard({ label, value, subValue, icon: Icon, color }: any) {
    const colors: any = {
        emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        indigo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
        amber: "bg-amber-500/10 text-amber-500 border-amber-500/20"
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white/5 border border-white/5 rounded-[32px] p-8 space-y-4"
        >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colors[color]}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</p>
                <h4 className="text-3xl font-black font-space mt-1">{value}</h4>
                <p className="text-[10px] font-bold text-gray-700 mt-2 uppercase flex items-center gap-1">
                    <ArrowUpRight size={10} className="text-emerald-500" />
                    {subValue}
                </p>
            </div>
        </motion.div>
    );
}

function ProgressBar({ label, percentage, color }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-white">{label}</span>
                <span className="text-gray-500">{percentage}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${color} shadow-[0_0_15px_rgba(99,102,241,0.3)]`}
                />
            </div>
        </div>
    );
}
