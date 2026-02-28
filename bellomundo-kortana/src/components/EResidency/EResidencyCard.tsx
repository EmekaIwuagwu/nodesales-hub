"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Snowflake, MapPin, Cpu, Globe } from "lucide-react";

export interface EResidencyData {
    name: string;
    idNumber: string;
    walletAddress: string;
    issueDate: string;
    expiryDate: string;
    photoUrl?: string;  // base64 or URL for passport photo
}

function shortAddr(addr: string) {
    if (!addr || addr.length < 10) return addr;
    return addr.slice(0, 10) + '...' + addr.slice(-8);
}

export default function EResidencyCard({ data }: { data: EResidencyData }) {
    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -8 }}
            className="relative w-full rounded-[3rem] overflow-hidden luxury-glass border border-white/10 group cursor-pointer shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
            style={{ aspectRatio: '1.586 / 1' }}  // Standard ID card ratio
        >
            {/* Architectural Texture */}
            <div className="absolute inset-0 opacity-10 mix-blend-color-dodge">
                <div className="absolute inset-0 bg-[url('/luxury_architectural_abstract_1772173612043.png')] bg-cover" />
            </div>

            {/* Holographic shimmer */}
            <motion.div
                className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay"
                animate={{
                    background: [
                        "radial-gradient(circle at 0% 0%, rgba(56,189,248,0.12) 0%, transparent 60%)",
                        "radial-gradient(circle at 100% 100%, rgba(245,158,11,0.12) 0%, transparent 60%)",
                        "radial-gradient(circle at 0% 0%, rgba(56,189,248,0.12) 0%, transparent 60%)"
                    ]
                }}
                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            />

            <div className="relative z-10 h-full p-8 flex flex-col justify-between">

                {/* ── TOP ROW: Logo + Chip ────────────────── */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary-bright shrink-0">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg text-white font-display font-black tracking-tighter uppercase leading-none">
                                BELLO<span className="text-white/30">MUNDO</span>
                            </h2>
                            <span className="text-[7px] text-primary-bright font-black uppercase tracking-[0.35em]">Sovereign e-Residency</span>
                        </div>
                    </div>
                    <div className="w-12 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-white/20" />
                    </div>
                </div>

                {/* ── MID ROW: Photo + Identity Fields ────── */}
                <div className="flex items-center gap-6">
                    {/* Passport Photo */}
                    <div className="relative shrink-0">
                        <div className="w-20 h-20 rounded-2xl bg-neutral-obsidian border-2 border-white/10 overflow-hidden shadow-xl group-hover:border-primary-bright/40 transition-colors duration-700">
                            {data.photoUrl ? (
                                <img src={data.photoUrl} alt="Citizen" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent" />
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary-bright flex items-center justify-center text-neutral-obsidian shadow-[0_0_16px_rgba(56,189,248,0.6)]">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                    </div>

                    {/* Identity Fields */}
                    <div className="flex-1 min-w-0 space-y-3">
                        <div>
                            <span className="text-[7px] text-white/30 uppercase tracking-[0.4em] font-black block">Authorized Diplomat</span>
                            <h3 className="text-xl text-white font-display font-black tracking-tight uppercase leading-tight truncate">
                                {data.name}
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-[6px] text-white/20 uppercase tracking-[0.3em] font-black block">Node Index</span>
                                <span className="text-[9px] font-mono text-white tracking-wider">{data.idNumber}</span>
                            </div>
                            <div>
                                <span className="text-[6px] text-white/20 uppercase tracking-[0.3em] font-black block">Term Protocol</span>
                                <span className="text-[9px] font-mono text-white tracking-wider">{data.issueDate} — {data.expiryDate}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── BOTTOM ROW: Network Address + Sector ─ */}
                <div className="flex justify-between items-end pt-4 border-t border-white/5">
                    <div className="min-w-0 flex-1">
                        <span className="text-[6px] text-white/20 uppercase tracking-[0.3em] font-black block mb-0.5">Kortana Network Registry</span>
                        <span className="text-[8px] font-mono text-white/50 tracking-wider">{shortAddr(data.walletAddress)}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 shrink-0 ml-4">
                        <MapPin className="w-3 h-3 text-primary-bright" />
                        <span className="text-[7px] font-black uppercase tracking-[0.25em] text-white">SECTOR 07 ALPHA</span>
                    </div>
                </div>
            </div>

            {/* Bio-Metric Scanline */}
            <motion.div
                className="absolute inset-x-0 h-[1px] bg-primary-bright/30 z-30 blur-[1px]"
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
            />
        </motion.div>
    );
}
