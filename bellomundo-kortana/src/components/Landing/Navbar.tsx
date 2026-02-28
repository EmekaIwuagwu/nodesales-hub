"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Logo from "@/components/ui/Logo";
import WalletModal from "@/components/Auth/WalletModal";

export default function Navbar() {
    const { data: session } = useSession();
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

    return (
        <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="fixed top-0 inset-x-0 z-[100] h-32 px-20 flex items-center justify-between"
        >
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-obsidian/80 to-transparent pointer-events-none" />

            <div className="relative z-10 flex items-center gap-24">
                <Link href="/" className="hover:scale-105 transition-transform duration-700">
                    <Logo size="md" />
                </Link>

                {/* High-End Architectural Navigation */}
                <div className="hidden xl:flex items-center gap-14">
                    <Link href="/properties" className="text-[10px] font-black text-white/40 hover:text-white transition-all uppercase tracking-[0.6em] relative group">
                        Properties
                        <motion.span className="absolute -bottom-4 left-0 w-0 h-[1.5px] bg-white group-hover:w-full transition-all duration-700" />
                    </Link>
                    <Link href="/transport" className="text-[10px] font-black text-white/40 hover:text-white transition-all uppercase tracking-[0.6em] relative group">
                        Transport
                        <motion.span className="absolute -bottom-4 left-0 w-0 h-[1.5px] bg-white group-hover:w-full transition-all duration-700" />
                    </Link>
                    <Link href="/utilities" className="text-[10px] font-black text-white/40 hover:text-white transition-all uppercase tracking-[0.6em] relative group">
                        Utilities
                        <motion.span className="absolute -bottom-4 left-0 w-0 h-[1.5px] bg-white group-hover:w-full transition-all duration-700" />
                    </Link>
                    <Link href="/eresidency" className="text-[10px] font-black text-white/40 hover:text-white transition-all uppercase tracking-[0.6em] relative group">
                        e-Residency
                        <motion.span className="absolute -bottom-4 left-0 w-0 h-[1.5px] bg-white group-hover:w-full transition-all duration-700" />
                    </Link>
                </div>
            </div>

            <div className="relative z-10 flex items-center gap-12">
                {session ? (
                    <Link href="/dashboard" className="px-12 py-5 bg-white text-neutral-obsidian font-black uppercase tracking-[0.4em] text-[10px] rounded-full hover:bg-primary-bright transition-all duration-700 hover:shadow-[0_0_50px_rgba(56,189,248,0.4)]">
                        Command Center
                    </Link>
                ) : (
                    <div className="flex items-center gap-12">
                        <button
                            onClick={() => setIsWalletModalOpen(true)}
                            className="text-white/30 hover:text-white transition-all font-black uppercase tracking-[0.5em] text-[10px]"
                        >
                            Portal Access
                        </button>
                        <button
                            onClick={() => setIsWalletModalOpen(true)}
                            className="px-12 py-5 bg-white text-neutral-obsidian font-black uppercase tracking-[0.4em] text-[10px] rounded-full hover:bg-secondary-warm transition-all duration-700 hover:shadow-[0_0_50px_rgba(245,158,11,0.4)] shadow-xl"
                        >
                            Launch Intelligence
                        </button>
                    </div>
                )}
            </div>

            <WalletModal
                isOpen={isWalletModalOpen}
                onClose={() => setIsWalletModalOpen(false)}
            />
        </motion.nav>
    );
}
