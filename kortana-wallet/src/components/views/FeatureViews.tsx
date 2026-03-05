'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    ShieldCheck, Fingerprint, Lock as LockIcon, Leaf,
    Activity, Globe, Network, Database, ChevronRight,
    ArrowUpRight, Zap, ArrowDownLeft, ExternalLink, CheckCircle2
} from 'lucide-react';

import { collateralService } from '@/lib/CollateralService';
import { useWalletStore } from '@/store/useWalletStore';
import { NETWORKS, NetworkType } from '@/lib/constants';
import { useState, useMemo, useEffect } from 'react';

/* ============================================================
   SECTION HEADER — Reused across feature views
   ============================================================ */
const ViewHeader: React.FC<{
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    iconBorder: string;
    title: string;
    highlight: string;
    subtitle: string;
}> = ({ icon: Icon, iconColor, iconBg, iconBorder, title, highlight, subtitle }) => (
    <div className="flex items-center gap-4 md:gap-7 mb-4 lg:mb-10">
        <div className={`w-12 h-12 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl lg:rounded-[2rem] ${iconBg} flex items-center justify-center ${iconColor} border ${iconBorder} shrink-0 shadow-2xl transition-all hover:scale-105`}>
            <Icon className="size-6 md:size-10 lg:size-12" />
        </div>
        <div className="min-w-0">
            <h2 className="text-2xl md:text-4xl lg:text-6xl font-black text-white uppercase font-heading leading-none tracking-tighter">
                {title} <span className="text-gradient-kortana">{highlight}</span>
            </h2>
            <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[8px] md:text-sm lg:text-base mt-2 opacity-60 italic">{subtitle}</p>
        </div>
    </div>
);

/* ============================================================
   COMPLIANCE VIEW
   ============================================================ */
export const ComplianceView = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 md:space-y-8 pb-4">
        <ViewHeader
            icon={ShieldCheck} iconColor="text-cyan-400"
            iconBg="bg-cyan-400/10" iconBorder="border-cyan-400/20"
            title="ZK" highlight="Compliance"
            subtitle="Privacy-preserving identity verification enclave"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            <div className="lg:col-span-2 glass-panel p-4 md:p-10 lg:p-14 rounded-2xl md:rounded-[3rem] space-y-4 md:space-y-8 bg-gradient-to-br from-white/[0.04] to-transparent">
                <h3 className="text-base md:text-xl lg:text-3xl font-black text-white uppercase font-heading tracking-tight">Active Credentials</h3>
                <div className="space-y-4">
                    <div className="p-4 md:p-8 bg-white/5 border border-white/10 rounded-2xl md:rounded-[2rem] flex items-center justify-between text-white hover:bg-white/[0.08] transition-all group shadow-xl">
                        <div className="flex items-center gap-4 md:gap-7 min-w-0">
                            <div className="p-3 md:p-5 bg-cyan-400/10 rounded-2xl border border-cyan-400/20 group-hover:border-cyan-400/50 transition-colors">
                                <Fingerprint className="text-cyan-400 size-5 md:size-8 shrink-0" />
                            </div>
                            <div className="space-y-1">
                                <span className="font-black text-white uppercase text-xs md:text-xl truncate block">Biometric Shield</span>
                                <span className="text-[7px] md:text-[9px] text-gray-500 font-bold uppercase tracking-[0.3em]">Poseidon Enclave Level 4</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                            <span className="text-neon-green text-[8px] md:text-xs font-black uppercase tracking-[0.2em] px-3 py-1.5 bg-neon-green/10 rounded-full border border-neon-green/20">Verified</span>
                            <span className="text-[6px] md:text-[8px] text-gray-600 font-bold uppercase">Expires: 2029.04.12</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button className="flex-1 btn-launch py-3 md:py-6 text-sm lg:text-lg">Generate ZK Proof</button>
                    <button className="flex-1 btn-outline py-3 md:py-6 text-sm lg:text-lg">Refresh Sync</button>
                </div>
            </div>

            <div className="glass-panel p-4 md:p-10 rounded-2xl md:rounded-[3rem] bg-gradient-to-br from-cyan-500/5 to-transparent flex flex-col justify-center items-center text-center space-y-4 md:space-y-7 min-h-[220px] lg:min-h-full">
                <div className="relative">
                    <div className="w-20 h-20 md:w-32 md:h-32 lg:w-48 lg:h-48 rounded-full border-2 md:border-4 border-dashed border-cyan-400/30 animate-spin" style={{ animationDuration: '12s' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }} transition={{ duration: 3, repeat: Infinity }}>
                            <LockIcon className="text-cyan-400 size-6 md:size-12 lg:size-16" />
                        </motion.div>
                    </div>
                </div>
                <div>
                    <h4 className="font-black text-white uppercase mb-2 text-sm md:text-2xl">Anonymous Auth</h4>
                    <p className="text-[8px] md:text-[10px] lg:text-xs text-gray-500 max-w-[280px] font-bold uppercase tracking-widest leading-relaxed">
                        Prove eligibility without revealing personal data using Zero-Knowledge proofs.
                    </p>
                </div>
            </div>
        </div>
    </motion.div>
);

/* ============================================================
   ESG VIEW
   ============================================================ */
export const ESGView = () => {
    const [score, setScore] = useState(850);

    useEffect(() => {
        const interval = setInterval(() => {
            setScore(prev => prev + (Math.random() > 0.5 ? 1 : -1));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 md:space-y-8 pb-4">
            <ViewHeader
                icon={Leaf} iconColor="text-neon-green"
                iconBg="bg-neon-green/10" iconBorder="border-neon-green/20"
                title="ESG" highlight="Impact"
                subtitle="Sustainability rewards & ecological scoring"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                {/* Score Panel */}
                <div className="sm:col-span-2 xl:col-span-3 glass-panel p-6 md:p-12 lg:p-20 rounded-2xl md:rounded-[3rem] lg:rounded-[4rem] relative overflow-hidden bg-gradient-to-br from-neon-green/5 to-transparent">
                    <div className="absolute -top-12 -right-12 w-64 h-64 md:w-96 md:h-96 bg-neon-green/10 rounded-full blur-[100px]" />
                    <div className="flex items-baseline gap-4 md:gap-7 mb-3 md:mb-6 flex-wrap relative z-10">
                        <h3 className="text-6xl md:text-8xl lg:text-9xl font-black text-white font-heading tracking-tighter shadow-green">{score}</h3>
                        <span className="text-neon-green font-black uppercase tracking-[0.4em] text-xs md:text-2xl pt-2">Impact Score</span>
                    </div>
                    <p className="text-gray-400 font-bold uppercase text-[8px] md:text-xs lg:text-sm tracking-[0.4em] mb-10 md:mb-16 relative z-10">Kortana Ecological Footprint Rating (Global)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 relative z-10">
                        <div className="p-5 md:p-8 bg-white/5 rounded-2xl lg:rounded-[2rem] border border-white/5 backdrop-blur-md text-glow-green">
                            <p className="text-[7px] md:text-xs font-black text-gray-500 uppercase tracking-widest mb-1 xl:mb-3">Carbon Offset Credit Sync</p>
                            <p className="text-2xl md:text-4xl lg:text-5xl font-black text-white">{(score / 685.4).toFixed(3)} T</p>
                            <div className="mt-2 text-neon-green text-[7px] md:text-[9px] font-black uppercase tracking-widest">+12.4% / Month</div>
                        </div>
                        <div className="p-5 md:p-8 bg-white/5 rounded-2xl lg:rounded-[2rem] border border-white/5 backdrop-blur-md">
                            <p className="text-[7px] md:text-xs font-black text-gray-500 uppercase tracking-widest mb-1 xl:mb-3">Ecosystem Efficiency</p>
                            <p className="text-2xl md:text-4xl lg:text-5xl font-black text-white">99.4%</p>
                            <div className="mt-2 text-cyan-400 text-[7px] md:text-[9px] font-black uppercase tracking-widest">Optimized Pulse</div>
                        </div>
                    </div>
                </div>

                {/* Claim Panel */}
                <div className="glass-panel p-5 md:p-10 rounded-2xl md:rounded-[3rem] flex flex-col justify-between gap-6 border-neon-green/10 bg-neon-green/[0.02] shadow-2xl">
                    <div className="space-y-4 md:space-y-8 text-white">
                        <div className="w-12 h-12 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-neon-green/10 rounded-2xl lg:rounded-[2rem] flex items-center justify-center text-neon-green shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                            <Zap className="size-6 md:size-10 lg:size-12" />
                        </div>
                        <div className="space-y-2 lg:space-y-4">
                            <h4 className="text-lg md:text-3xl lg:text-4xl font-black text-white uppercase tracking-tighter leading-none">Green Rewards</h4>
                            <p className="text-[8px] md:text-xs lg:text-sm text-gray-500 leading-relaxed font-bold uppercase tracking-widest opacity-80">Claim your DNR rewards for maintaining a high ESG score in the Enclave.</p>
                        </div>
                    </div>
                    <button className="w-full btn-launch !bg-neon-green !text-deep-space py-4 md:py-8 lg:py-10 lg:text-xl font-black hover:shadow-[0_0_40px_rgba(34,197,94,0.5)] transition-all">
                        Claim {(score / 17).toFixed(2)} DNR
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

/* ============================================================
   RISK AI VIEW
   ============================================================ */
export const RiskAIView = () => {
    const [riskLevel, setRiskLevel] = useState(12);
    const [bars, setBars] = useState([40, 70, 45, 90, 65, 80, 50]);

    useEffect(() => {
        const interval = setInterval(() => {
            setRiskLevel(prev => Math.max(5, Math.min(45, prev + (Math.random() > 0.5 ? 2 : -2))));
            setBars(prev => prev.map(bar => Math.max(10, Math.min(100, bar + (Math.random() > 0.5 ? 5 : -5)))));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 md:space-y-8 pb-4">
            <ViewHeader
                icon={Activity} iconColor="text-red-400"
                iconBg="bg-red-400/10" iconBorder="border-red-400/20"
                title="Risk" highlight="Enclave"
                subtitle="AI-driven predictive security analysis"
            />

            <div className="glass-panel p-6 md:p-14 lg:p-20 rounded-2xl md:rounded-[3rem] lg:rounded-[4rem] relative overflow-hidden bg-gradient-to-br from-red-500/[0.05] to-transparent border-white/5 shadow-2xl">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 md:gap-16 items-center text-white relative z-10">
                    <div className="space-y-6 md:space-y-10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                                <span className="text-neon-green text-[8px] md:text-xs font-black uppercase tracking-[0.4em]">Simulator: Operational</span>
                            </div>
                            <h3 className="text-2xl md:text-5xl lg:text-7xl font-black text-white uppercase font-heading tracking-tighter leading-none">
                                Predatory <br /><span className="text-red-400">Pattern Sync</span>
                            </h3>
                            <p className="text-gray-500 text-xs md:text-xl leading-relaxed uppercase font-bold tracking-widest max-w-[500px]">
                                Our AI flagged a <span className="text-red-400 font-black">{riskLevel}%</span> risk volatility in Shard-Partition liquidity.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-4 md:gap-6">
                            <button className="btn-launch !bg-red-400 !text-deep-space px-8 md:px-12 py-4 md:py-7 lg:text-lg font-black shadow-lg shadow-red-500/20">Restrict Pulse</button>
                            <button className="btn-outline px-8 md:px-12 py-4 md:py-7 lg:text-lg font-black">Authorize Risk</button>
                        </div>
                    </div>

                    {/* Chart Container */}
                    <div className="h-48 md:h-72 lg:h-96 glass-panel border-white/5 bg-black/40 rounded-2xl md:rounded-[2.5rem] flex flex-col items-center justify-center p-6 md:p-12 relative">
                        <div className="absolute top-6 left-6 text-[8px] md:text-xs font-black text-gray-600 uppercase tracking-widest">Real-time Oscilloscope</div>
                        <div className="w-full h-full flex items-end gap-2 md:gap-4 mt-6">
                            {bars.map((h, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ height: `${h}%` }}
                                    transition={{ type: 'spring', stiffness: 50, damping: 10 }}
                                    className={`w-full bg-gradient-to-t ${riskLevel > 25 ? 'from-red-600 to-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'from-cyan-600 to-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]'} rounded-t-xl transition-colors duration-700`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

/* ============================================================
   SUBNET VIEW
   ============================================================ */
export const SubNetView = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 md:space-y-8 pb-4">
        <ViewHeader
            icon={Globe} iconColor="text-blue-400"
            iconBg="bg-blue-400/10" iconBorder="border-blue-400/20"
            title="Network" highlight="Sub-Nets"
            subtitle="Enterprise partition and sidechain management"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {['Finance-XL', 'Gaming-Core', 'Gov-Enclave', 'Data-Lake', 'Shard-Omega', 'AI-Grid'].map((net) => (
                <div key={net} className="glass-panel p-5 md:p-10 rounded-2xl md:rounded-[2.5rem] space-y-6 md:space-y-10 hover:bg-white/[0.05] transition-all group border-white/5 shadow-xl">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 md:w-16 md:h-16 bg-blue-400/10 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-400/20 group-hover:border-blue-400/50 transition-all shadow-blue">
                            <Network className="size-5 md:size-9" />
                        </div>
                        <span className="text-neon-green text-[8px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_15px_rgba(34,197,94,0.6)]" /> Active
                        </span>
                    </div>
                    <div>
                        <h4 className="text-xl md:text-3xl font-black text-white uppercase font-heading tracking-tighter leading-none">{net}</h4>
                        <p className="text-[8px] md:text-xs text-gray-500 font-bold uppercase tracking-[0.4em] mt-3 italic opacity-60">Partition Shard ID: 0x{Math.floor(Math.random() * 10000)}</p>
                    </div>
                    <button className="w-full py-4 md:py-6 border border-white/5 bg-white/5 rounded-2xl text-[9px] md:text-xs font-black uppercase tracking-[0.4em] group-hover:bg-blue-400 group-hover:text-deep-space group-hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-all">
                        Sync Shard
                    </button>
                </div>
            ))}
        </div>
    </motion.div>
);

/* ============================================================
   STABLE VIEW
   ============================================================ */
export const StableView = () => {
    const { address, balance, network, privateKey, showNotification } = useWalletStore();
    const [collateral, setCollateral] = useState('');
    const [isMinting, setIsMinting] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);

    const kUSDAmount = useMemo(() => collateralService.calculateMintAmount(collateral), [collateral]);

    const handleMint = async () => {
        if (!address || !privateKey) return showNotification('No Enclave session.', 'error');
        if (!collateral || parseFloat(collateral) <= 0) return showNotification('Input amount.', 'error');
        setIsMinting(true);
        try {
            const hash = await collateralService.mintKUSD(address, collateral, network, privateKey);
            setTxHash(hash);
            setCollateral('');
            showNotification(`Minting pulse broadcasted! Hash: ${hash.slice(0, 10)}...`, 'success');
        } catch (error: any) {
            showNotification(`Minting failed: ${error.message}`, 'error');
        } finally {
            setIsMinting(false);
        }
    };


    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 md:space-y-8 pb-4">
            <ViewHeader
                icon={Database} iconColor="text-purple-400"
                iconBg="bg-purple-400/10" iconBorder="border-purple-400/20"
                title="Stable" highlight="Issue"
                subtitle="Secure collateralized asset minting"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                {/* Mint Form */}
                <div className="glass-panel p-6 md:p-12 lg:p-16 rounded-2xl md:rounded-[3rem] lg:rounded-[4rem] space-y-6 md:space-y-10 border-white/5 bg-gradient-to-br from-white/[0.04] to-transparent shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
                    <h3 className="text-xl md:text-3xl lg:text-4xl font-black text-white uppercase tracking-tighter leading-none">Mint Enclave Stable</h3>

                    <div className="space-y-6 md:space-y-10">
                        <div className="space-y-3">
                            <div className="flex justify-between px-2 items-end">
                                <label className="text-[8px] md:text-xs font-black text-gray-500 uppercase tracking-[0.3em]">Collateral (DNR Enclave)</label>
                                <span className="text-[8px] md:text-sm font-black text-cyan-400 uppercase cursor-pointer hover:text-white transition-colors tracking-widest" onClick={() => setCollateral(balance)}>MAX: {balance} DNR</span>
                            </div>
                            <div className="relative group">
                                <input
                                    type="number"
                                    value={collateral}
                                    onChange={(e) => setCollateral(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl md:rounded-[2rem] p-5 md:p-10 text-3xl md:text-6xl lg:text-7xl font-black text-white outline-none focus:border-cyan-400/50 transition-all placeholder-white/5 shadow-inner group-hover:bg-white/[0.08]"
                                    placeholder="0.00"
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 text-white font-black text-xl hidden md:block">DNR</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-center relative">
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent absolute" />
                            <div className="p-4 md:p-7 bg-deep-space rounded-full border border-white/10 shadow-purple relative z-10 animate-pulse">
                                <ArrowDownLeft className="size-6 md:size-10 text-purple-400" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[8px] md:text-xs font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Receive kUSD Pulse</label>
                            <div className="relative group">
                                <input
                                    className="w-full bg-purple-400/5 border border-purple-400/20 rounded-2xl md:rounded-[2rem] p-5 md:p-10 text-3xl md:text-6xl lg:text-7xl font-black text-purple-400 outline-none shadow-inner"
                                    value={kUSDAmount}
                                    readOnly
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 text-purple-400 font-black text-xl hidden md:block">kUSD</div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleMint}
                        disabled={isMinting}
                        className="w-full btn-launch !bg-purple-400 !text-deep-space py-5 md:py-10 lg:text-2xl font-black disabled:opacity-50 gap-4 shadow-purple hover:shadow-[0_0_50px_rgba(192,132,252,0.4)] transition-all"
                    >
                        {isMinting ? (
                            <div className="w-6 h-6 border-4 border-black border-t-transparent animate-spin rounded-full" />
                        ) : (
                            <>
                                <Database size={24} />
                                <span>Initiate Minting Pulse</span>
                            </>
                        )}
                    </button>

                    {txHash && (
                        <div
                            className="p-5 bg-neon-green/10 border border-neon-green/20 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-neon-green/20 transition-all shadow-xl"
                            onClick={() => window.open(`https://poseidon-explorer.testnet.kortana.xyz/tx/${txHash}`, '_blank')}
                        >
                            <div className="space-y-1 min-w-0">
                                <p className="text-[9px] md:text-xs font-black text-neon-green uppercase tracking-[0.3em]">Transaction Verified and Broadcasted</p>
                                <p className="text-[10px] md:text-sm font-mono text-white/50 truncate font-bold">{txHash}</p>
                            </div>
                            <ExternalLink size={18} className="text-neon-green shrink-0 ml-4" />
                        </div>
                    )}
                </div>

                {/* Info Panels */}
                <div className="space-y-6 md:space-y-12">
                    <div className="glass-panel p-6 md:p-12 lg:p-16 rounded-2xl md:rounded-[3rem] lg:rounded-[4rem] bg-purple-400/5 border-purple-400/10 relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-48 h-48 lg:w-80 lg:h-80 bg-purple-400/20 rounded-full blur-[100px] group-hover:scale-125 transition-transform duration-[3s]" />
                        <h4 className="font-black text-white uppercase tracking-[0.4em] mb-6 text-xs md:text-xl opacity-60 italic">Minting Equilibrium</h4>
                        <div className="flex items-baseline gap-4">
                            <span className="text-5xl md:text-8xl lg:text-9xl font-black text-white font-heading tracking-tighter shadow-purple">150%</span>
                            <span className="text-purple-400 font-black text-[10px] md:text-2xl uppercase tracking-widest pt-2">Over-Collateralized</span>
                        </div>
                        <p className="text-[8px] md:text-sm text-gray-500 font-bold uppercase tracking-[0.4em] mt-8 bg-white/5 w-fit px-4 py-2 rounded-full border border-white/5">Safe liquidation threshold: 110%</p>
                    </div>

                    <div className="glass-panel p-6 md:p-12 lg:p-16 rounded-2xl md:rounded-[3rem] lg:rounded-[4rem] space-y-8 md:space-y-12 border-white/5 shadow-2xl relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/5 rounded-full blur-[100px] pointer-events-none" />
                        <div className="space-y-4">
                            <p className="text-[9px] md:text-sm font-black text-gray-500 uppercase tracking-[0.5em]">Global Stability Reserve</p>
                            <div className="flex justify-between items-end flex-wrap gap-4">
                                <span className="text-4xl md:text-7xl font-black text-white font-heading tracking-tighter">$10.42M <span className="text-xs md:text-xl text-gray-600 font-bold uppercase tracking-widest">USD</span></span>
                                <div className="px-4 py-2 bg-neon-green/10 rounded-full border border-neon-green/20">
                                    <span className="text-neon-green text-[10px] md:text-lg font-black uppercase tracking-widest">+2.4% / Week</span>
                                </div>
                            </div>
                        </div>
                        <div className="w-full h-3 md:h-6 bg-white/5 rounded-full overflow-hidden p-1 md:p-1.5 border border-white/10 shadow-inner">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '42%' }}
                                transition={{ duration: 2.5, ease: "circOut" }}
                                className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-neon-green shadow-[0_0_30px_rgba(6,182,212,0.5)] rounded-full"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6 md:gap-12">
                            <div className="space-y-2">
                                <p className="text-[9px] md:text-xs font-black text-gray-500 uppercase tracking-[0.3em]">Collateral Locked</p>
                                <p className="font-black text-xl md:text-4xl text-white font-heading tracking-tight">8.42M <span className="text-[10px] md:text-lg text-gray-500">DNR</span></p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[9px] md:text-xs font-black text-gray-500 uppercase tracking-[0.3em]">In Circulation</p>
                                <p className="font-black text-xl md:text-4xl text-purple-400 font-heading tracking-tight">5.61M <span className="text-[10px] md:text-lg text-gray-500">kUSD</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
