"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Landing/Navbar";
import Footer from "@/components/Landing/Footer";
import { Eye, Shield, Globe, Zap, ArrowRight, Brain, Cpu, TrendingUp } from "lucide-react";
import Link from "next/link";

const pillars = [
    {
        title: "Autonomous Prosperity",
        desc: "A city that grows its own value. By 2045, BelloMundo will operate as a self-sovereign financial organism.",
        icon: <Brain className="w-8 h-8" />,
    },
    {
        title: "Zero-Friction Living",
        desc: "Eliminating the lag between desire and fulfillment through a 100% on-chain service layer.",
        icon: <Zap className="w-8 h-8" />,
    },
    {
        title: "Planetary Integrity",
        desc: "Architecture that breathes. Ecological systems synchronized with resource availability in real-time.",
        icon: <Globe className="w-8 h-8" />,
    },
];

export default function VisionPage() {
    return (
        <main className="relative min-h-screen bg-neutral-obsidian overflow-hidden">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-60 pb-40 px-20">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1.2 }}
                        className="space-y-10"
                    >
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.8em] text-primary-bright">
                            <Eye className="w-5 h-5" />
                            Protocol 2045 / Strategic Roadmap
                        </div>
                        <h1 className="text-8xl md:text-[120px] font-display font-black text-white leading-[0.85] tracking-tight uppercase">
                            URBAN <br />
                            <span className="sexy-gradient-text">DESTINY.</span>
                        </h1>
                        <p className="text-xl text-white/50 max-w-xl font-medium leading-relaxed tracking-wide italic">
                            "The city is no longer a place of residence; it is a collaborative algorithm for human flourishing."
                        </p>
                        <div className="flex gap-8">
                            <Link href="/dashboard" className="btn-sexy min-w-[240px]">
                                Join the Vision <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5 }}
                        className="relative"
                    >
                        <div className="w-[500px] h-[500px] rounded-[4rem] bg-gradient-to-br from-primary-bright/20 to-secondary-warm/10 border border-white/5 backdrop-blur-3xl p-1 relative z-10 overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80"
                                className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
                                alt="City Vision"
                            />
                        </div>
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-bright/20 blur-[80px] rounded-full animate-pulse" />
                        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-secondary-warm/20 blur-[100px] rounded-full animate-pulse" />
                    </motion.div>
                </div>
            </section>

            {/* Core Pillars */}
            <section className="py-40 px-20 border-t border-white/5 bg-white/[0.01]">
                <div className="max-w-7xl mx-auto space-y-32">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        {pillars.map((pillar, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.2 }}
                                className="sexy-card !bg-transparent space-y-8"
                            >
                                <div className="text-primary-bright">{pillar.icon}</div>
                                <h3 className="text-3xl text-white font-display font-black uppercase tracking-tight">{pillar.title}</h3>
                                <p className="text-neutral-dim font-medium leading-relaxed">{pillar.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="bg-white/5 rounded-[4rem] p-20 border border-white/10 text-center space-y-12">
                        <h2 className="text-5xl md:text-7xl text-white font-display font-black uppercase tracking-tighter">
                            A LEGACY OF <span className="sexy-gradient-text">INTELLIGENCE.</span>
                        </h2>
                        <p className="text-xl text-neutral-dim max-w-3xl mx-auto leading-relaxed">
                            BelloMundo is not built for the next decade. It is designed to survive the next millennium as an autonomous node in the planetary network.
                        </p>
                        <div className="flex items-center justify-center gap-20">
                            <div className="text-center">
                                <div className="text-4xl text-white font-display font-black uppercase tracking-tighter">0.02ms</div>
                                <div className="text-[9px] text-primary-bright uppercase font-black tracking-widest mt-2">Latency Core</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl text-white font-display font-black uppercase tracking-tighter">100%</div>
                                <div className="text-[9px] text-secondary-warm uppercase font-black tracking-widest mt-2">Energy Neutral</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl text-white font-display font-black uppercase tracking-tighter">IMMU</div>
                                <div className="text-[9px] text-success uppercase font-black tracking-widest mt-2">Legal DNA</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
