"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Landing/Navbar";
import Footer from "@/components/Landing/Footer";
import { ArrowRight, Droplets, Zap, Wifi, Activity } from "lucide-react";
import Link from "next/link";

export default function UtilitiesLandingPage() {
    return (
        <main className="relative min-h-screen bg-neutral-obsidian overflow-hidden">
            <Navbar />

            {/* Cinematic Hero Section */}
            <section className="relative h-[90vh] flex items-center px-20 text-center justify-center">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/luxury_architectural_abstract_1772173612043.png"
                        alt="BelloMundo Utilities"
                        className="w-full h-full object-cover opacity-40 mix-blend-color-dodge"
                    />
                    <div className="absolute inset-0 bg-neutral-obsidian/80" />
                </div>

                <div className="relative z-10 max-w-5xl space-y-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.6em] text-primary-bright">
                            <Activity className="w-5 h-5" />
                            Planetary Resource Grid
                        </div>
                        <h1 className="text-8xl md:text-[140px] font-display font-black text-white leading-[0.8] tracking-tighter uppercase">
                            CORE <br />
                            <span className="sexy-gradient-text">ENERGY.</span>
                        </h1>
                        <p className="text-xl text-white/60 max-w-3xl mx-auto font-medium leading-relaxed tracking-wide">
                            The nervous system of BelloMundo. Sustainable energy, quantum-fiber connectivity, and
                            precision resource management, all synchronized on the global ledger.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="flex justify-center gap-8"
                    >
                        <Link href="/dashboard/utilities" className="btn-sexy min-w-[300px]">
                            Monitor My Usage <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Features Detail */}
            <section className="py-40 px-20 grid grid-cols-1 lg:grid-cols-3 gap-16 relative bg-white/[0.01]">
                <div className="sexy-card group text-center flex flex-col items-center">
                    <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center mb-8 group-hover:bg-primary-bright group-hover:text-neutral-obsidian transition-all duration-700">
                        <Zap className="w-10 h-10" />
                    </div>
                    <h3 className="text-3xl font-display font-black text-white uppercase mb-4 tracking-tight">Sustainable Flux</h3>
                    <p className="text-neutral-dim leading-relaxed font-medium">100% renewable energy sourced from orbital solar arrays and local fusion buffers.</p>
                </div>

                <div className="sexy-card group text-center flex flex-col items-center">
                    <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center mb-8 group-hover:bg-secondary-warm group-hover:text-neutral-obsidian transition-all duration-700">
                        <Droplets className="w-10 h-10" />
                    </div>
                    <h3 className="text-3xl font-display font-black text-white uppercase mb-4 tracking-tight">Closed Loop Hydro</h3>
                    <p className="text-neutral-dim leading-relaxed font-medium">Advanced water reclamation and desalination protocols for zero-waste urban metabolism.</p>
                </div>

                <div className="sexy-card group text-center flex flex-col items-center">
                    <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center mb-8 group-hover:bg-primary-bright group-hover:text-neutral-obsidian transition-all duration-700">
                        <Wifi className="w-10 h-10" />
                    </div>
                    <h3 className="text-3xl font-display font-black text-white uppercase mb-4 tracking-tight">Quantum Mesh</h3>
                    <p className="text-neutral-dim leading-relaxed font-medium">Universal low-latency connectivity for all citizens, managed via identity-based dynamic routing.</p>
                </div>
            </section>

            <Footer />
        </main>
    );
}
