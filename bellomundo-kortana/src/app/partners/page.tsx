"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Landing/Navbar";
import Footer from "@/components/Landing/Footer";
import { Handshake, Globe, Zap, Shield, ArrowRight, Cpu, Layout } from "lucide-react";
import Link from "next/link";

const categories = [
    { title: "Infrastructure", desc: "Building the physical nodes and quantum mesh." },
    { title: "Financial", desc: "Liquidity providers and institutional DNR vaults." },
    { title: "Academic", desc: "Collaborating on algorithmic urban governance." },
];

export default function PartnersPage() {
    return (
        <main className="relative min-h-screen bg-neutral-obsidian overflow-hidden">
            <Navbar />

            <section className="relative pt-60 pb-32 px-20">
                <div className="max-w-7xl mx-auto space-y-32">
                    <div className="flex flex-col items-center text-center space-y-12">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            <div className="text-[10px] font-black uppercase tracking-[0.8em] text-primary-bright flex items-center justify-center gap-4">
                                <Handshake className="w-4 h-4" />
                                Global Alliance / Institutional Layer
                            </div>
                            <h1 className="text-8xl md:text-[130px] font-display font-black text-white leading-[0.8] tracking-tighter uppercase">
                                STRATEGIC <br />
                                <span className="sexy-gradient-text uppercase">NODES.</span>
                            </h1>
                            <p className="text-xl text-white/40 font-medium leading-relaxed max-w-2xl mx-auto">
                                BelloMundo is supported by a global consortium of architects, engineers, and financial protocols dedicated to the sovereign city.
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {categories.map((cat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="sexy-card !bg-white/[0.01] group text-center flex flex-col items-center gap-10"
                            >
                                <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:bg-primary-bright group-hover:text-neutral-obsidian transition-all duration-700">
                                    {idx === 0 ? <Cpu className="w-10 h-10" /> : idx === 1 ? <Zap className="w-10 h-10" /> : <Globe className="w-10 h-10" />}
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-3xl text-white font-display font-black uppercase">{cat.title}</h3>
                                    <p className="text-neutral-dim font-medium leading-relaxed">{cat.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="p-20 rounded-[4rem] bg-gradient-to-br from-primary-bright/5 to-secondary-warm/5 border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-bright/10 blur-[100px] rounded-full" />
                        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
                            <div className="space-y-8">
                                <h2 className="text-5xl font-display font-black text-white uppercase tracking-tight">BECOME A NODE.</h2>
                                <p className="text-neutral-dim text-lg max-w-xl font-medium">
                                    Join the network as an institutional partner to deploy infrastructure or provide liquidity to the DNR ecosystem.
                                </p>
                            </div>
                            <button className="btn-sexy min-w-[320px] text-lg">
                                Access Partnership Portal <ArrowRight className="w-6 h-6 ml-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
