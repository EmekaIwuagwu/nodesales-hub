'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { priceService } from '@/lib/PriceService';
import {
    ShieldCheck, Leaf, Database, Activity, Globe,
    TrendingUp, Send, ArrowDownLeft
} from 'lucide-react';

interface HomeViewProps {
    balance: string;
    network: string;
    tokens: any[];
    onFeatureClick: (id: string) => void;
    onRegisterToken: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ balance, network, tokens, onFeatureClick, onRegisterToken }) => {

    const dnrPrice = priceService.calculateValue(balance, 'DNR');
    const dnrChange = priceService.get24hChange('DNR');

    const features = [
        { id: 'compliance', title: 'ZK Compliance', icon: ShieldCheck, color: 'text-cyan-400', bg: 'bg-cyan-400/10', desc: 'Privacy-first KYC/AML' },
        { id: 'esg', title: 'ESG Impact', icon: Leaf, color: 'text-neon-green', bg: 'bg-neon-green/10', desc: 'Sustainability tracking' },
        { id: 'stable', title: 'Stable Issue', icon: Database, color: 'text-purple-400', bg: 'bg-purple-400/10', desc: 'Fiat-backed issuance' },
        { id: 'risk', title: 'Risk AI', icon: Activity, color: 'text-red-400', bg: 'bg-red-400/10', desc: 'AI DeFi simulations' },
        { id: 'subnet', title: 'Sub-Nets', icon: Globe, color: 'text-blue-400', bg: 'bg-blue-400/10', desc: 'Enterprise networks' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 md:space-y-8 pb-4">

            {/* Balance + Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">

                {/* Balance Hero */}
                <div className="sm:col-span-2 relative glass-panel rounded-2xl md:rounded-[2.5rem] lg:rounded-[3.5rem] overflow-hidden border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-4 sm:p-6 md:p-12 lg:p-20 flex flex-col justify-between min-h-[180px] md:min-h-[320px] lg:min-h-[450px] shadow-2xl group">
                    <div className="absolute top-0 right-0 p-4 md:p-10 lg:p-16 opacity-10 select-none pointer-events-none group-hover:scale-110 transition-transform duration-[5s]">
                        <TrendingUp className="size-32 md:size-64 xl:size-96" strokeWidth={0.5} />
                    </div>
                    <div className="absolute -top-24 -left-24 w-64 h-64 lg:w-96 lg:h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />

                    <div className="space-y-3 md:space-y-4 relative z-10">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-neon-green shadow-green animate-ping" />
                            <p className="text-gray-500 font-black uppercase tracking-[0.5em] text-[8px] md:text-[10px] lg:text-xs">Enclave Total Liquidity</p>
                        </div>
                        <div className="flex items-baseline gap-2 md:gap-4 flex-wrap">
                            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter text-white font-heading leading-none text-glow-white">
                                {Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h2>
                            <span className="text-sm sm:text-xl md:text-3xl lg:text-4xl font-black text-gray-800 font-heading tracking-tighter">DNR</span>
                        </div>
                        <div className="flex items-center gap-3 pt-1 md:pt-2">
                            <p className="text-xs md:text-lg lg:text-xl font-bold text-gray-400">${dnrPrice} <span className="text-neon-green text-[8px] md:text-xs lg:text-sm font-black ml-2 px-2 py-0.5 bg-neon-green/10 rounded-full">{dnrChange}</span></p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-4 pt-4 md:pt-8 relative z-10">
                        <button onClick={() => onFeatureClick('transact')} className="btn-launch text-xs md:text-sm px-6 py-2.5">
                            <Send className="size-3.5 md:size-4 inline" /> <span className="ml-1">Send Assets</span>
                        </button>
                        <button onClick={() => onFeatureClick('receive')} className="btn-outline text-xs md:text-sm px-6 py-2.5">
                            <ArrowDownLeft className="size-3.5 md:size-4 text-cyan-400" /> <span className="ml-1">Receive</span>
                        </button>
                    </div>
                </div>

                {/* Side Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-1 xl:col-span-2 xl:grid-cols-2 gap-3 md:gap-5 lg:gap-8">
                    <div className="glass-panel p-4 md:p-8 lg:p-10 rounded-2xl md:rounded-[2.5rem] lg:rounded-[3rem] flex flex-col justify-between min-h-[100px] md:min-h-[160px] lg:min-h-full transition-all hover:bg-white/[0.05] border-white/5 shadow-2xl group overflow-hidden relative">
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                        <div>
                            <p className="text-[8px] md:text-xs xl:text-sm font-black uppercase tracking-[0.4em] text-gray-500 mb-2 md:mb-4">Staking APY</p>
                            <h4 className="text-xl md:text-4xl xl:text-5xl font-black text-white font-heading tracking-tighter">18.4% <span className="text-neon-green text-[10px] xl:text-xl font-bold font-sans tracking-normal pt-1 block md:inline">DNR PROTOCOL</span></h4>
                        </div>
                        <div className="w-full h-1.5 lg:h-3 bg-white/5 rounded-full overflow-hidden mt-4 md:mt-8 p-0.5 border border-white/10 shadow-inner">
                            <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} transition={{ duration: 1.5, ease: "circOut" }} className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)] rounded-full" />
                        </div>
                    </div>
                    <div className="glass-panel p-4 md:p-8 lg:p-10 rounded-2xl md:rounded-[2.5rem] lg:rounded-[3rem] bg-cyan-400/5 relative overflow-hidden group min-h-[100px] md:min-h-[160px] lg:min-h-full transition-all hover:bg-cyan-400/10 border-cyan-400/10 shadow-2xl">
                        <div className="absolute -top-20 -right-20 w-48 h-48 md:w-80 md:h-80 bg-cyan-400/10 rounded-full blur-[100px] group-hover:bg-cyan-400/20 transition-all duration-1000" />
                        <p className="text-[8px] md:text-xs xl:text-sm font-black uppercase tracking-[0.4em] text-cyan-400 mb-2 md:mb-4 text-glow-cyan">Network Status</p>
                        <h4 className="text-lg md:text-3xl xl:text-5xl font-black text-white font-heading uppercase tracking-tight leading-loose mb-1 md:mb-4">{network}</h4>
                        <div className="text-[7px] md:text-[9px] xl:text-xs text-cyan-400/60 font-black tracking-[0.2em] uppercase truncate bg-cyan-400/10 w-fit px-3 py-1.5 rounded-full border border-cyan-400/20">
                            {network === 'mainnet' ? 'ZEUS-KRT-MAIN' : 'POSEIDON-KRT-TEST'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Assets Section */}
            <section className="space-y-3 md:space-y-5 lg:space-y-8">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-lg md:text-2xl lg:text-4xl font-black tracking-tighter text-white font-heading uppercase">
                        Assets <span className="text-white/20">Enclave</span>
                    </h3>
                    <button
                        onClick={onRegisterToken}
                        className="text-[8px] md:text-px lg:text-[10px] font-black text-cyan-400 uppercase tracking-widest px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-cyan-400/10 hover:border-cyan-400 transition-all shadow-lg hover:shadow-cyan-400/10"
                    >
                        + Register Asset
                    </button>
                </div>

                <div className="glass-panel rounded-2xl md:rounded-[2rem] lg:rounded-[3rem] border-white/5 overflow-hidden transition-all shadow-xl">
                    <div className="divide-y divide-white/5">
                        {/* Native DNR Row */}
                        <div className="flex items-center justify-between px-4 md:px-10 lg:px-16 py-6 md:py-10 lg:py-14 hover:bg-white/[0.03] transition-all group relative overflow-hidden">
                            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-cyan-400/0 via-cyan-400 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center gap-4 md:gap-7 lg:gap-10 min-w-0 relative z-10">
                                <div className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-white/10 rounded-2xl md:rounded-3xl lg:rounded-[2rem] flex items-center justify-center font-black text-white text-lg md:text-2xl lg:text-3xl border-2 border-white/5 group-hover:border-cyan-400/50 transition-all shrink-0 shadow-2xl">
                                    D
                                </div>
                                <div className="space-y-1 md:space-y-2 min-w-0">
                                    <h4 className="text-lg md:text-2xl lg:text-3xl font-black text-white leading-none uppercase tracking-tighter">Kortana DNR</h4>
                                    <p className="text-[8px] md:text-xs lg:text-sm font-bold text-gray-500 uppercase tracking-[0.4em] opacity-60">Native Blockchain Protocol Asset</p>
                                </div>
                            </div>
                            <div className="text-right space-y-1 md:space-y-3 shrink-0 relative z-10">
                                <p className="text-xl md:text-4xl lg:text-6xl font-black text-white font-heading tracking-tighter shadow-white">
                                    {Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                                <div className="flex items-center justify-end gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-neon-green shadow-green animate-pulse" />
                                    <p className="text-[8px] md:text-xs lg:text-sm font-black text-neon-green uppercase tracking-[0.4em] text-glow-green">Unlocked & Synchronized</p>
                                </div>
                            </div>
                        </div>

                        {/* Token Rows */}
                        {tokens.map((token, i) => (
                            <div key={i} className="flex items-center justify-between px-4 md:px-8 lg:px-12 py-4 md:py-6 lg:py-10 hover:bg-white/[0.02] transition-colors group">
                                <div className="flex items-center gap-3 md:gap-5 lg:gap-8 min-w-0">
                                    <div className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-purple-400/10 rounded-2xl lg:rounded-[1.5rem] flex items-center justify-center font-black text-purple-400 text-sm md:text-lg lg:text-2xl border border-purple-400/20 group-hover:border-purple-400 transition-colors shrink-0 shadow-inner">
                                        {token.symbol?.[0] || 'T'}
                                    </div>
                                    <div className="space-y-0.5 min-w-0">
                                        <h4 className="text-sm md:text-lg lg:text-2xl font-black text-white leading-none">{token.symbol}</h4>
                                        <p className="text-[7px] md:text-[9px] lg:text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] truncate">{token.name}</p>
                                    </div>
                                </div>
                                <div className="text-right space-y-0.5 shrink-0">
                                    <p className="text-base md:text-2xl lg:text-4xl font-black text-white font-heading">
                                        {Number(token.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                    <p className="text-[7px] md:text-[9px] lg:text-xs font-bold text-gray-600 uppercase tracking-widest font-mono">
                                        {token.address.slice(0, 10)}...{token.address.slice(-8)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="space-y-3 md:space-y-5 lg:space-y-8">
                <h3 className="text-[10px] md:text-xl font-black uppercase tracking-[0.5em] text-gray-600 px-2 lg:mb-4">Enclave Protocol Modules</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 md:gap-5 lg:gap-8">
                    {features.map((feature) => (
                        <motion.button
                            key={feature.id}
                            whileHover={{ y: -8, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onFeatureClick(feature.id)}
                            className="glass-panel p-3 md:p-6 lg:p-10 text-left group hover:bg-white/[0.08] relative overflow-hidden border-white/5 rounded-xl md:rounded-[2.5rem] transition-all shadow-xl min-h-[110px] md:min-h-[240px] lg:min-h-[300px] flex flex-col justify-end"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 lg:w-48 lg:h-48 bg-white/[0.01] rounded-full blur-3xl group-hover:bg-white/[0.04] transition-all duration-700" />
                            <div className={`w-10 h-10 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 rounded-xl lg:rounded-[2rem] ${feature.bg} flex items-center justify-center mb-4 md:mb-8 lg:mb-10 group-hover:scale-110 transition-all duration-500 shrink-0 shadow-xl border border-white/5`}>
                                <feature.icon className={`${feature.color} group-hover:rotate-12 transition-transform`} size={window.innerWidth > 1024 ? 48 : 24} />
                            </div>
                            <div className="space-y-1 md:space-y-3">
                                <h4 className="font-black text-[9px] md:text-base lg:text-2xl text-white leading-none uppercase font-heading tracking-tighter">{feature.title}</h4>
                                <p className="text-[6px] md:text-[10px] lg:text-xs text-gray-500 leading-none font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden text-ellipsis">{feature.desc}</p>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </section>

        </motion.div>
    );
};
