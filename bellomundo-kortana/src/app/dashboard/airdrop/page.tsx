"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Users, Activity, Zap, CreditCard, Filter, Search, Award, CheckCircle2, XCircle
} from "lucide-react";

const mockWallets = [
    { address: "0x78D1...3A9C", txns: 145, spent: "4,250", eligible: true, lastActive: "2 mins ago" },
    { address: "0x44F2...1B8E", txns: 82, spent: "1,120", eligible: true, lastActive: "15 mins ago" },
    { address: "0x91A3...4C7D", txns: 12, spent: "150", eligible: false, lastActive: "1 hour ago" },
    { address: "0x22B4...6D9F", txns: 56, spent: "890", eligible: true, lastActive: "3 hours ago" },
    { address: "0x67E5...2A1B", txns: 4, spent: "45", eligible: false, lastActive: "1 day ago" },
    { address: "0x33C6...8E2A", txns: 210, spent: "8,400", eligible: true, lastActive: "5 mins ago" },
    { address: "0x88D7...5F3C", txns: 33, spent: "420", eligible: false, lastActive: "4 hours ago" },
    { address: "0x55E8...9B4D", txns: 67, spent: "1,050", eligible: true, lastActive: "10 mins ago" },
];

export default function AirdropDashboard() {
    const [filterOption, setFilterOption] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredWallets = mockWallets.filter(wallet => {
        if (filterOption === "ELIGIBLE") return wallet.eligible;
        if (filterOption === "NOT ELIGIBLE") return !wallet.eligible;
        return true;
    }).filter(wallet => wallet.address.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="flex flex-col gap-10 max-w-[1600px] mx-auto pb-40">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
            >
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.6em] text-primary-bright">
                    <Award className="w-4 h-4" />
                    BelloMundo Distribution
                </div>
                <h1 className="text-5xl md:text-7xl text-white font-display font-black leading-[0.9] tracking-tight uppercase">
                    AIRDROP <span className="text-white/40">ELIGIBILITY</span> <br />
                    <span className="sexy-gradient-text">COMMAND CENTER.</span>
                </h1>
            </motion.div>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: "Total Residents", value: "42,450", icon: Users, sub: "Unique Wallets Verified" },
                    { title: "Total $DNR Spent", value: "5.4M", icon: CreditCard, sub: "Metropolis Circulation" },
                    { title: "Most Used Utility", value: "Transit Core", icon: Zap, sub: "Sector 4 Autonomous Fleet" },
                    { title: "Transactions Today", value: "14,200", icon: Activity, sub: "Active Block Confirmations" },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="sexy-card !bg-white/[0.02] border-white/5 p-8 flex flex-col gap-6"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] w-2/3 leading-relaxed">{stat.title}</span>
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary-bright shrink-0">
                                <stat.icon className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl text-white font-display font-black tracking-tight">{stat.value}</div>
                            <div className="text-[9px] text-white/30 uppercase tracking-widest mt-2">{stat.sub}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Wallet Filtering & Table */}
            <div className="sexy-card !bg-white/[0.01] border-white/5 !p-0 overflow-hidden">
                <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Filter className="w-5 h-5 text-white/40" />
                        <h2 className="text-sm text-white font-black uppercase tracking-widest">Resident Ledger Analysis</h2>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search Address..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-[11px] font-black tracking-widest text-white placeholder:text-white/20 focus:outline-none focus:border-primary-bright/50 transition-colors uppercase"
                            />
                        </div>
                        <div className="flex bg-white/5 rounded-xl p-1 w-full md:w-auto">
                            {["ALL", "ELIGIBLE", "NOT ELIGIBLE"].map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setFilterOption(opt)}
                                    className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterOption === opt ? 'bg-primary-bright text-neutral-obsidian shadow-md' : 'text-white/40 hover:text-white'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-white/[0.02]">
                                <th className="py-5 px-8 text-[10px] font-black tracking-[0.2em] uppercase text-white/30 border-b border-white/5">Citizen Wallet</th>
                                <th className="py-5 px-8 text-[10px] font-black tracking-[0.2em] uppercase text-white/30 border-b border-white/5">Total Txns</th>
                                <th className="py-5 px-8 text-[10px] font-black tracking-[0.2em] uppercase text-white/30 border-b border-white/5">$DNR Spent</th>
                                <th className="py-5 px-8 text-[10px] font-black tracking-[0.2em] uppercase text-white/30 border-b border-white/5">Last Activity</th>
                                <th className="py-5 px-8 text-[10px] font-black tracking-[0.2em] uppercase text-white/30 border-b border-white/5">Airdrop Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredWallets.map((wallet, idx) => (
                                <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="py-5 px-8 border-b border-white/5">
                                        <div className="text-sm font-mono font-bold text-white tracking-widest">{wallet.address}</div>
                                    </td>
                                    <td className="py-5 px-8 border-b border-white/5">
                                        <div className="text-sm text-white font-black">{wallet.txns}</div>
                                        <div className="text-[9px] text-white/30 uppercase tracking-widest mt-1">LIFETIME</div>
                                    </td>
                                    <td className="py-5 px-8 border-b border-white/5">
                                        <div className="text-sm text-white font-mono font-bold tracking-widest">◈ {wallet.spent}</div>
                                    </td>
                                    <td className="py-5 px-8 border-b border-white/5">
                                        <div className="text-xs text-white/50 uppercase tracking-wider font-semibold">{wallet.lastActive}</div>
                                    </td>
                                    <td className="py-5 px-8 border-b border-white/5">
                                        {wallet.eligible ? (
                                            <div className="flex items-center gap-2 text-success">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Eligible (&gt;50 txs)</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-white/30">
                                                <XCircle className="w-4 h-4" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Ineligible (&lt;50 txs)</span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredWallets.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-white/30 text-sm font-black uppercase tracking-widest">
                                        No residents match the selected filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
