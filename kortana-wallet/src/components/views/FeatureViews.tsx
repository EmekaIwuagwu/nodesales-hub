'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    ShieldCheck, Fingerprint, Lock as LockIcon, Leaf,
    Activity, Globe, Network, Database, ChevronRight,
    ArrowUpRight, Zap, ArrowDownLeft
} from 'lucide-react';

export const ComplianceView = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 md:space-y-12">
        <div className="flex items-center gap-4 md:gap-6">
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-cyan-400/10 flex items-center justify-center text-cyan-400 border border-cyan-400/20 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                <ShieldCheck className="size-8 md:size-10" />
            </div>
            <div>
                <h2 className="text-2xl md:text-5xl font-black text-white uppercase font-heading">ZK <span className="text-gradient-kortana">Compliance</span></h2>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px] md:text-xs">Privacy-preserving identity verification enclave</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="glass-panel p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] space-y-6 md:space-y-8">
                <h3 className="text-xl md:text-2xl font-black text-white uppercase font-heading tracking-tight">Active Credentials</h3>
                <div className="space-y-4">
                    <div className="p-4 md:p-6 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl flex items-center justify-between text-white">
                        <div className="flex items-center gap-3 md:gap-4">
                            <Fingerprint className="text-cyan-400 size-5 md:size-6" />
                            <span className="font-bold text-white uppercase text-xs md:text-sm">Biometric Shield</span>
                        </div>
                        <span className="text-neon-green text-[8px] md:text-[10px] font-black uppercase tracking-widest">Verified</span>
                    </div>
                </div>
                <button className="w-full btn-launch mt-4 py-3 md:py-4 text-xs md:text-base">Generate ZK Proof</button>
            </div>
            <div className="glass-panel p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-gradient-to-br from-cyan-500/5 to-transparent flex flex-col justify-center items-center text-center space-y-4 md:space-y-6">
                <div className="relative">
                    <div className="w-20 h-20 md:w-32 md:h-32 rounded-full border-3 md:border-4 border-dashed border-cyan-400/30 animate-spin-slow" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <LockIcon className="text-cyan-400 size-6 md:size-8" />
                    </div>
                </div>
                <div>
                    <h4 className="font-black text-white uppercase mb-2 text-sm md:text-base">Anonymous Auth</h4>
                    <p className="text-[10px] md:text-xs text-gray-500 max-w-[240px]">Prove eligibility without revealing sensitive personal data using Zero-Knowledge proofs.</p>
                </div>
            </div>
        </div>
    </motion.div>
);

export const ESGView = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 md:space-y-12">
        <div className="flex items-center gap-4 md:gap-6">
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-neon-green/10 flex items-center justify-center text-neon-green border border-neon-green/20">
                <Leaf className="size-8 md:size-10" />
            </div>
            <div>
                <h2 className="text-2xl md:text-5xl font-black text-white uppercase font-heading">ESG <span className="text-gradient-kortana">Impact</span></h2>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px] md:text-xs">Sustainability rewards & ecological scoring</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 glass-panel p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-48 md:w-64 h-48 md:h-64 bg-neon-green/10 rounded-full blur-[80px] md:blur-[100px]" />
                <div className="flex items-baseline gap-2 md:gap-4 mb-2 flex-wrap">
                    <h3 className="text-5xl md:text-8xl font-black text-white font-heading">850</h3>
                    <span className="text-neon-green font-black uppercase tracking-widest text-xs md:text-base">Impact Score</span>
                </div>
                <p className="text-gray-400 font-bold uppercase text-[9px] md:text-xs tracking-[0.2em] mb-8 md:mb-12">Kortana Ecological Footprint Rating</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                    <div className="p-4 md:p-6 bg-white/5 rounded-2xl md:rounded-3xl border border-white/5">
                        <p className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Carbon Saved</p>
                        <p className="text-xl md:text-2xl font-black text-white">1.24 T</p>
                    </div>
                </div>
            </div>
            <div className="glass-panel p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] flex flex-col justify-between gap-6">
                <div className="space-y-3 md:space-y-4 text-white">
                    <h4 className="text-lg md:text-xl font-black text-white uppercase text-white">Green Rewards</h4>
                    <p className="text-[10px] md:text-xs text-gray-500">Claim your DNR rewards for maintaining a high ESG score this month.</p>
                </div>
                <button className="w-full btn-launch !bg-neon-green !text-deep-space py-3 md:py-4 text-xs md:text-base">Claim 50.00 DNR</button>
            </div>
        </div>
    </motion.div>
);

export const RiskAIView = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 md:space-y-12">
        <div className="flex items-center gap-4 md:gap-6">
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-red-400/10 flex items-center justify-center text-red-400 border border-red-400/20">
                <Activity className="size-8 md:size-10" />
            </div>
            <div>
                <h2 className="text-2xl md:text-5xl font-black text-white uppercase font-heading">Risk <span className="text-gradient-kortana">Enclave</span></h2>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px] md:text-xs">AI-driven predictive security analysis</p>
            </div>
        </div>

        <div className="glass-panel p-6 md:p-12 rounded-[2rem] md:rounded-[4rem] relative overflow-hidden bg-gradient-to-br from-red-500/[0.03] to-transparent">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center text-white">
                <div className="space-y-4 md:space-y-8">
                    <div className="space-y-2">
                        <span className="text-neon-green text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em]">Simulator Status: Online</span>
                        <h3 className="text-2xl md:text-4xl font-black text-white uppercase font-heading tracking-tight">Predatory <span className="text-red-400">Pattern</span></h3>
                        <p className="text-gray-500 text-[10px] md:text-sm leading-relaxed">Our AI has simulated your next 100 potential transactions. We have flagged a 12% risk increase in Sub-Net liquidity pools.</p>
                    </div>
                    <div className="flex gap-3 md:gap-4">
                        <button className="flex-1 sm:flex-none px-4 md:px-8 py-3 md:py-4 bg-red-400 text-deep-space font-black uppercase text-[10px] md:text-xs rounded-xl md:rounded-2xl">Restrict</button>
                        <button className="flex-1 sm:flex-none px-4 md:px-8 py-3 md:py-4 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] md:text-xs rounded-xl md:rounded-2xl">Ignore</button>
                    </div>
                </div>
                <div className="h-48 md:h-64 glass-panel border-white/5 bg-black/40 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center p-4 md:p-8">
                    <div className="w-full h-full flex items-end gap-2 md:gap-3 justify-between">
                        {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ delay: i * 0.1, duration: 1 }}
                                className="w-full bg-gradient-to-t from-red-500/20 to-red-400 rounded-t-lg"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
);

export const SubNetView = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 md:space-y-12">
        <div className="flex items-center gap-4 md:gap-6">
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-blue-400/10 flex items-center justify-center text-blue-400 border border-blue-400/20">
                <Globe className="size-8 md:size-10" />
            </div>
            <div>
                <h2 className="text-2xl md:text-5xl font-black text-white uppercase font-heading">Network <span className="text-gradient-kortana">Sub-Nets</span></h2>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px] md:text-xs">Enterprise partition and sidechain management</p>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            {['Finance-XL', 'Gaming-Core', 'Gov-Enclave'].map((net) => (
                <div key={net} className="glass-panel p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] space-y-4 md:space-y-6 hover:bg-white/[0.04] transition-all group">
                    <div className="flex items-center justify-between">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-400/10 rounded-xl flex items-center justify-center text-blue-400">
                            <Network className="size-4 md:size-5" />
                        </div>
                        <span className="text-neon-green text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-neon-green" /> Connected</span>
                    </div>
                    <div>
                        <h4 className="text-xl md:text-2xl font-black text-white uppercase font-heading tracking-tight">{net}</h4>
                        <p className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest">Shard ID: 9283-XLM</p>
                    </div>
                    <button className="w-full py-3 md:py-4 border border-white/5 bg-white/5 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest group-hover:bg-blue-400 group-hover:text-deep-space transition-all">Switch</button>
                </div>
            ))}
        </div>
    </motion.div>
);

export const StableView = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 md:space-y-12">
        <div className="flex items-center gap-4 md:gap-6">
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-purple-400/10 flex items-center justify-center text-purple-400 border border-purple-400/20">
                <Database className="size-8 md:size-10" />
            </div>
            <div>
                <h2 className="text-2xl md:text-5xl font-black text-white uppercase font-heading">Stable <span className="text-gradient-kortana">Issue</span></h2>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px] md:text-xs">Secure collateralized asset minting</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 text-white">
            <div className="glass-panel p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] space-y-6 md:space-y-10">
                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight text-white">Mint Enclave Stable</h3>
                <div className="space-y-4 md:space-y-6">
                    <div className="space-y-2 md:space-y-3">
                        <label className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 text-white">Collateral Amount (DNR)</label>
                        <input className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 text-xl md:text-2xl font-black text-white outline-none" placeholder="1000.00" />
                    </div>
                    <div className="flex items-center justify-center text-white/20">
                        <ArrowDownLeft className="size-6 md:size-8" />
                    </div>
                    <div className="space-y-2 md:space-y-3 text-white">
                        <label className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 text-white">Receive kUSD</label>
                        <input className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 text-xl md:text-2xl font-black text-white outline-none bg-cyan-400/5 border-cyan-400/20" placeholder="850.00" readOnly />
                    </div>
                </div>
                <button className="w-full btn-launch py-3 md:py-4 text-xs md:text-base">Confirm Minting</button>
            </div>

            <div className="space-y-6 md:space-y-8">
                <div className="glass-panel p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] bg-purple-400/5 border-purple-400/20 text-white">
                    <h4 className="font-black text-white uppercase tracking-tight mb-2 md:mb-4 text-sm md:text-base text-white">Minting Ratio</h4>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl md:text-6xl font-black text-white font-heading">150%</span>
                        <span className="text-purple-400 font-black text-[8px] md:text-xs uppercase">Over-Collateralized</span>
                    </div>
                </div>
                <div className="glass-panel p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] space-y-3 md:space-y-4 text-white">
                    <p className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest">Stablecoin Stability Pool</p>
                    <div className="space-y-2 md:space-y-3">
                        <div className="flex justify-between text-[10px] md:text-xs font-bold uppercase tracking-widest">
                            <span className="text-white">Global kUSD Cap</span>
                            <span className="text-cyan-400">$10,482,000</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="w-[42%] h-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
);

export const BridgeView = () => (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto space-y-8 md:space-y-12">
        <div className="text-center space-y-2 md:space-y-4">
            <h2 className="text-2xl md:text-6xl font-black tracking-tighter uppercase text-white font-heading">Cross-Chain <span className="text-gradient-kortana">Bridge</span></h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px] md:text-xs">Bridge your DNR assets between Kortana and other networks</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 relative items-center text-white">
            <div className="glass-panel p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] space-y-4 md:space-y-6">
                <p className="text-[9px] md:text-[10px] font-black text-cyan-400 uppercase tracking-widest">Source Network</p>
                <div className="bg-white/5 p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-cyan-400/20 rounded-lg md:rounded-xl flex items-center justify-center text-cyan-400 font-black text-sm md:text-base">K</div>
                        <span className="font-black text-white text-xs md:text-base uppercase tracking-tight">Kortana Mainnet</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-700" />
                </div>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center text-deep-space shadow-2xl hidden md:flex">
                <ArrowUpRight className="size-5 md:size-6 rotate-45" />
            </div>

            <div className="glass-panel p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] space-y-4 md:space-y-6">
                <p className="text-[9px] md:text-[10px] font-black text-purple-400 uppercase tracking-widest">Target Network</p>
                <div className="bg-white/5 p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/10 flex items-center justify-between group cursor-pointer hover:border-purple-500/50 transition-all">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-400/20 rounded-lg md:rounded-xl flex items-center justify-center text-purple-400 font-black text-sm md:text-base">E</div>
                        <span className="font-black text-white text-xs md:text-base uppercase tracking-tight">Ethereum Node</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="glass-panel p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] space-y-6 md:space-y-8 text-white">
            <div className="flex items-center justify-between px-2">
                <label className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest">Amount to Bridge</label>
                <span className="text-[9px] md:text-[10px] font-black text-cyan-400 uppercase tracking-widest cursor-pointer">Max Available</span>
            </div>
            <div className="relative">
                <input className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-8 text-2xl md:text-5xl font-black text-white font-heading focus:border-cyan-500/50 outline-none" placeholder="0.00" />
                <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 font-black text-gray-700 text-base md:text-2xl">DNR</div>
            </div>
            <div className="p-3 md:p-6 bg-cyan-400/5 rounded-xl md:rounded-2xl border border-cyan-400/10 flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                    <Zap className="text-cyan-400" size={14} />
                    <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-tight">Est. Finality Time</span>
                </div>
                <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest">~2.5 Sec</span>
            </div>
            <button className="w-full btn-launch !rounded-xl md:!rounded-2xl">Initiate Bridge</button>
        </div>
    </motion.div>
);
