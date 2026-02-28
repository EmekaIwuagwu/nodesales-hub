"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Landing/Navbar";
import Footer from "@/components/Landing/Footer";
import { ShieldCheck, FileCheck, Lock, Eye, ArrowRight, Zap, Activity } from "lucide-react";
import Link from "next/link";

export default function CompliancePage() {
    return (
        <main className="relative min-h-screen bg-neutral-obsidian overflow-hidden">
            <Navbar />

            <section className="relative pt-60 pb-32 px-20">
                <div className="max-w-7xl mx-auto space-y-32">
                    <div className="flex flex-col lg:flex-row items-end justify-between gap-12">
                        <div className="space-y-6">
                            <div className="text-[10px] font-black uppercase tracking-[0.8em] text-success flex items-center gap-4">
                                <ShieldCheck className="w-4 h-4" />
                                Regulatory Framework / Sovereign Compliance
                            </div>
                            <h1 className="text-8xl md:text-[120px] font-display font-black text-white leading-[0.85] tracking-tight uppercase">
                                TRUSTED <br />
                                <span className="sexy-gradient-text uppercase">PROTOCOLS.</span>
                            </h1>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                        <div className="space-y-12">
                            <div className="space-y-8">
                                <h2 className="text-4xl font-display font-black text-white uppercase tracking-tight">ALGORITHMIC GOVERNANCE</h2>
                                <p className="text-neutral-dim text-lg leading-loose font-medium">
                                    BelloMundo compliance is not manual; it is baked into the very blocks of our network. Laws are expressed as smart contracts, ensuring 100% adherence without human bias.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[
                                    { icon: <Lock className="w-6 h-6" />, title: "AML-ON-CHAIN", desc: "Real-time auditing of all DNR flows." },
                                    { icon: <FileCheck className="w-6 h-6" />, title: "KYC NODES", desc: "ZKP-based verification of all citizens." },
                                    { icon: <ShieldCheck className="w-6 h-6" />, title: "SOVEREIGN JUR", desc: "Independent legal jurisdiction." },
                                    { icon: <Activity className="w-6 h-6" />, title: "LIVENESS PROOF", desc: "Biological verification protocols." },
                                ].map((item, idx) => (
                                    <div key={idx} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
                                        <div className="text-primary-bright">{item.icon}</div>
                                        <h4 className="text-white font-display font-black text-sm uppercase tracking-widest">{item.title}</h4>
                                        <p className="text-[10px] text-neutral-dim font-bold uppercase tracking-widest leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="sexy-card !p-16 space-y-12 border-white/10 bg-white/[0.02] flex flex-col justify-center">
                            <div className="w-24 h-24 rounded-[2rem] bg-success/10 border border-success/20 flex items-center justify-center text-success">
                                <ShieldCheck className="w-12 h-12" />
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-5xl text-white font-display font-black tracking-tighter uppercase leading-tight">FULLY <br />AUDITABLE.</h3>
                                <p className="text-neutral-dim text-sm leading-relaxed font-medium">
                                    Every transaction, identity mint, and property transfer is visible on the public explorer, providing a level of transparency never before seen in urban administration.
                                </p>
                                <button className="text-success font-black uppercase tracking-[0.6em] text-[10px] flex items-center gap-4 group">
                                    VIEW EXPLORER <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
