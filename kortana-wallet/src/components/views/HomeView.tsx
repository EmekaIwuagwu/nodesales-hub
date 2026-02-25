'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    ShieldCheck, Leaf, Database, Activity, Globe,
    TrendingUp, Send, ArrowDownLeft
} from 'lucide-react';

interface HomeViewProps {
    balance: string;
    network: string;
    onFeatureClick: (id: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ balance, network, onFeatureClick }) => {
    const features = [
        { id: 'compliance', title: 'ZK Compliance', icon: ShieldCheck, color: 'text-cyan-400', bg: 'bg-cyan-400/10', desc: 'Privacy-first KYC/AML verification' },
        { id: 'esg', title: 'ESG Impact', icon: Leaf, color: 'text-neon-green', bg: 'bg-neon-green/10', desc: 'Sustainability & rewards tracking' },
        { id: 'stable', title: 'Stable Issue', icon: Database, color: 'text-purple-400', bg: 'bg-purple-400/10', desc: 'Secure fiat-backed issuance' },
        { id: 'risk', title: 'Risk AI', icon: Activity, color: 'text-red-400', bg: 'bg-red-400/10', desc: 'AI simulations for DeFi actions' },
        { id: 'subnet', title: 'Sub-Nets', icon: Globe, color: 'text-blue-400', bg: 'bg-blue-400/10', desc: 'Enterprise permissioned networks' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-12 pb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div className="md:col-span-2 relative glass-panel rounded-[1.5rem] md:rounded-[3rem] overflow-hidden border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent p-6 md:p-12 flex flex-col justify-between min-h-[200px] md:min-h-[400px]">
                    <div className="absolute top-0 right-0 p-6 md:p-12 opacity-5 select-none pointer-events-none">
                        <TrendingUp className="size-20 md:size-60" strokeWidth={1} />
                    </div>
                    <div className="space-y-1 md:space-y-2 relative z-10">
                        <p className="text-gray-500 font-bold uppercase tracking-[0.4em] text-[7px] md:text-[10px]">Total Balance Home</p>
                        <div className="flex items-baseline gap-1.5 md:gap-4 flex-wrap">
                            <h2 className="text-2xl md:text-8xl font-black tracking-tighter text-white font-heading leading-none">
                                {Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h2>
                            <span className="text-base md:text-4xl font-black text-gray-700 font-heading">DNR</span>
                        </div>
                        <div className="flex items-center gap-4 pt-1 md:pt-2">
                            <p className="text-xs md:text-2xl font-bold text-gray-400">$(calculating...) <span className="text-neon-green text-[9px] md:text-sm font-black ml-1 md:ml-2">+0.0%</span></p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-3 pt-4 md:pt-12 relative z-10">
                        <button onClick={() => onFeatureClick('transact')} className="btn-launch">
                            <Send className="size-3.5 md:size-4 inline mr-2" /> <span>Send</span>
                        </button>
                        <button onClick={() => onFeatureClick('receive')} className="btn-outline">
                            <ArrowDownLeft className="size-3.5 md:size-4 text-cyan-400 inline mr-2" /> <span>Receive</span>
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 md:gap-8">
                    <div className="glass-panel p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col justify-between">
                        <div>
                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Staking APY</p>
                            <h4 className="text-2xl md:text-4xl font-black text-white font-heading">18.4% <span className="text-neon-green text-[10px] font-bold font-sans">DNR</span></h4>
                        </div>
                        <div className="w-full h-1 md:h-1.5 bg-white/5 rounded-full overflow-hidden mt-2 md:mt-4">
                            <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} transition={{ duration: 1.5 }} className="h-full bg-gradient-to-r from-purple-500 to-cyan-500" />
                        </div>
                    </div>
                    <div className="glass-panel p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] bg-cyan-400/5 relative overflow-hidden group min-h-[140px]">
                        <div className="absolute top-[-20%] right-[-10%] w-24 md:w-32 h-24 md:h-32 bg-cyan-400/20 rounded-full blur-2xl md:blur-3xl group-hover:bg-cyan-400/40 transition-all duration-700" />
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-cyan-400/60 mb-1">Active Network</p>
                        <h4 className="text-xl md:text-3xl font-black text-white font-heading uppercase tracking-tight">{network}</h4>
                    </div>
                </div>
            </div>

            <section className="space-y-6 md:space-y-8">
                <div className="flex items-center justify-between px-2 border-l-3 md:border-l-4 border-cyan-400 pl-4 md:pl-6">
                    <div>
                        <h3 className="text-xl md:text-3xl font-black tracking-tighter text-white font-heading uppercase">Proprietary Enclave</h3>
                        <p className="text-[9px] md:text-xs text-gray-500 font-bold uppercase tracking-[0.3em]">Hardware-level protocol integrations</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-6">
                    {features.map((feature) => (
                        <motion.button
                            key={feature.id}
                            whileHover={{ y: -4, scale: 1.02 }}
                            onClick={() => onFeatureClick(feature.id)}
                            className="glass-panel p-4 md:p-8 text-left group hover:bg-white/[0.05] relative overflow-hidden border-white/5 rounded-xl md:rounded-[2rem]"
                        >
                            <div className={`w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl ${feature.bg} flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-all duration-500`}>
                                <feature.icon className={`${feature.color} group-hover:rotate-12 transition-transform`} size={18} />
                            </div>
                            <h4 className="font-black text-[10px] md:text-lg text-white mb-1 md:mb-2 leading-tight uppercase font-heading tracking-tight">{feature.title}</h4>
                            <p className="text-[7px] md:text-[10px] text-gray-500 leading-relaxed font-bold uppercase tracking-wide line-clamp-2">{feature.desc}</p>
                        </motion.button>
                    ))}
                </div>
            </section>
        </motion.div>
    );
};
