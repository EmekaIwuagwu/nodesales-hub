"use client";

import { motion } from "framer-motion";
import { Zap, Home, Droplets, Calendar, ArrowRight } from "lucide-react";

const upcoming = [
    { icon: <Zap className="w-4 h-4 text-primary-bright" />, label: "Grid Usage", due: "3 DAYS", amount: "45.00" },
    { icon: <Home className="w-4 h-4 text-secondary-warm" />, label: "Residential", due: "8 DAYS", amount: "850.00" },
    { icon: <Droplets className="w-4 h-4 text-info" />, label: "Hydro Loop", due: "12 DAYS", amount: "22.50" },
];

export default function UpcomingPayments() {
    return (
        <div className="flex flex-col gap-4">
            {upcoming.map((item, idx) => (
                <motion.div
                    key={idx}
                    whileHover={{ x: 5 }}
                    className="flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 group transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-neutral-obsidian flex items-center justify-center border border-white/5 text-white/40 group-hover:text-white transition-all">
                            {item.icon}
                        </div>
                        <div className="space-y-1 text-left">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 block group-hover:text-white transition-colors">{item.label}</span>
                            <div className="text-[9px] text-white/20 font-black uppercase tracking-[0.2em]">IN {item.due}</div>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-sm font-display font-black text-white tracking-tight">◈ {item.amount}</div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
