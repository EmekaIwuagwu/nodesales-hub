"use client";

import { motion } from "framer-motion";
import { Users, Building2, Zap, Globe } from "lucide-react";

const stats = [
    { label: "Aggregate City GDP", value: "2.4B DNR", icon: <Globe className="w-5 h-5" />, trend: "+12.4%" },
    { label: "Network Citizens", value: "47,832", icon: <Users className="w-5 h-5" />, trend: "STABLE" },
    { label: "On-Chain Inventory", value: "12,400", icon: <Building2 className="w-5 h-5" />, trend: "+0.8%" },
    { label: "Energy Autonomy", value: "98.2%", icon: <Zap className="w-5 h-5" />, trend: "+4.5%" },
];

export default function StatsBar() {
    return (
        <section className="relative z-20 -mt-32 px-20">
            <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="sexy-card group"
                    >
                        <div className="flex flex-col gap-10">
                            <div className="flex items-center justify-between">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-white/[0.03] border border-white/10 flex items-center justify-center text-primary-bright group-hover:bg-primary-bright group-hover:text-neutral-obsidian transition-all duration-700">
                                    {stat.icon}
                                </div>
                                <span className="text-[10px] text-success font-black font-mono tracking-widest">{stat.trend}</span>
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="text-[9px] text-neutral-dim uppercase font-black tracking-[0.6em]">{stat.label}</span>
                                <span className="text-5xl text-white font-display font-black tracking-tighter group-hover:text-primary-bright transition-colors duration-700">{stat.value}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
