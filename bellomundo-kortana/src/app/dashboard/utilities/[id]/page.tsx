"use client";

import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft, Zap, Droplets, Wifi, Flame, Trash2,
    Thermometer, ShieldCheck, Activity, Globe,
    Loader2, AlertCircle, Info, PieChart
} from "lucide-react";
import { useState } from "react";
import { executeSettlement } from "@/lib/walletProvider";

const utilitiesData = [
    { id: "1", type: "electricity", icon: <Zap className="w-10 h-10" />, label: "Grid Electricity", bill: "45.00", usage: "1,240 kWh", description: "Standard grid electricity settlement for sector-specific consumption. Includes maintenance for local energy buffers and high-speed transmission nodes." },
    { id: "2", type: "water", icon: <Droplets className="w-10 h-10" />, label: "Hydro-Loop Unit", bill: "22.50", usage: "12.4 m³", description: "Purified water supply via the Kortana City Hydro-Loop. This service covers both consumption and closed-loop reclamation protocols." },
    { id: "3", type: "internet", icon: <Wifi className="w-10 h-10" />, label: "Quantum Fiber 10G", bill: "35.00", usage: "840 GB", description: "Ultra-low latency quantum fiber connection. Guaranteed 10Gbps symmetric throughout the metropolis with built-in hardware encryption." },
    { id: "4", type: "gas", icon: <Flame className="w-10 h-10" />, label: "Thermal Buffer", bill: "18.20", usage: "45.2 m³", description: "Integrated thermal energy settlement. Used for specialized climate control and high-efficiency appliance operation." },
    { id: "5", type: "waste", icon: <Trash2 className="w-10 h-10" />, label: "Matter Reclamation", bill: "10.00", usage: "REGULAR", description: "Automated matter reclamation service. All waste is sorted and processed into raw molecular feedstock for city manufacturing." },
    { id: "6", type: "heating", icon: <Thermometer className="w-10 h-10" />, label: "Sector Heating", bill: "28.40", usage: "4.2 GJ", description: "District-wide heating protocols powered by industrial heat exchangers. Keeps sector ambient temperatures optimal during atmospheric shifts." },
];

export default function UtilityDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [isSettling, setIsSettling] = useState(false);
    const [isSettled, setIsSettled] = useState(false);
    const [txError, setTxError] = useState<string | null>(null);
    const [txStatus, setTxStatus] = useState<string | null>(null);
    const id = params.id as string;
    const utility = utilitiesData.find(u => u.id === id);

    // Persistence Check
    useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(`utility_settled_${id}`);
            if (saved === 'true') {
                setIsSettled(true);
            }
        }
    });

    if (!utility) return <div className="p-20 text-white font-black uppercase">SERVICE PROTOCOL NOT FOUND.</div>;

    const handleSettle = async () => {
        setIsSettling(true);
        setTxError(null);
        setTxStatus('Connecting to wallet...');
        try {
            setTxStatus('Waiting for wallet approval...');
            const { txHash } = await executeSettlement({
                valueEther: utility.bill,
                paymentType: 'utility',
                description: `Utility Settlement: ${utility.label} in Kortana City`,
                serviceType: 'UTILITY',
                amount: utility.bill,
            });

            setTxStatus('Recording on ledger...');

            // Persist
            localStorage.setItem(`utility_settled_${id}`, 'true');
            setIsSettled(true);

            await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    txHash,
                    paymentType: 'utility',
                    recipient: 'TREASURY',
                    amount: utility.bill,
                    amountDNR: parseFloat(utility.bill),
                    description: `Utility Settlement: ${utility.label} in Kortana City`,
                    serviceType: 'UTILITY',
                }),
            });

            setTxStatus('Protocol Successful.');
            setTimeout(() => {
                router.push(`/dashboard/settlement/success?type=utility&id=${id}&txHash=${txHash}`);
            }, 1500);
        } catch (e: any) {
            console.error('[Utility TX] Failed:', e);
            const code = e?.code;
            const msg: string = e?.message || '';
            if (code === 4001 || msg.toLowerCase().includes('rejected') || msg.toLowerCase().includes('denied')) {
                setTxError('Transaction rejected. Please approve in your wallet.');
            } else {
                setTxError(msg || 'Utility settlement failed. Please try again.');
            }
        } finally {
            setIsSettling(false);
            setTxStatus(null);
        }
    };

    return (
        <div className="flex flex-col gap-12 pb-40">
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => router.back()}
                className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-white transition-all w-fit"
            >
                <ChevronLeft className="w-5 h-5" /> Back to Resource Grid
            </motion.button>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">
                <div className="xl:col-span-7 space-y-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="sexy-card !p-12 h-[400px] flex flex-col items-center justify-center gap-8 relative overflow-hidden bg-white/[0.01]"
                    >
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-bright/5 blur-[120px] rounded-full" />
                        <div className="w-32 h-32 rounded-[2.5rem] bg-neutral-obsidian border border-white/10 flex items-center justify-center text-primary-bright z-10">
                            {utility.icon}
                        </div>
                        <div className="text-center space-y-2 z-10">
                            <h1 className="text-5xl font-display font-black text-white uppercase tracking-tight">{utility.label}</h1>
                            <div className="text-[10px] text-white/20 font-black uppercase tracking-[0.5em] flex items-center justify-center gap-4">
                                <Globe className="w-4 h-4" /> KORTANA CITY RESOURCE GRID
                            </div>
                        </div>
                    </motion.div>

                    <div className="sexy-card !p-12 space-y-8 !bg-white/[0.01]">
                        <div className="flex items-center gap-4 text-[10px] text-white/40 font-black uppercase tracking-widest">
                            <Info className="w-5 h-5" /> Service Parameters
                        </div>
                        <p className="text-xl text-neutral-dim font-medium leading-relaxed italic">
                            "{utility.description}"
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="sexy-card !bg-white/[0.01] !p-10 space-y-6">
                            <div className="flex items-center gap-4">
                                <Activity className="text-primary-bright w-5 h-5" />
                                <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Real-Time Usage</span>
                            </div>
                            <div className="text-4xl text-white font-display font-black">{utility.usage}</div>
                            <span className="text-[8px] text-white/20 font-black uppercase tracking-widest">Aggregated from sector sensors</span>
                        </div>
                        <div className="sexy-card !bg-white/[0.01] !p-10 space-y-6">
                            <div className="flex items-center gap-4">
                                <PieChart className="text-secondary-warm w-5 h-5" />
                                <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Efficiency Bracket</span>
                            </div>
                            <div className="text-4xl text-white font-display font-black text-secondary-warm">CLASS A+</div>
                            <span className="text-[8px] text-white/20 font-black uppercase tracking-widest">Optimal consumption tier</span>
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-5 space-y-10">
                    <div className="sexy-card !bg-white/5 border-white/10 !p-12 space-y-10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-white/20">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Pending Settlement</span>
                            </div>
                            <div className="text-7xl text-white font-display font-black tracking-tighter uppercase whitespace-nowrap">◈ {utility.bill}</div>
                            <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">DNR / CURRENT CYCLE</span>
                        </div>

                        <div className="space-y-4">
                            <button
                                type="button"
                                onClick={handleSettle}
                                disabled={isSettling || isSettled}
                                style={{ position: 'relative', zIndex: 10, pointerEvents: 'all' }}
                                className={`w-full py-8 rounded-3xl text-[11px] font-black uppercase tracking-[0.5em] flex items-center justify-center gap-6 transition-all shadow-2xl ${isSettled ? 'bg-success text-neutral-obsidian' : 'bg-white text-neutral-obsidian hover:bg-neutral-200 active:scale-95'}`}
                            >
                                {isSettling ? <Loader2 className="w-6 h-6 animate-spin" /> : isSettled ? <ShieldCheck className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                                {isSettled ? "SERVICE VERIFIED" : isSettling ? "AUTHORIZING..." : "EXECUTE SETTLEMENT"}
                            </button>

                            <AnimatePresence>
                                {txStatus && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="text-[10px] text-primary-bright font-black uppercase tracking-[0.2em] text-center"
                                    >
                                        {txStatus}
                                    </motion.div>
                                )}
                                {txError && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest text-center"
                                    >
                                        {txError}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="sexy-card !bg-white/[0.01] !p-10 space-y-8">
                        <h4 className="text-[10px] text-white/20 font-black uppercase tracking-widest">Automated Protocols</h4>
                        <div className="space-y-6">
                            {[
                                "Smart-Metering Integration",
                                "Autonomous Load Balancing",
                                "Leak & Fault Detection",
                                "Blockchain Verified Billing"
                            ].map((p, i) => (
                                <div key={i} className="flex items-center gap-4 border-b border-white/5 pb-4 last:border-0">
                                    <div className="w-6 h-6 rounded-lg bg-primary-bright/10 flex items-center justify-center text-primary-bright">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] text-white/60 font-medium uppercase tracking-widest">{p}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
