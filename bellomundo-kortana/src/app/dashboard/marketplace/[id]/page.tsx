"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ArrowLeft, Wallet, CheckCircle2, ShieldCheck, 
    Zap, Building2, Layers, Briefcase, TrendingUp,
    MapPin, Calendar, Users, Info
} from "lucide-react";

interface MarketAsset {
    id: string;
    title: string;
    type: string;
    price: string;
    yield: string;
    liquidity: string;
    progress: number;
    image: string;
    sector: string;
    totalShares: string;
    description: string;
}

const marketAssets: MarketAsset[] = [
    {
        id: "STO-001",
        title: "Aetheria Sky-Suite Shares",
        type: "Fractional Real Estate",
        price: "4.2",
        yield: "+12.4%",
        liquidity: "High",
        progress: 85,
        image: "/luxury_penthouse_interior.png",
        sector: "Sector 7",
        totalShares: "1,000",
        description: "Premium high-rise living in the heart of Sector 7. This sky-suite represents the pinnacle of urban luxury with integrated AI systems and a 360-degree view of the city core."
    },
    {
        id: "STO-002",
        title: "Autonomous Fleet Node 4",
        type: "Mobility Equity",
        price: "1.8",
        yield: "+8.9%",
        liquidity: "Medium",
        progress: 42,
        image: "https://images.unsplash.com/photo-1549890762-0a3f8933bc76?auto=format&fit=crop&w=800&q=80",
        sector: "Transit Core",
        totalShares: "5,000",
        description: "Direct ownership in the city's self-healing transit network. Node 4 covers high-traffic corridors, ensuring consistent yield from autonomous transaction fees."
    },
    {
        id: "STO-003",
        title: "Solaris Energy Grid Bond",
        type: "Utility Infrastructure",
        price: "12.5",
        yield: "+5.2%",
        liquidity: "Instant",
        progress: 100,
        image: "https://images.unsplash.com/photo-1509391366360-fe5bb6583e2c?auto=format&fit=crop&w=800&q=80",
        sector: "Sector 4",
        totalShares: "10,000",
        description: "Backed by the Sector 4 solar array, this bond offers stable returns from the city's growing energy demands. A foundational asset for any urban portfolio."
    }
];

export default function AssetDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [asset, setAsset] = useState<MarketAsset | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'confirming' | 'success'>('idle');

    useEffect(() => {
        const found = marketAssets.find(a => a.id === params.id);
        if (found) {
            setAsset(found);
        }
    }, [params.id]);

    const handlePay = () => {
        setPaymentStatus('confirming');
        // Simulate wallet opening and transaction process
        setTimeout(() => {
            setPaymentStatus('success');
        }, 3000); 
    };

    if (!asset) return null;

    return (
        <div className="max-w-7xl mx-auto pb-40 px-4 pt-8">
            {/* Back Button */}
            <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-12 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Back to Marketplace</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Left: Asset Visuals & Info */}
                <div className="lg:col-span-7 space-y-12">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative h-[500px] rounded-[3rem] overflow-hidden border border-white/5"
                    >
                        <img src={asset.image} alt={asset.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-obsidian via-transparent to-transparent" />
                        <div className="absolute bottom-10 left-10 space-y-2">
                            <div className="text-[10px] text-primary-bright font-black uppercase tracking-widest">{asset.type}</div>
                            <h1 className="text-5xl text-white font-display font-black uppercase tracking-tight">{asset.title}</h1>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-3 gap-8">
                        {[
                            { icon: <TrendingUp className="w-4 h-4 text-success" />, label: "Yield", value: asset.yield },
                            { icon: <Layers className="w-4 h-4 text-primary-bright" />, label: "Liquidity", value: asset.liquidity },
                            { icon: <ShieldCheck className="w-4 h-4 text-secondary-warm" />, label: "Status", value: "Verified" }
                        ].map((stat, i) => (
                            <div key={i} className="sexy-card !bg-white/[0.02] border-white/5 p-6 space-y-2">
                                <div className="flex items-center gap-2">
                                    {stat.icon}
                                    <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">{stat.label}</span>
                                </div>
                                <div className="text-xl text-white font-display font-black uppercase">{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    <div className="sexy-card !bg-transparent border-white/5 p-10 space-y-6">
                        <div className="flex items-center gap-4 text-white/50">
                            <Info className="w-5 h-5" />
                            <h3 className="font-display font-black uppercase tracking-widest">Product Intelligence</h3>
                        </div>
                        <p className="text-neutral-dim text-lg leading-relaxed font-medium">
                            {asset.description}
                        </p>
                        <div className="grid grid-cols-2 gap-10 pt-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-primary-bright" />
                                    <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">{asset.sector} Jurisdiction</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-primary-bright" />
                                    <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Est. Settlement: 2.4s</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Users className="w-4 h-4 text-primary-bright" />
                                    <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">{asset.totalShares} Shares Issued</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Zap className="w-4 h-4 text-primary-bright" />
                                    <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Smart Contract Audited</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Payment Sidebar */}
                <div className="lg:col-span-5">
                    <div className="sticky top-8 space-y-8">
                        <div className="sexy-card !bg-white/[0.03] border-white/10 p-10 space-y-10">
                            <div className="space-y-2 text-center pb-6 border-b border-white/5">
                                <span className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em]">Acquisition Summary</span>
                                <div className="text-6xl text-white font-display font-black uppercase tracking-tight">◈ {asset.price} <span className="text-xl text-primary-bright">DNR</span></div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center text-sm font-black uppercase tracking-widest">
                                    <span className="text-white/30">Asset Price</span>
                                    <span className="text-white font-mono">◈ {asset.price} DNR</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-black uppercase tracking-widest">
                                    <span className="text-white/30">Network Surcharge</span>
                                    <span className="text-white font-mono">◈ 0.005 DNR</span>
                                </div>
                                <div className="h-[1px] bg-white/5" />
                                <div className="flex justify-between items-center text-xl font-black uppercase tracking-widest">
                                    <span className="text-white">Total Amount</span>
                                    <span className="text-primary-bright font-mono">◈ {(parseFloat(asset.price) + 0.005).toFixed(3)} DNR</span>
                                </div>
                            </div>

                            <button 
                                onClick={handlePay}
                                disabled={paymentStatus !== 'idle'}
                                className="w-full py-6 rounded-2xl bg-white text-neutral-obsidian text-[12px] font-black uppercase tracking-[0.3em] hover:bg-primary-bright transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                <Wallet className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                EXECUTE PAYMENT
                            </button>

                            <div className="flex items-center gap-3 justify-center text-[9px] text-white/20 font-black uppercase tracking-widest">
                                <ShieldCheck className="w-3 h-3" />
                                Secured by Metropolis Protocol v2.4
                            </div>
                        </div>

                        {/* Transaction Status Overlay */}
                        <AnimatePresence>
                            {(paymentStatus === 'confirming' || paymentStatus === 'success') && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="sexy-card !bg-neutral-900 border-primary-bright/20 p-8 flex flex-col items-center text-center space-y-6 relative overflow-hidden"
                                >
                                    {paymentStatus === 'confirming' ? (
                                        <>
                                            <div className="w-16 h-16 relative flex items-center justify-center">
                                                <div className="absolute inset-0 rounded-full border-4 border-white/5"></div>
                                                <div className="absolute inset-0 rounded-full border-4 border-primary-bright border-t-transparent animate-spin"></div>
                                                <Wallet className="w-6 h-6 text-primary-bright animate-pulse" />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-white font-display font-black tracking-widest uppercase text-lg">Awaiting Wallet Signature</h4>
                                                <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest leading-loose px-4">
                                                    Check your connected wallet provider for the signing request...
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center">
                                                <CheckCircle2 className="w-10 h-10 text-success" />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-white font-display font-black tracking-widest uppercase text-2xl">Transaction Success</h4>
                                                <div className="bg-white/5 rounded-xl p-3 mt-4 space-y-1 text-left">
                                                    <span className="text-[8px] text-white/30 font-black uppercase tracking-widest">Hash</span>
                                                    <div className="text-[10px] text-primary-bright font-mono break-all leading-tight">0x7d9...a8f4b2e9c1d0f5e7a9b3c6d2e4f8a1b0c9d5e7f3</div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => router.push('/dashboard/marketplace')}
                                                className="w-full py-4 bg-white/5 border border-white/10 text-white hover:bg-white hover:text-neutral-obsidian text-[10px] font-black uppercase tracking-widest transition-all rounded-xl"
                                            >
                                                Return to Marketplace
                                            </button>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
