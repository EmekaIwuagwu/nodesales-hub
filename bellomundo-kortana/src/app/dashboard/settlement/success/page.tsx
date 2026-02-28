"use client";

import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, Download, Share2, Home, Zap, Car } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SettlementSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const type = searchParams.get("type") || "asset";
    const id = searchParams.get("id");
    const txHash = searchParams.get("txHash") || "0x000...000";

    const [assetData, setAssetData] = useState<any>(null);

    useEffect(() => {
        // In a real app, we'd fetch from an API. For now, we'll use a descriptive mock based on type.
        const mockAssets: any = {
            property: {
                title: "Aetheria Sky Penthouse",
                image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200",
                location: "Sector 7, Kortana City",
                category: "Residential Node"
            },
            transport: {
                title: "Volt Solaris G3",
                image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200",
                location: "Metropolis Mobility Grid",
                category: "Autonomous Transit"
            },
            utility: {
                title: "Grid Electricity",
                image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200",
                location: "City Resource Network",
                category: "Civic Infrastructure"
            }
        };

        setAssetData(mockAssets[type] || mockAssets.property);
    }, [type, id]);

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 pb-20">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-4xl luxury-glass border border-white/10 rounded-[4rem] overflow-hidden shadow-2xl relative"
            >
                {/* Cinematic Background Image of the asset */}
                <div className="absolute inset-0 z-0 h-[400px]">
                    <img
                        src={assetData?.image}
                        className="w-full h-full object-cover opacity-30 grayscale hover:grayscale-0 transition-all duration-[3s]"
                        alt="Asset Background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-neutral-obsidian/20 via-neutral-obsidian to-neutral-obsidian" />
                </div>

                <div className="relative z-10 p-16 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                        className="w-32 h-32 rounded-full bg-success/20 border border-success/30 flex items-center justify-center text-success mb-12 shadow-[0_0_50px_rgba(34,197,94,0.3)]"
                    >
                        <CheckCircle2 className="w-16 h-16" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-4 mb-12"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.8em] text-primary-bright">Settlement Finalized</span>
                        <h1 className="text-6xl md:text-7xl font-display font-black text-white tracking-tighter uppercase leading-none">
                            PROTOCOL <br />
                            <span className="sexy-gradient-text">VERIFIED.</span>
                        </h1>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="w-full grid grid-cols-1 md:grid-cols-2 gap-10 text-left mb-16"
                    >
                        <div className="sexy-card !bg-white/[0.02] border-white/5 p-8 flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-neutral-obsidian flex items-center justify-center text-primary-bright">
                                {type === 'transport' ? <Car className="w-8 h-8" /> : type === 'utility' ? <Zap className="w-8 h-8" /> : <Home className="w-8 h-8" />}
                            </div>
                            <div>
                                <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Asset Registered</div>
                                <div className="text-xl font-display font-black text-white uppercase">{assetData?.title}</div>
                                <div className="text-[10px] text-white/40 uppercase tracking-widest">{assetData?.location}</div>
                            </div>
                        </div>

                        <div className="sexy-card !bg-white/[0.02] border-white/5 p-8 flex flex-col justify-center">
                            <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">Finality Hash</div>
                            <div className="text-xs font-mono text-success break-all">{txHash}</div>
                            <div className="flex items-center gap-4 mt-3">
                                <span className="px-3 py-1 rounded-full bg-success/10 border border-success/20 text-success text-[8px] font-black uppercase tracking-widest">Confirmed</span>
                                <span className="text-[8px] text-white/20 font-black uppercase tracking-widest">Metropolis Layer 2</span>
                            </div>
                        </div>
                    </motion.div>

                    <div className="w-full flex flex-col md:flex-row gap-6">
                        <Link href="/dashboard/history" className="flex-1 btn-sexy-gold py-6 !rounded-3xl flex items-center justify-center gap-4 group">
                            <Activity className="w-5 h-5" /> View Records <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform" />
                        </Link>
                        <div className="flex gap-4">
                            <button className="p-6 rounded-3xl bg-white/[0.05] border border-white/10 text-white hover:bg-white/10 transition-all">
                                <Download className="w-6 h-6" />
                            </button>
                            <button className="p-6 rounded-3xl bg-white/[0.05] border border-white/10 text-white hover:bg-white/10 transition-all">
                                <Share2 className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-10 right-10 w-40 h-40 bg-primary-bright/10 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute bottom-10 left-10 w-40 h-40 bg-secondary-warm/10 blur-[80px] rounded-full pointer-events-none" />
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-12 text-[10px] text-white/20 font-black uppercase tracking-[0.5em]"
            >
                Digital Sovereignty Maintained | Kortana Network
            </motion.p>
        </div>
    );
}

import { Activity } from "lucide-react";
