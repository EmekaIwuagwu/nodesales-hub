"use client";

import { motion } from "framer-motion";

export default function Logo({ size = "md", className = "" }: { size?: "sm" | "md" | "lg" | "xl", className?: string }) {
    const sizes = {
        sm: "w-8 h-8 text-lg",
        md: "w-12 h-12 text-2xl",
        lg: "w-16 h-16 text-3xl",
        xl: "w-28 h-28 text-6xl",
    };

    return (
        <div className={`flex items-center gap-4 ${className}`}>
            <div className={`relative ${sizes[size]} flex items-center justify-center group`}>
                {/* Kinetic Architecture Rings */}
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                        transition={{
                            rotate: { duration: 15 + i * 5, repeat: Infinity, ease: "linear" },
                            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="absolute inset-0 rounded-[35%] border-[1px] border-primary-bright/20 group-hover:border-primary-bright/40 transition-colors"
                        style={{ rotate: i * 45 }}
                    />
                ))}

                {/* Central Monolith Core */}
                <div className="relative z-10 font-display font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                    <span className="bg-clip-text text-transparent bg-gradient-to-br from-white via-primary-bright to-secondary-warm">B</span>
                    <motion.div
                        animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-secondary-warm rounded-full blur-[1px] shadow-[0_0_15px_#F59E0B]"
                    />
                </div>

                {/* Outer Halo */}
                <div className="absolute inset-[-20%] bg-primary-bright/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            </div>

            {(size !== "sm") && (
                <div className="flex flex-col">
                    <span className="text-white font-display font-black tracking-[0.3em] uppercase leading-none text-xl">
                        Bello<span className="text-primary-bright font-light">Mundo</span>
                    </span>
                    <span className="text-[9px] text-neutral-dim uppercase tracking-[0.6em] font-bold mt-2 opacity-60">
                        Urban Operations System
                    </span>
                </div>
            )}
        </div>
    );
}
