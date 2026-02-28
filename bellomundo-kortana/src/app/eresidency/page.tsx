"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Landing/Navbar";
import Footer from "@/components/Landing/Footer";
import { ArrowRight, Shield, Globe, Cpu, UserCheck } from "lucide-react";
import Link from "next/link";

export default function EResidencyLandingPage() {
    return (
        <main className="relative min-h-screen bg-neutral-obsidian overflow-hidden">
            <Navbar />

            {/* Cinematic Hero Section */}
            <section className="relative h-[90vh] flex items-center px-20">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1920&q=80"
                        alt="BelloMundo e-Residency"
                        className="w-full h-full object-cover opacity-30 grayscale"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-neutral-obsidian via-neutral-obsidian/60 to-transparent" />
                </div>

                <div className="relative z-10 max-w-5xl space-y-10">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1.2 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.6em] text-primary-bright">
                            <Shield className="w-5 h-5" />
                            Global Citizenship Protocol
                        </div>
                        <h1 className="text-8xl md:text-[120px] font-display font-black text-white leading-[0.85] tracking-tight uppercase">
                            SOVEREIGN <br />
                            <span className="sexy-gradient-text">IDENTITY.</span>
                        </h1>
                        <p className="text-xl text-white/60 max-w-2xl font-medium leading-relaxed tracking-wide">
                            Become a digital citizen of BelloMundo. Unlock global financial privileges,
                            immutable voting rights, and priority access to smart city resources.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="flex gap-8"
                    >
                        <Link href="/dashboard/eresidency" className="btn-sexy min-w-[280px]">
                            Apply for Residency <ArrowRight className="w-5 h-5" />
                        </Link>
                        <button className="px-12 py-6 rounded-full border border-white/10 text-white font-black uppercase tracking-[0.4em] text-[10px] hover:bg-white/5 transition-all">
                            Citizen Charter
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Features Detail */}
            <section className="py-40 px-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative border-t border-white/5 bg-white/[0.01]">
                <div className="sexy-card group">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:bg-primary-bright group-hover:text-neutral-obsidian transition-all duration-700">
                        <Globe className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-display font-black text-white uppercase mb-4">Global Reach</h3>
                    <p className="text-neutral-dim text-sm font-medium">Remote citizenship for innovators, investors, and digital nomads from across the planet.</p>
                </div>

                <div className="sexy-card group">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:bg-secondary-warm group-hover:text-neutral-obsidian transition-all duration-700">
                        <Cpu className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-display font-black text-white uppercase mb-4">Holographic ID</h3>
                    <p className="text-neutral-dim text-sm font-medium">A biometric, cryptographic identity anchored to the Kortana Blockchain for ultimate security.</p>
                </div>

                <div className="sexy-card group">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:bg-primary-bright group-hover:text-neutral-obsidian transition-all duration-700">
                        <UserCheck className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-display font-black text-white uppercase mb-4">Instant Access</h3>
                    <p className="text-neutral-dim text-sm font-medium">Authorized entry to physical and digital hubs within BelloMundo Sectors 1 through 9.</p>
                </div>

                <div className="sexy-card group">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:bg-secondary-warm group-hover:text-neutral-obsidian transition-all duration-700">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-display font-black text-white uppercase mb-4">Privacy Core</h3>
                    <p className="text-neutral-dim text-sm font-medium">Zero-knowledge identity verification allows you to prove residency without revealing sensitive data.</p>
                </div>
            </section>

            <Footer />
        </main>
    );
}
