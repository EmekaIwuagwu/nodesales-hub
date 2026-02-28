"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Landing/Navbar";
import Footer from "@/components/Landing/Footer";
import { ArrowRight, Navigation, Zap, BatteryCharging, Shield } from "lucide-react";
import Link from "next/link";

export default function TransportLandingPage() {
    return (
        <main className="relative min-h-screen bg-neutral-obsidian overflow-hidden">
            <Navbar />

            {/* Cinematic Hero Section */}
            <section className="relative h-[90vh] flex items-center px-20">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=3000&q=100"
                        alt="BelloMundo Transit"
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
                            <Navigation className="w-5 h-5" />
                            Autonomous Transit Network
                        </div>
                        <h1 className="text-8xl md:text-[120px] font-display font-black text-white leading-[0.85] tracking-tight uppercase">
                            FLUID <br />
                            <span className="sexy-gradient-text">MOBILITY.</span>
                        </h1>
                        <p className="text-xl text-white/60 max-w-2xl font-medium leading-relaxed tracking-wide">
                            The heartbeat of the smart city. Autonomous EV fleets, high-speed hyper-loops, and
                            instant DNR fare settlement across the entire metropolis.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="flex gap-8"
                    >
                        <Link href="/dashboard/transport" className="btn-sexy min-w-[280px]">
                            Access Fleet <ArrowRight className="w-5 h-5" />
                        </Link>
                        <button className="px-12 py-6 rounded-full border border-white/10 text-white font-black uppercase tracking-[0.4em] text-[10px] hover:bg-white/5 transition-all">
                            Spatial Grid Map
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Features Detail */}
            <section className="py-40 px-20 grid grid-cols-1 lg:grid-cols-3 gap-16 relative">
                <div className="sexy-card group">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:bg-primary-bright group-hover:text-neutral-obsidian transition-all duration-700">
                        <BatteryCharging className="w-8 h-8" />
                    </div>
                    <h3 className="text-3xl font-display font-black text-white uppercase mb-4">Autonomous Mesh</h3>
                    <p className="text-neutral-dim leading-relaxed font-medium">Full level-5 autonomy connected via a low-latency 6G mesh network for zero-congestion transit.</p>
                </div>

                <div className="sexy-card group">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:bg-secondary-warm group-hover:text-neutral-obsidian transition-all duration-700">
                        <Zap className="w-8 h-8" />
                    </div>
                    <h3 className="text-3xl font-display font-black text-white uppercase mb-4">Instant Settlement</h3>
                    <p className="text-neutral-dim leading-relaxed font-medium">Fares are calculated dynamically and settled instantly via smart contracts as you travel.</p>
                </div>

                <div className="sexy-card group">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:bg-primary-bright group-hover:text-neutral-obsidian transition-all duration-700">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h3 className="text-3xl font-display font-black text-white uppercase mb-4">Sovereign Fleet</h3>
                    <p className="text-neutral-dim leading-relaxed font-medium">Public and private fleets integrated into a single high-efficiency urban transport protocol.</p>
                </div>
            </section>

            <Footer />
        </main>
    );
}
