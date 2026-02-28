"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Landing/Navbar";
import Footer from "@/components/Landing/Footer";
import { MessageSquare, ArrowRight, Rss, Calendar, User } from "lucide-react";
import Link from "next/link";

const posts = [
    {
        title: "Sector 7 Mesh Integration Complete",
        excerpt: "The quantum fiber network has been successfully synchronized with the Poseidon Node clusters in Sector 7.",
        date: "FEB 24, 2045",
        category: "INFRASTRUCTURE",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80"
    },
    {
        title: "DNR Liquidity Pool Reaches 3B Milestone",
        excerpt: "Autonomous treasury protocols have stabilized the Dinar exchange rate amidst global urban volatility.",
        date: "FEB 20, 2045",
        category: "FINANCIAL",
        image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=600&q=80"
    },
    {
        title: "New e-Residency Tiers Announced",
        excerpt: "Introduction of L10 Sovereign status for high-frequency node operators and institutional partners.",
        date: "FEB 12, 2045",
        category: "CIVIC",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80"
    }
];

export default function BlogPage() {
    return (
        <main className="relative min-h-screen bg-neutral-obsidian overflow-hidden">
            <Navbar />

            <section className="relative pt-60 pb-32 px-20">
                <div className="max-w-7xl mx-auto space-y-20">
                    <div className="flex flex-col lg:flex-row items-end justify-between gap-12">
                        <div className="space-y-6">
                            <div className="text-[10px] font-black uppercase tracking-[0.8em] text-primary-bright flex items-center gap-4">
                                <MessageSquare className="w-4 h-4" />
                                Metropolis / Intelligence Feed
                            </div>
                            <h1 className="text-7xl md:text-9xl font-display font-black text-white leading-none tracking-tight uppercase">
                                CITY <br />
                                <span className="sexy-gradient-text uppercase">NEWS.</span>
                            </h1>
                        </div>
                        <p className="text-neutral-dim max-w-sm uppercase tracking-[0.4em] text-[10px] font-bold leading-relaxed text-right pb-4">
                            Real-time updates from the BelloMundo autonomous news core.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {posts.map((post, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group cursor-pointer"
                            >
                                <div className="relative aspect-[16/10] rounded-[3rem] overflow-hidden border border-white/5 mb-8">
                                    <img src={post.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" />
                                    <div className="absolute top-6 left-6 px-4 py-2 bg-neutral-obsidian/80 backdrop-blur-md border border-white/10 rounded-full text-[9px] font-black text-primary-bright tracking-widest uppercase">
                                        {post.category}
                                    </div>
                                </div>
                                <div className="space-y-4 px-4">
                                    <div className="flex items-center gap-6 text-[9px] text-white/20 font-black uppercase tracking-widest">
                                        <span className="flex items-center gap-2"><Calendar className="w-3 h-3" /> {post.date}</span>
                                        <span className="flex items-center gap-2"><User className="w-3 h-3" /> CORE-ADMIN</span>
                                    </div>
                                    <h3 className="text-3xl text-white font-display font-black uppercase tracking-tight group-hover:text-primary-bright transition-colors">{post.title}</h3>
                                    <p className="text-neutral-dim text-sm leading-relaxed font-medium">{post.excerpt}</p>
                                    <div className="pt-4">
                                        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/40 group-hover:w-full group-hover:bg-primary-bright group-hover:text-neutral-obsidian transition-all duration-700 overflow-hidden">
                                            <ArrowRight className="w-5 h-5 flex-shrink-0" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] ml-4 whitespace-nowrap opacity-0 group-hover:opacity-100">Read Analysis</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
