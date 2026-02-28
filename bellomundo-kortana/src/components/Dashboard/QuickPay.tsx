"use client";

import { motion } from "framer-motion";
import { Home, Zap, Car, Sparkles, CreditCard, Ship, Search, Plus, ArrowRight } from "lucide-react";

const quickActions = [
    { icon: <Home className="w-5 h-5" />, label: "Housing", last: "850 DNR", color: "primary-bright" },
    { icon: <Zap className="w-5 h-5" />, label: "Utilities", last: "45 DNR", color: "secondary-warm" },
    { icon: <Car className="w-5 h-5" />, label: "Transport", last: "1.2 DNR", color: "success" },
    { icon: <Sparkles className="w-5 h-5" />, label: "Wellness", last: "30 DNR", color: "primary-bright" },
];

export default function QuickPay() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, idx) => (
                <motion.button
                    key={idx}
                    whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.05)" }}
                    className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col items-start gap-4 transition-all group"
                >
                    <div className="w-12 h-12 rounded-xl bg-neutral-obsidian flex items-center justify-center text-white/40 group-hover:text-primary-bright transition-colors border border-white/5">
                        {action.icon}
                    </div>
                    <div className="space-y-1 text-left">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30 block group-hover:text-white transition-colors">{action.label}</span>
                        <div className="text-sm font-display font-black text-white tracking-tight">◈ {action.last}</div>
                    </div>
                </motion.button>
            ))}
            <motion.button
                whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                className="col-span-1 md:col-span-2 p-6 rounded-[2rem] border-2 border-dashed border-white/5 flex items-center justify-center gap-4 text-white/20 hover:text-white transition-all group"
            >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Register Protocol</span>
            </motion.button>
        </div>
    );
}
