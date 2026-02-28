"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Landing/Navbar";
import Footer from "@/components/Landing/Footer";
import { Info, Building2, Map, Users, ArrowRight, Shield, Activity, Globe } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    return (
        <main className="relative min-h-screen bg-neutral-obsidian overflow-hidden">
            <Navbar />

            {/* Cinematic Hero Section */}
            <section className="relative pt-60 pb-32 px-20 text-center">
                <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-primary-bright/10 to-transparent pointer-events-none" />

                <div className="max-w-4xl mx-auto space-y-12 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="text-[10px] font-black uppercase tracking-[0.8em] text-primary-bright flex items-center justify-center gap-4">
                            <Info className="w-4 h-4" />
                            The Urban Protocol / Origin Story
                        </div>
                        <h1 className="text-8xl md:text-[110px] font-display font-black text-white leading-none tracking-tight uppercase">
                            Bello<span className="sexy-gradient-text">Mundo.</span>
                        </h1>
                        <p className="text-2xl text-white/50 font-medium leading-relaxed max-w-3xl mx-auto">
                            The world's first financial operating system manifest as a physical city.
                            A decentralized metropolis where code determines the skyline.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Architectural Stats Grid */}
            <section className="py-24 px-20">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {[
                        { label: "Founded", value: "2032" },
                        { label: "Population", value: "48K+" },
                        { label: "Settlement", value: "DNR ◈" },
                        { label: "Auth Level", value: "L9" },
                    ].map((stat, idx) => (
                        <div key={idx} className="p-12 rounded-[2.5rem] bg-white/[0.02] border border-white/5 text-center space-y-2">
                            <div className="text-[9px] text-white/20 uppercase font-black tracking-widest">{stat.label}</div>
                            <div className="text-4xl text-white font-display font-black uppercase tracking-tighter">{stat.value}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Deep Content */}
            <section className="py-40 px-20 bg-white/[0.01] border-y border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-32 items-center">
                    <div className="lg:w-1/2 space-y-12">
                        <h2 className="text-6xl font-display font-black text-white uppercase tracking-tight leading-tight">
                            BEYOND <br />
                            <span className="sexy-gradient-text uppercase">GEOGRAPHY.</span>
                        </h2>
                        <div className="space-y-8 text-neutral-dim text-lg leading-loose font-medium">
                            <p>
                                BelloMundo was conceived at the intersection of the sovereign individual and the autonomous machine. Located in a specialized economic jurisdiction, it operates on a purely cryptographic foundation.
                            </p>
                            <p>
                                Every brick, every kilowatt, and every transit byte is a transaction on the Kortana Blockchain. This is the first time in history that an entire city is auditable, immutable, and optimized by AI.
                            </p>
                        </div>
                        <Link href="/vision" className="btn-sexy inline-flex min-w-[240px]">
                            Our Roadmap <ArrowRight className="w-5 h-5 ml-4" />
                        </Link>
                    </div>
                    <div className="lg:w-1/2 grid grid-cols-2 gap-8">
                        <div className="sexy-card !p-8 space-y-6">
                            <Activity className="text-primary-bright w-10 h-10" />
                            <h4 className="text-white font-display font-black text-xl uppercase tracking-widest">Sentience</h4>
                            <p className="text-xs text-neutral-dim font-medium uppercase tracking-widest leading-loose">Real-time resource allocation via the central core.</p>
                        </div>
                        <div className="sexy-card !p-8 space-y-6 mt-12">
                            <Shield className="text-secondary-warm w-10 h-10" />
                            <h4 className="text-white font-display font-black text-xl uppercase tracking-widest">Security</h4>
                            <p className="text-xs text-neutral-dim font-medium uppercase tracking-widest leading-loose">Biological and cryptographic multi-factor protection.</p>
                        </div>
                        <div className="sexy-card !p-8 space-y-6">
                            <Globe className="text-success w-10 h-10" />
                            <h4 className="text-white font-display font-black text-xl uppercase tracking-widest">Inclusion</h4>
                            <p className="text-xs text-neutral-dim font-medium uppercase tracking-widest leading-loose">Access for any valid network wallet, globally.</p>
                        </div>
                        <div className="sexy-card !p-8 space-y-6 mt-12">
                            <Building2 className="text-primary-bright w-10 h-10" />
                            <h4 className="text-white font-display font-black text-xl uppercase tracking-widest">Growth</h4>
                            <p className="text-xs text-neutral-dim font-medium uppercase tracking-widest leading-loose">Autonomous urban expansion based on GDP flow.</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
