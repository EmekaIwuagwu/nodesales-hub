"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ArrowLeft, Wallet, CheckCircle2, ShieldCheck, 
    Zap, Building2, Layers, Briefcase, TrendingUp,
    MapPin, Calendar, Users, Info, ArrowRight, Activity, X
} from "lucide-react";

interface MarketAsset {
    id: string;
    title: string;
    description: string;
    type: string;
    price: string;
    yield: string;
    liquidity: string;
    progress: number;
    image: string;
    sector: string;
    totalShares: string;
}

const marketAssets: MarketAsset[] = [
    {
        id: "STO-001",
        title: "Aetheria Sky-Suite Shares",
        description: "Luxury high-rise residential equity in the Sector 7 skyline. This sky-suite represents the pinnacle of urban luxury with integrated AI systems and a 360-degree view of the city core.",
        type: "Fractional Real Estate",
        price: "4.2",
        yield: "+12.4%",
        liquidity: "High",
        progress: 85,
        image: "/luxury_penthouse_interior.png",
        sector: "Sector 7",
        totalShares: "1,000"
    },
    {
        id: "STO-002",
        title: "Autonomous Fleet Node 4",
        description: "Passive income from the city's self-healing transit network. Node 4 covers high-traffic corridors, ensuring consistent yield from autonomous transaction fees.",
        type: "Mobility Equity",
        price: "1.8",
        yield: "+8.9%",
        liquidity: "Medium",
        progress: 42,
        image: "https://images.unsplash.com/photo-1549890762-0a3f8933bc76?auto=format&fit=crop&w=800&q=80",
        sector: "Transit Core",
        totalShares: "5,000"
    },
    {
        id: "STO-003",
        title: "Solaris Energy Grid Bond",
        description: "Sustainable infrastructure yielding fixed returns from energy demand. Backed by the Sector 4 solar array, this bond offers stable returns from the city's growing energy demands.",
        type: "Utility Infrastructure",
        price: "12.5",
        yield: "+5.2%",
        liquidity: "Instant",
        progress: 100,
        image: "https://images.unsplash.com/photo-1509391366360-fe5bb6583e2c?auto=format&fit=crop&w=800&q=80",
        sector: "Sector 4",
        totalShares: "10,000"
    },
    {
        id: "STO-004",
        title: "Vertical Harvest Co-op",
        description: "Ownership in the city's primary automated food-production deck. High-yield agricultural equity in a closed-loop urban ecosystem.",
        type: "Agri-Tech Shares",
        price: "0.9",
        yield: "+15.2%",
        liquidity: "Low",
        progress: 68,
        image: "https://images.unsplash.com/photo-1530836361253-efcc5056d9fe?auto=format&fit=crop&w=800&q=80",
        sector: "Eco-Sector 2",
        totalShares: "12,500"
    },
    {
        id: "STO-005",
        title: "Cyber-Security Citadel Bond",
        description: "Bonds funding the Metropolis encryption and security layer. Essential protocol infrastructure with guaranteed sovereign backing.",
        type: "Defense & Cyber",
        price: "22.0",
        yield: "+4.1%",
        liquidity: "High",
        progress: 92,
        image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
        sector: "Command Core",
        totalShares: "1,000"
    },
    {
        id: "STO-006",
        title: "Terra-V Hydro-Plant",
        description: "Equity in water reclamation and desalination operations. Foundational utility asset for long-term portfolio stability.",
        type: "Infrastructure",
        price: "3.5",
        yield: "+7.5%",
        liquidity: "Medium",
        progress: 31,
        image: "https://images.unsplash.com/photo-1464938701291-1d3397063cb4?auto=format&fit=crop&w=800&q=80",
        sector: "Sector 1",
        totalShares: "8,000"
    },
    {
        id: "STO-007",
        title: "Genesis Server-Node Deck",
        description: "Compute power fractionalized for institutional AI leasing. Volatile but high-yield tech equity in the heart of the Data Core.",
        type: "Compute Equity",
        price: "6.8",
        yield: "+18.2%",
        liquidity: "High",
        progress: 12,
        image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc4b?auto=format&fit=crop&w=800&q=80",
        sector: "Data Core",
        totalShares: "20,000"
    },
    {
        id: "STO-008",
        title: "M-Lev Transport Hub",
        description: "Shares in the primary Magnetic Levitation hub for Sector 3. Strategic transit node with massive transaction volume and dividend potential.",
        type: "Mobility Equity",
        price: "9.2",
        yield: "+6.8%",
        liquidity: "Instant",
        progress: 55,
        image: "https://images.unsplash.com/photo-1473163928189-39a0c8a92541?auto=format&fit=crop&w=800&q=80",
        sector: "Sector 3",
        totalShares: "4,000"
    }
];

import { executeSettlement } from "@/lib/walletProvider";
import { parseEther } from "viem";

export default function AssetDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [asset, setAsset] = useState<MarketAsset | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'confirming' | 'success' | 'error'>('idle');
    const [txHash, setTxHash] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const found = marketAssets.find(a => a.id === params.id);
        if (found) {
            setAsset(found);
        }
    }, [params.id]);

    const handlePay = async () => {
        if (!asset) return;
        setPaymentStatus('confirming');
        setErrorMessage(null);

        try {
            console.log('[Marketplace] Initiating settlement for asset:', asset.id);
            const { txHash: hash } = await executeSettlement({
                valueEther: asset.price,
                paymentType: 'equity',
                description: `Acquisition: ${asset.title}`,
                serviceType: 'MARKETPLACE',
                amount: asset.price,
            });

            setTxHash(hash);
            console.log('[Marketplace] TX Hash returned:', hash);

            // Record transaction in the ledger
            await fetch("/api/transactions", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    txHash: hash,
                    paymentType: "equity",
                    recipient: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", // Treasury
                    amount: asset.price,
                    amountDNR: parseFloat(asset.price),
                    description: `Acquisition of ${asset.title} (${asset.id})`,
                    serviceId: asset.id,
                    serviceType: 'MARKETPLACE',
                }),
            });

            setPaymentStatus('success');
        } catch (error: any) {
            console.error('[Marketplace] Transaction failed:', error);
            setPaymentStatus('error');
            setErrorMessage(error.message || 'The terminal encountered a failure during settlement.');
            
            // Auto revert to idle after 5s if user rejected
            setTimeout(() => {
                if (paymentStatus !== 'success') {
                    setPaymentStatus('idle');
                }
            }, 5000);
        }
    };

    if (!asset) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <Activity className="w-12 h-12 text-primary-bright animate-spin" />
            <div className="text-[10px] font-black uppercase tracking-[0.8em] text-white/20">Accessing Vault...</div>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto pb-40 px-6 pt-12">
            {/* Navigation */}
            <button 
                onClick={() => router.push('/dashboard/marketplace')}
                className="flex items-center gap-3 text-white/40 hover:text-white transition-all mb-16 group px-4 py-2 rounded-xl hover:bg-white/5 w-fit"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Floor Directory</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                {/* Visuals & Specs */}
                <div className="lg:col-span-7 space-y-16">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative h-[600px] rounded-[4rem] overflow-hidden border border-white/5 shadow-2xl"
                    >
                        <img src={asset.image} alt={asset.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-obsidian via-neutral-obsidian/20 to-transparent" />
                        <div className="absolute bottom-16 left-16 right-16 space-y-4">
                            <motion.div 
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="px-4 py-1 rounded-full bg-primary-bright text-neutral-obsidian text-[10px] font-black uppercase tracking-widest w-fit"
                            >
                                {asset.type}
                            </motion.div>
                            <h1 className="text-6xl text-white font-display font-black uppercase tracking-tighter leading-none">{asset.title}</h1>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-3 gap-10">
                        {[
                            { icon: <TrendingUp className="w-5 h-5 text-success" />, label: "Target Yield", value: asset.yield },
                            { icon: <Layers className="w-5 h-5 text-primary-bright" />, label: "Liquidity Grade", value: asset.liquidity },
                            { icon: <ShieldCheck className="w-5 h-5 text-secondary-warm" />, label: "Risk Profile", value: "Sovereign" }
                        ].map((stat, i) => (
                            <div key={i} className="sexy-card !bg-white/[0.02] border-white/5 p-8 space-y-4">
                                <div className="flex items-center gap-3 text-white/20">
                                    {stat.icon}
                                    <span className="text-[9px] font-black uppercase tracking-widest">{stat.label}</span>
                                </div>
                                <div className="text-2xl text-white font-display font-black uppercase">{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    <div className="sexy-card !bg-transparent border-white/5 p-12 space-y-10">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                                <Info className="w-6 h-6 text-primary-bright" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-white font-display font-black uppercase tracking-[0.2em]">Sovereign Underwriting</h3>
                                <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Asset ID: {asset.id}</p>
                            </div>
                        </div>
                        
                        <p className="text-neutral-dim text-xl leading-relaxed font-medium tracking-wide">
                            {asset.description}
                        </p>

                        <div className="grid grid-cols-2 gap-12 pt-10 border-t border-white/5">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 group">
                                    <div className="p-2 rounded-lg bg-primary-bright/10 text-primary-bright">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] text-white/40 font-black uppercase tracking-widest group-hover:text-white transition-colors">{asset.sector} Zone</span>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="p-2 rounded-lg bg-primary-bright/10 text-primary-bright">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] text-white/40 font-black uppercase tracking-widest group-hover:text-white transition-colors">72h Lock Clause</span>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 group">
                                    <div className="p-2 rounded-lg bg-primary-bright/10 text-primary-bright">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] text-white/40 font-black uppercase tracking-widest group-hover:text-white transition-colors">{asset.totalShares} Shares</span>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="p-2 rounded-lg bg-primary-bright/10 text-primary-bright">
                                        <Zap className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] text-white/40 font-black uppercase tracking-widest group-hover:text-white transition-colors">Audit Verified</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settlement Terminal */}
                <div className="lg:col-span-5">
                    <div className="sticky top-12 space-y-10">
                        <section className="sexy-card !bg-white/[0.03] border-white/10 p-12 space-y-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Building2 className="w-32 h-32" />
                            </div>

                            <div className="space-y-4 text-center pb-10 border-b border-white/5">
                                <span className="text-[11px] text-white/20 font-black uppercase tracking-[0.5em]">Settlement Quote</span>
                                <div className="text-7xl text-white font-display font-black uppercase tracking-tighter">◈ {asset.price}</div>
                                <p className="text-primary-bright font-black uppercase tracking-[0.3em] text-[12px]">Kortana $DNR</p>
                            </div>

                            <div className="space-y-8">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-white/30">Contract Price</span>
                                    <span className="text-white font-mono">◈ {asset.price}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-white/30">Network Gas (0x)</span>
                                    <span className="text-white font-mono">◈ 0.0005</span>
                                </div>
                                <div className="h-[1px] bg-white/5" />
                                <div className="flex justify-between items-center text-2xl font-black uppercase tracking-widest">
                                    <span className="text-white/40 text-xs">Total payable</span>
                                    <span className="sexy-gradient-text font-display">◈ {(parseFloat(asset.price) + 0.0005).toFixed(4)}</span>
                                </div>
                            </div>

                            <button 
                                onClick={handlePay}
                                disabled={paymentStatus !== 'idle'}
                                className="w-full py-8 rounded-[2rem] bg-white text-neutral-obsidian text-[12px] font-black uppercase tracking-[0.4em] hover:bg-primary-bright hover:shadow-[0_0_30px_rgba(56,189,248,0.4)] transition-all flex items-center justify-center gap-4 disabled:opacity-20 disabled:cursor-not-allowed group"
                            >
                                <Wallet className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                EXECUTE SETTLEMENT
                            </button>

                            <div className="flex items-center gap-4 justify-center text-[9px] text-white/10 font-black uppercase tracking-widest">
                                <ShieldCheck className="w-4 h-4" />
                                Sovereign Smart-Contract Protection
                            </div>
                        </section>

                        {/* Animated Feedback Terminal */}
                        <AnimatePresence>
                            {(paymentStatus === 'confirming' || paymentStatus === 'success' || paymentStatus === 'error') && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="sexy-card !bg-neutral-900 border-primary-bright/30 p-12 flex flex-col items-center text-center space-y-10 shadow-2xl z-50"
                                >
                                    {paymentStatus === 'confirming' ? (
                                        <>
                                            <div className="w-24 h-24 relative flex items-center justify-center">
                                                <div className="absolute inset-0 rounded-full border-8 border-white/5 animate-pulse"></div>
                                                <div className="absolute inset-0 rounded-full border-8 border-primary-bright border-t-transparent animate-spin"></div>
                                                <Wallet className="w-8 h-8 text-primary-bright" />
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="text-white font-display font-black tracking-[0.2em] uppercase text-2xl">Awaiting Signature</h4>
                                                <p className="text-white/40 text-[11px] uppercase font-black tracking-[0.2em] leading-relaxed max-w-[280px]">
                                                    Authenticate the transaction in your connected wallet extension...
                                                </p>
                                            </div>
                                        </>
                                    ) : paymentStatus === 'success' ? (
                                        <>
                                            <div className="w-28 h-28 bg-success/10 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                                                <CheckCircle2 className="w-14 h-14 text-success" />
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="text-white font-display font-black tracking-[0.2em] uppercase text-3xl">Asset Secured</h4>
                                                <div className="bg-white/5 rounded-2xl p-6 mt-6 space-y-4 text-left border border-white/5">
                                                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                                        <span className="text-[9px] text-white/20 font-black uppercase tracking-widest">Transaction Hash</span>
                                                        <ArrowRight className="w-3 h-3 text-primary-bright" />
                                                    </div>
                                                    <div className="text-[11px] text-primary-bright font-mono break-all leading-relaxed lining-nums">
                                                        {txHash || 'Processing...'}
                                                    </div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => router.push('/dashboard/marketplace')}
                                                className="w-full py-6 bg-white/[0.03] border border-white/10 text-white hover:bg-white hover:text-neutral-obsidian text-[10px] font-black uppercase tracking-[0.4em] transition-all rounded-3xl"
                                            >
                                                Return to Floor
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-24 h-24 bg-error/10 rounded-full flex items-center justify-center border border-error/20">
                                                <X className="w-10 h-10 text-error" />
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="text-white font-display font-black tracking-[0.2em] uppercase text-2xl">Settlement Failed</h4>
                                                <p className="text-error/60 text-[11px] uppercase font-black tracking-[0.2em] leading-relaxed max-w-[280px]">
                                                    {errorMessage || 'The protocol rejected the transaction request.'}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => setPaymentStatus('idle')}
                                                className="w-full py-6 bg-white/[0.03] border border-white/10 text-white hover:border-white/40 text-[10px] font-black uppercase tracking-[0.4em] transition-all rounded-3xl"
                                            >
                                                Try Again
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
