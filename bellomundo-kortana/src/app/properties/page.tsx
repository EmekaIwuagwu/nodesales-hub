"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Landing/Navbar";
import Footer from "@/components/Landing/Footer";
import { ArrowRight, Building2, ShieldCheck, Zap, Globe } from "lucide-react";
import Link from "next/link";

export default function PropertiesLandingPage() {
    return (
        <main className="relative min-h-screen bg-neutral-obsidian overflow-hidden">
            <Navbar />

            {/* Cinematic Hero Section */}
            <section className="relative h-[90vh] flex items-center px-20">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/luxury_penthouse_interior.png"
                        alt="BelloMundo Properties"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-neutral-obsidian via-neutral-obsidian/40 to-transparent" />
                </div>

                <div className="relative z-10 max-w-5xl space-y-10">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1.2 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.6em] text-primary-bright">
                            <Building2 className="w-5 h-5" />
                            Elite Residential Protocol
                        </div>
                        <h1 className="text-8xl md:text-[120px] font-display font-black text-white leading-[0.85] tracking-tight uppercase">
                            PRECISION <br />
                            <span className="sexy-gradient-text">LIVING.</span>
                        </h1>
                        <p className="text-xl text-white/60 max-w-2xl font-medium leading-relaxed tracking-wide">
                            Experience the pinnacle of urban living in BelloMundo. Smart-contract governed rentals,
                            bioluminescent penthouses, and automated residential management.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="flex gap-8"
                    >
                        <Link href="/dashboard/properties" className="btn-sexy min-w-[280px]">
                            Browse Inventory <ArrowRight className="w-5 h-5" />
                        </Link>
                        <button className="px-12 py-6 rounded-full border border-white/10 text-white font-black uppercase tracking-[0.4em] text-[10px] hover:bg-white/5 transition-all">
                            Investment Deck
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Features Detail */}
            <section className="py-40 px-20 grid grid-cols-1 lg:grid-cols-3 gap-16 relative">
                <div className="sexy-card group">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:bg-primary-bright group-hover:text-neutral-obsidian transition-all duration-700">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h3 className="text-3xl font-display font-black text-white uppercase mb-4">On-Chain Contracts</h3>
                    <p className="text-neutral-dim leading-relaxed font-medium">Every rental agreement is a transparent, immutable smart contract on the Kortana Blockchain.</p>
                </div>

                <div className="sexy-card group">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:bg-secondary-warm group-hover:text-neutral-obsidian transition-all duration-700">
                        <Zap className="w-8 h-8" />
                    </div>
                    <h3 className="text-3xl font-display font-black text-white uppercase mb-4">Autonomous Mgmt</h3>
                    <p className="text-neutral-dim leading-relaxed font-medium">AI-driven maintenance and resource optimization powered by city-wide IoT sensors.</p>
                </div>

                <div className="sexy-card group">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:bg-primary-bright group-hover:text-neutral-obsidian transition-all duration-700">
                        <Globe className="w-8 h-8" />
                    </div>
                    <h3 className="text-3xl font-display font-black text-white uppercase mb-4">Zero-Fee Rental</h3>
                    <p className="text-neutral-dim leading-relaxed font-medium">Eliminate intermediaries. Direct peer-to-authority settlement in DNR tokens.</p>
                </div>
            </section>

            <Footer />
        </main>
    );
}
