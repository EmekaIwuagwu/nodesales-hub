"use client";

import { motion } from "framer-motion";
import { formatUnits } from "viem";
import { useBalance } from "wagmi";
import { useSession } from "next-auth/react";
import { Wifi, Cpu } from "lucide-react";

export default function WalletCard() {
    const { data: session } = useSession();

    // Use the address from the authenticated session — this is always correct
    // regardless of which wallet (MetaMask, Kortana, etc.) was used to log in.
    const sessionAddress = (session?.user as any)?.address as `0x${string}` | undefined;

    const { data: balanceData } = useBalance({
        address: sessionAddress,
    });

    const displayBalance = balanceData
        ? formatUnits(balanceData.value, 18).split('.')
        : ["0", "00"];

    const formattedInt = parseFloat(displayBalance[0]).toLocaleString();
    const shortenedAddress = sessionAddress
        ? `${sessionAddress.slice(0, 8)}...${sessionAddress.slice(-6)}`
        : "NOT CONNECTED";

    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="relative w-full aspect-[1.6/1] rounded-[3rem] overflow-hidden luxury-glass border border-white/10 group cursor-pointer shadow-2xl"
        >
            {/* Architectural Background Texture */}
            <div className="absolute inset-0 opacity-10 mix-blend-overlay">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80')] bg-cover" />
            </div>

            {/* Glowing Core */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary-bright/10 blur-[100px] rounded-full group-hover:bg-primary-bright/20 transition-colors duration-1000" />

            <div className="relative z-10 h-full p-10 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-2">
                            <Wifi className="w-6 h-6 text-primary-bright" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Sovereign Vault</span>
                            <span className="text-[9px] font-mono text-white/30">BN-AUTH-M2</span>
                        </div>
                    </div>
                    <Cpu className="w-8 h-8 text-white/10 group-hover:text-white/40 transition-colors" />
                </div>

                <div className="space-y-2">
                    <span className="text-[10px] text-white/40 uppercase tracking-[0.6em] font-black block">Available Liquidity</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-6xl text-white font-display font-black tracking-tighter">
                            ◈ {sessionAddress ? formattedInt : "---"}
                        </span>
                        <span className="text-2xl text-white/40 font-display font-medium">
                            .{sessionAddress ? (displayBalance[1]?.slice(0, 2) || "00") : "--"}
                        </span>
                        <span className="text-xs text-primary-bright font-black ml-4 tracking-widest uppercase">DNR</span>
                    </div>
                    <div className="text-[10px] text-success font-black tracking-widest uppercase flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${sessionAddress ? 'bg-success animate-pulse' : 'bg-white/20'}`} />
                        {sessionAddress ? 'Asset Value Verified On-Chain' : 'Waiting for Authorization'}
                    </div>
                </div>

                <div className="flex justify-between items-end border-t border-white/5 pt-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-[8px] text-white/30 uppercase tracking-[0.4em] font-black">Contract Registry</span>
                        <span className="text-xs font-mono text-white tracking-widest uppercase">{shortenedAddress}</span>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-white uppercase tracking-widest">
                        METROPOLIS ALPHA
                    </div>
                </div>
            </div>

            {/* Kinetic Shimmer */}
            <motion.div
                className="absolute inset-0 z-20 pointer-events-none"
                animate={{
                    background: ["linear-gradient(45deg, transparent 0%, rgba(255,255,255,0) 45%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 55%, transparent 100%)", "linear-gradient(135deg, transparent 0%, rgba(255,255,255,0) 45%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 55%, transparent 100%)"]
                }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            />
        </motion.div>
    );
}
