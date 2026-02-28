"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Landing/Navbar";
import Footer from "@/components/Landing/Footer";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function GenericLander({ title, subtitle, description }: { title: string, subtitle: string, description: string }) {
    return (
        <main className="relative min-h-screen bg-neutral-obsidian overflow-hidden">
            <Navbar />

            <section className="relative pt-60 pb-40 px-20">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-bright/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary-warm/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="max-w-4xl space-y-12 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        className="space-y-6"
                    >
                        <div className="text-[10px] font-black uppercase tracking-[0.8em] text-primary-bright">
                            {subtitle}
                        </div>
                        <h1 className="text-8xl md:text-[100px] font-display font-black text-white leading-[0.85] tracking-tight uppercase">
                            {title.split(' ').map((word, i) => (
                                <span key={i} className={i % 2 === 1 ? 'sexy-gradient-text' : ''}>
                                    {word}{' '}
                                    {i % 2 === 1 && <br />}
                                </span>
                            ))}
                        </h1>
                        <p className="text-xl text-neutral-dim max-w-2xl font-medium leading-relaxed tracking-wide">
                            {description}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <Link href="/" className="btn-sexy-gold inline-flex min-w-[240px]">
                            Back to Core <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
