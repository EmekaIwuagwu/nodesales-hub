"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Zap, Activity, Cpu, Database, Layers } from "lucide-react";

const features = [
    { title: "Real-Time Settlement", desc: "Instant on-chain liquidity for the urban service layer.", icon: <Zap /> },
    { title: "Sovereign Identity", desc: "Digital e-Residency protocols secured by DNR.", icon: <ShieldCheck /> },
    { title: "Autonomous Infrastructure", desc: "Programmable governance of transport and energy networks.", icon: <Cpu /> },
    { title: "Liquid Assets", desc: "Tokenized real estate sectors for fractional high-yield participation.", icon: <Database /> },
    { title: "Modular Jurisdictions", desc: "Algorithmic laws for a decentralized metropolis.", icon: <Layers /> },
    { title: "Cognitive Monitoring", desc: "Deep-learning analytics of the city's economic heartbeat.", icon: <Activity /> },
];

export default function Features() {
    return (
        <section className="py-60 px-20 relative overflow-hidden bg-neutral-obsidian">
            <div className="max-w-[1600px] mx-auto relative z-10">
                <div className="flex flex-col lg:flex-row items-end justify-between mb-40 gap-12">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="text-primary-bright text-[10px] font-black uppercase tracking-[0.8em] mb-12"
                        >
                            Infrastructure Core
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-7xl md:text-[100px] text-white font-display font-black leading-[0.85] tracking-tight"
                        >
                            THE ARCHITECTURE <br />
                            <span className="text-white/20">OF STABILITY.</span>
                        </motion.h2>
                    </div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-neutral-dim max-w-md uppercase tracking-[0.4em] text-[10px] font-bold leading-relaxed text-right"
                    >
                        BelloMundo provides the foundational primitives for the next generation of human settlement.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                            className="sexy-card group"
                        >
                            <div className="w-20 h-20 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-center text-primary-bright mb-12 group-hover:scale-110 transition-transform duration-700">
                                {feature.icon}
                            </div>
                            <h3 className="text-3xl text-white font-display font-black mb-6 uppercase tracking-[-0.02em]">{feature.title}</h3>
                            <p className="text-neutral-dim leading-loose font-medium text-sm tracking-wide">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Background elements */}
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </section>
    );
}
