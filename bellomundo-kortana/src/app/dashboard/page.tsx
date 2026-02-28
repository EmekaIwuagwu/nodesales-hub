"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import WalletCard from "@/components/Dashboard/WalletCard";
import QuickPay from "@/components/Dashboard/QuickPay";
import UpcomingPayments from "@/components/Dashboard/UpcomingPayments";
import RecentTransactions from "@/components/Dashboard/RecentTransactions";
import SpendingChart from "@/components/Dashboard/SpendingChart";
import { ArrowRight, Plus, Send, Activity, ShieldCheck, Globe, Info } from "lucide-react";
import Link from "next/link";
import { TransferModal, MintDNRModal } from "@/components/Dashboard/FinancialActions";
import { useAccount } from "wagmi";

export default function DashboardPage() {
    const { data: session } = useSession();
    const { address } = useAccount();
    const userName = session?.user?.name || "CITIZEN";

    // Privacy: Shorten if it's an address
    const displayName = userName.startsWith('0x')
        ? `${userName.slice(0, 6)}...${userName.slice(-4)}`
        : userName.split(' ')[0];

    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [isMintOpen, setIsMintOpen] = useState(false);

    return (
        <div className="flex flex-col gap-10 max-w-[1600px] mx-auto">
            <TransferModal isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} />
            <MintDNRModal isOpen={isMintOpen} onClose={() => setIsMintOpen(false)} />

            {/* Strategic Header Overlay */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl mb-6"
            >
                <div className="flex items-center gap-8">
                    <div className="w-20 h-20 rounded-[2rem] bg-primary-bright/10 border border-primary-bright/20 flex items-center justify-center text-primary-bright shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                        <Activity className="w-10 h-10 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.5em] text-white/20">
                            Operational Identity Verified
                        </div>
                        <h1 className="text-3xl md:text-4xl font-display font-black text-white tracking-tight uppercase leading-none">
                            COMMAND <span className="sexy-gradient-text">{displayName}.</span>
                        </h1>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                    <div className="hidden lg:flex items-center gap-10 px-10 border-r border-white/5 h-16 mr-4 text-right">
                        <div className="space-y-1">
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block">System Status</span>
                            <span className="text-xs font-mono text-success flex items-center gap-2">NOMINAL <div className="w-1 h-1 rounded-full bg-success"></div></span>
                        </div>
                        <div className="w-[1px] h-8 bg-white/5" />
                        <div className="space-y-1">
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block">Network Layer</span>
                            <span className="text-xs font-mono text-primary-bright uppercase">Kortana-Test</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <motion.button
                            whileHover={{ y: -2, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsTransferOpen(true)}
                            className="px-8 py-5 rounded-[1.5rem] bg-white text-neutral-obsidian text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl hover:bg-neutral-100 transition-all"
                        >
                            <Send className="w-4 h-4" /> Transfer
                        </motion.button>
                        <motion.button
                            whileHover={{ y: -2, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsMintOpen(true)}
                            className="px-8 py-5 rounded-[1.5rem] bg-primary-bright text-neutral-obsidian text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all"
                        >
                            <Plus className="w-4 h-4" /> Mint DNR
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Master Logistics Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">

                {/* Primary Financial Hub (Left Column) */}
                <div className="xl:col-span-8 flex flex-col gap-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <WalletCard />
                        <div className="sexy-card !bg-white/[0.01] flex flex-col justify-between p-12">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-[11px] text-white/30 font-black uppercase tracking-[0.4em]">Asset Allocation</h3>
                                <Globe className="w-5 h-5 text-primary-bright/40" />
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-white uppercase tracking-widest font-black">STAKED DNR</span>
                                    <span className="text-xl text-white font-display font-black tracking-tight uppercase">◈ 12,400.00</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="w-[65%] h-full bg-primary-bright rounded-full" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-white uppercase tracking-widest font-black">CITY SHARES</span>
                                    <span className="text-xl text-white font-display font-black tracking-tight uppercase">◈ 2,850.00</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="w-[28%] h-full bg-secondary-warm rounded-full" />
                                </div>
                            </div>
                            <Link href="/dashboard/portfolio" className="mt-10 text-[10px] text-primary-bright font-black uppercase tracking-[0.5em] flex items-center gap-4 group">
                                PORTFOLIO INSIGHTS <ArrowRight className="w-4 h-4 group-hover:translate-x-3 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* Big Functional Area */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between px-4">
                            <h2 className="text-[11px] text-white font-black uppercase tracking-[0.8em]">Historical Ledger</h2>
                            <span className="text-[9px] text-white/20 font-black uppercase tracking-widest leading-none">Real-time Blockstream Sync</span>
                        </div>
                        <div className="sexy-card !p-0">
                            <RecentTransactions />
                        </div>
                    </div>
                </div>

                {/* Intelligence & Actions (Right Column) */}
                <div className="xl:col-span-4 flex flex-col gap-10">

                    {/* High-Fidelity Quick Actions */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 px-4">
                            <h3 className="text-[11px] text-white/30 font-black uppercase tracking-[0.4em]">Protocols</h3>
                            <div className="h-[1px] flex-1 bg-white/5" />
                        </div>
                        <QuickPay />
                    </div>

                    {/* Analytics Module */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 px-4">
                            <h3 className="text-[11px] text-white/30 font-black uppercase tracking-[0.4em]">Obligations</h3>
                            <div className="h-[1px] flex-1 bg-white/5" />
                        </div>
                        <UpcomingPayments />
                    </div>

                    {/* Resource Chart - Integrated compactly */}
                    <div className="sexy-card !bg-white/[0.01] !p-10">
                        <SpendingChart />
                    </div>

                    {/* Metropolis AI Advisor */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="sexy-card !bg-gradient-to-br from-primary-bright/10 to-transparent border-primary-bright/20 p-10 space-y-8 group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary-bright flex items-center justify-center text-neutral-obsidian shadow-[0_0_15px_rgba(56,189,248,0.4)]">
                                <Activity className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] text-white font-black uppercase tracking-[0.4em]">Urban Intelligence</span>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-2xl text-white font-display font-black tracking-tight uppercase leading-snug">
                                Energy demand in Sector 4 is peaking.
                            </h4>
                            <p className="text-white/40 text-[11px] leading-relaxed font-medium uppercase tracking-wider">
                                Recommendation: Authorize Grid Buffer 7 to minimize DNR surcharges. Your current e-Residency status grants a 12% override priority.
                            </p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary-bright animate-pulse" />
                                <div className="w-2 h-2 rounded-full bg-white/20" />
                                <div className="w-2 h-2 rounded-full bg-white/20" />
                            </div>
                            <button className="text-[9px] text-primary-bright font-black uppercase tracking-[0.4em]">EXECUTE OPTIMIZATION</button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Bottom Sector - Branding/Status */}
            <div className="pt-20 pb-40 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-10 opacity-30">
                <div className="flex items-center gap-4">
                    <ShieldCheck className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em]">End-to-End Cryptographic Encryption</span>
                </div>
                <div className="text-[9px] font-mono tracking-widest">BELLO MUNDO SMART CITY CORE v1.0.4-ALPHA</div>
            </div>
        </div>
    );
}
