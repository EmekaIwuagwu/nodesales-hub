"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Zap, Droplets, Wifi, Flame, Trash2, Thermometer, ArrowRight, CheckCircle2, Clock, Activity, Globe } from "lucide-react";

export default function UtilitiesPage() {
    const router = useRouter();

    const utilitiesData = [
        { id: "1", type: "electricity", icon: <Zap className="w-6 h-6" />, label: "Grid Electricity", bill: "45.00", due: "3 DAYS", usage: "1,240 kWh", status: "unpaid", color: "secondary-warm" },
        { id: "2", type: "water", icon: <Droplets className="w-6 h-6" />, label: "Hydro-Loop Unit", bill: "22.50", due: "12 DAYS", usage: "12.4 m³", status: "unpaid", color: "blue-400" },
        { id: "3", type: "internet", icon: <Wifi className="w-6 h-6" />, label: "Quantum Fiber 10G", bill: "35.00", due: "VERIFIED", usage: "840 GB", status: "paid", color: "primary-bright" },
        { id: "4", type: "gas", icon: <Flame className="w-6 h-6" />, label: "Thermal Buffer", bill: "18.20", due: "5 DAYS", usage: "45.2 m³", status: "unpaid", color: "orange-500" },
        { id: "5", type: "waste", icon: <Trash2 className="w-6 h-6" />, label: "Matter Reclamation", bill: "10.00", due: "VERIFIED", usage: "REGULAR", status: "paid", color: "success" },
        { id: "6", type: "heating", icon: <Thermometer className="w-6 h-6" />, label: "Sector Heating", bill: "28.40", due: "OVERDUE", usage: "4.2 GJ", status: "overdue", color: "error" },
    ];

    const currentUtilities = utilitiesData;

    const totalUnpaid = currentUtilities
        .filter(u => u.status !== 'paid')
        .reduce((acc, curr) => acc + parseFloat(curr.bill), 0);

    return (
        <div className="flex flex-col gap-16">
            {/* Header & Strategic Financial Pulse */}
            <div className="flex flex-col xl:flex-row gap-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="xl:w-1/3 sexy-card !bg-white/[0.01] flex flex-col items-center justify-center p-16 relative overflow-hidden text-center group"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-warm/5 blur-[100px] rounded-full pointer-events-none" />

                    <div className="relative w-64 h-64 mb-12">
                        {/* High-End Architectural Dial */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="128" cy="128" r="120" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="transparent" />
                            <circle
                                cx="128"
                                cy="128"
                                r="120"
                                stroke="#F59E0B"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={753.98}
                                strokeDashoffset={753.98 * (1 - totalUnpaid / 250)}
                                className="transition-all duration-[2s] ease-out"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
                            <span className="text-[10px] text-white/30 uppercase tracking-[0.5em] font-black leading-none">Global Due</span>
                            <div className="text-6xl text-white font-display font-black tracking-tighter">◈ {totalUnpaid.toFixed(2)}</div>
                            <span className="text-[9px] text-secondary-warm font-mono font-bold tracking-widest uppercase">STAKED DNR</span>
                        </div>
                    </div>

                    <button
                        className="btn-sexy-gold w-full text-center"
                    >
                        Execute Batch Audit <ArrowRight className="w-5 h-5" />
                    </button>
                </motion.div>

                <div className="xl:w-2/3 flex flex-col justify-end gap-12">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.6em] text-primary-bright">
                            <Activity className="w-4 h-4" />
                            Resource Grid Analytics
                        </div>
                        <h1 className="text-7xl md:text-[100px] text-white font-display font-black leading-[0.85] tracking-tight uppercase">
                            CIVIC <br />
                            <span className="sexy-gradient-text">UTILITIES.</span>
                        </h1>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="sexy-card flex items-center gap-8 !p-8 !bg-white/[0.01]">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-success/5 border border-success/10 flex items-center justify-center text-success">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <div className="text-2xl text-white font-display font-black tracking-tight uppercase">
                                    {currentUtilities.filter(u => u.status === 'paid').length}/6 VERIFIED
                                </div>
                                <div className="text-[9px] text-white/30 uppercase tracking-[0.4em] font-black uppercase">CYCLE: JAN 2045</div>
                            </div>
                        </div>
                        <div className="sexy-card flex items-center gap-8 !p-8 !bg-white/[0.01]">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-warning/5 border border-warning/10 flex items-center justify-center text-warning">
                                <Clock className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <div className="text-2xl text-white font-display font-black tracking-tight uppercase">
                                    {currentUtilities.filter(u => u.status !== 'paid').length} QUEUED
                                </div>
                                <div className="text-[9px] text-white/30 uppercase tracking-[0.4em] font-black uppercase">SYNC: LIVE <span className="text-white/10 ml-2">| KORTANA CITY</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid of Precision Utility Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 pb-40">
                {currentUtilities.map((utility, idx) => (
                    <motion.div
                        key={utility.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        viewport={{ once: true }}
                        onClick={() => router.push(`/dashboard/utilities/${utility.id}`)}
                        className="sexy-card !bg-white/[0.01] hover:border-primary-bright/20 flex flex-col group min-h-[350px] cursor-pointer"
                    >
                        <div className="flex items-start justify-between mb-12">
                            <div className={`w-20 h-20 rounded-[2rem] bg-neutral-obsidian flex items-center justify-center border border-white/5 group-hover:bg-primary-bright group-hover:text-neutral-obsidian transition-all duration-700 ${utility.status === 'paid' ? 'text-success' : utility.status === 'overdue' ? 'text-error' : 'text-primary-bright'}`}>
                                {utility.icon}
                            </div>

                            {utility.status === 'paid' ? (
                                <div className="px-5 py-2 rounded-full border border-success/20 bg-success/5 text-success text-[10px] font-black uppercase tracking-[0.2em]">
                                    VERIFIED
                                </div>
                            ) : utility.status === 'overdue' ? (
                                <div className="px-5 py-2 rounded-full border border-error/20 bg-error/5 text-error text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                                    OVERDUE
                                </div>
                            ) : (
                                <div className="px-5 py-2 rounded-full border border-warning/20 bg-warning/5 text-warning text-[10px] font-black uppercase tracking-[0.2em]">
                                    IN {utility.due}
                                </div>
                            )}
                        </div>

                        <div className="mb-10 space-y-3">
                            <h3 className="text-4xl text-white font-display font-black tracking-tight uppercase group-hover:text-primary-bright transition-colors duration-500 leading-none">{utility.label}</h3>
                            <div className="text-[10px] text-white/30 font-black uppercase tracking-[0.4em]">CONSUMPTION: <span className="text-white/60">{utility.usage}</span></div>
                        </div>

                        <div className="mt-auto flex items-end justify-between pt-10 border-t border-white/5">
                            <div className="space-y-2">
                                <div className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black uppercase">Service Fee</div>
                                <div className="text-3xl text-white font-display font-black tracking-tighter uppercase whitespace-nowrap">◈ {utility.bill} <span className="text-xs text-white/30 font-black tracking-widest ml-1">DNR</span></div>
                            </div>
                            <button
                                className="w-16 h-16 rounded-[2rem] bg-primary-bright/10 border border-primary-bright/20 text-primary-bright flex items-center justify-center group-hover:bg-primary-bright group-hover:text-neutral-obsidian transition-all duration-500"
                            >
                                <ArrowRight className="w-8 h-8 group-hover:translate-x-1" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
