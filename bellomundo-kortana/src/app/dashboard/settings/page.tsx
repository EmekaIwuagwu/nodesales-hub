"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useAccount } from "wagmi";
import {
    User, Shield, Bell, Globe, Activity, Cpu,
    Save, Copy, ExternalLink, RefreshCcw,
    Lock, Eye, Smartphone, Zap
} from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
    const { data: session } = useSession();
    const { address } = useAccount();
    const [isSaving, setIsSaving] = useState(false);

    const userName = session?.user?.name || "CITIZEN";
    const userEmail = session?.user?.email || "anonymous@metropolis.xyz";
    const shortenedAddress = address ? `${address.slice(0, 12)}...${address.slice(-10)}` : "NOT_ASSOCIATED";

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 2000);
    };

    return (
        <div className="flex flex-col gap-12 max-w-[1200px] mx-auto pb-40">
            {/* Header Module */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row lg:items-end justify-between gap-10"
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.6em] text-primary-bright">
                        <Cpu className="w-4 h-4" />
                        Metropolis Core Configuration
                    </div>
                    <h1 className="text-7xl md:text-8xl font-display font-black text-white leading-none tracking-tighter uppercase">
                        SYSTEM <span className="sexy-gradient-text">SETTINGS.</span>
                    </h1>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    className="btn-sexy min-w-[220px]"
                >
                    {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? "SYNCING CORES..." : "SAVE CONFIGURATION"}
                </motion.button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Navigation Sidebar (Local) */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                    {[
                        { icon: <User />, label: "Personal Profile", active: true },
                        { icon: <Shield />, label: "Security & Vault", active: false },
                        { icon: <Bell />, label: "Notifications", active: false },
                        { icon: <Globe />, label: "Regional Logic", active: false },
                        { icon: <Zap />, label: "Grid Preferences", active: false }
                    ].map((item, idx) => (
                        <button
                            key={idx}
                            className={`flex items-center gap-5 p-6 rounded-[1.5rem] border transition-all duration-500 group ${item.active ? 'bg-primary-bright/10 border-primary-bright/30 text-primary-bright' : 'bg-white/[0.02] border-white/5 text-white/40 hover:border-white/20 hover:text-white'}`}
                        >
                            <div className="w-5 h-5">{item.icon}</div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Settings Panels */}
                <div className="lg:col-span-9 space-y-10">

                    {/* Identity Module */}
                    <div className="sexy-card p-12 space-y-10 border-white/5">
                        <div className="flex items-center justify-between border-b border-white/5 pb-8">
                            <h3 className="text-[11px] text-white font-black uppercase tracking-[0.5em] flex items-center gap-4">
                                <User className="w-4 h-4 text-primary-bright" />
                                Sovereign Identity
                            </h3>
                            <span className="text-[9px] text-white/20 font-black uppercase tracking-widest">Metropolis-ID: BM-927361</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 ml-4">Full Legal Alias</label>
                                <input
                                    type="text"
                                    defaultValue={userName}
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-6 text-xs font-black tracking-widest text-white uppercase focus:outline-none focus:border-primary-bright/30 transition-all font-mono"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 ml-4">Communication Node</label>
                                <input
                                    type="email"
                                    defaultValue={userEmail}
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-6 text-xs font-black tracking-widest text-white lowercase focus:outline-none focus:border-primary-bright/30 transition-all font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Cryptographic Vault Module */}
                    <div className="sexy-card p-12 space-y-10 border-white/5">
                        <div className="flex items-center justify-between border-b border-white/5 pb-8">
                            <h3 className="text-[11px] text-white font-black uppercase tracking-[0.5em] flex items-center gap-4">
                                <Shield className="w-4 h-4 text-secondary-warm" />
                                Hardware Security Node
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                                <span className="text-[9px] text-success/60 font-black uppercase tracking-widest">DEEP ENCRYPTION ACTIVE</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-8 rounded-[2rem] bg-neutral-obsidian border border-white/5 flex items-center justify-between group">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/20 group-hover:text-primary-bright transition-all">
                                        <Lock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest block mb-1">Primary Wallet Registry</span>
                                        <span className="text-xs font-mono text-white/30 tracking-tight">{shortenedAddress}</span>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button className="p-4 rounded-xl bg-white/[0.05] text-white/40 hover:text-white transition-all"><Copy className="w-4 h-4" /></button>
                                    <button className="p-4 rounded-xl bg-white/[0.05] text-white/40 hover:text-white transition-all"><ExternalLink className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-between hover:border-white/10 transition-all cursor-pointer">
                                    <div className="flex items-center gap-5">
                                        <Smartphone className="w-5 h-5 text-white/20" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">2FA Protocol</span>
                                    </div>
                                    <div className="w-10 h-6 rounded-full bg-primary-bright/20 border border-primary-bright/40 relative">
                                        <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-primary-bright" />
                                    </div>
                                </div>
                                <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-between hover:border-white/10 transition-all cursor-pointer">
                                    <div className="flex items-center gap-5">
                                        <Eye className="w-5 h-5 text-white/20" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Ghost Mode</span>
                                    </div>
                                    <div className="w-10 h-6 rounded-full bg-white/5 border border-white/10 relative">
                                        <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white/20" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational Awareness Module */}
                    <div className="sexy-card p-12 border-white/5">
                        <div className="flex items-center gap-4 text-[11px] text-white font-black uppercase tracking-[0.5em] mb-10">
                            <Activity className="w-4 h-4 text-primary-bright" />
                            Logistics Metadata
                        </div>
                        <p className="text-neutral-dim leading-relaxed tracking-wide text-sm">
                            Configuration values are synchronized across Metropolis nodes every 24 hours. Changes to Sovereign Identity require biometric re-validation at the central Bio-Hub.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
