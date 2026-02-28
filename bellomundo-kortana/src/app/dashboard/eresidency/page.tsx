"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import EResidencyCard, { EResidencyData } from "@/components/EResidency/EResidencyCard";
import {
    Download, Share2, ShieldCheck, UserPlus, FileUp,
    ArrowRight, Shield, Activity, Globe, Loader2,
    Camera, X, CheckCircle2, ChevronRight
} from "lucide-react";
import { executeSettlement } from "@/lib/walletProvider";
import { getActiveWalletId } from "@/lib/walletProvider";

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateIdNumber(address: string): string {
    const hash = address.slice(2, 8).toUpperCase();
    return `BM-S7-${hash.slice(0, 4)}-${hash.slice(4, 8) || '1234'}`;
}

function getStorageKey(address: string) {
    return `bm_residency_${address.toLowerCase()}`;
}

function loadResidencyData(address: string): (EResidencyData & { registered: boolean }) | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(getStorageKey(address));
        if (!raw) return null;
        return JSON.parse(raw);
    } catch { return null; }
}

function saveResidencyData(address: string, data: EResidencyData) {
    localStorage.setItem(getStorageKey(address), JSON.stringify({ ...data, registered: true }));
}

// ── Registration Modal ────────────────────────────────────────────────────────

type ModalStep = 'name' | 'photo' | 'signing' | 'done';

function RegistrationModal({
    onClose,
    onComplete,
    walletAddress,
}: {
    onClose: () => void;
    onComplete: (data: { name: string; photoUrl: string }) => void;
    walletAddress: string;
}) {
    const [step, setStep] = useState<ModalStep>('name');
    const [fullName, setFullName] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [error, setError] = useState('');
    const [txStatus, setTxStatus] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setPhotoUrl(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleComplete = async () => {
        setStep('signing');
        setTxStatus('Connecting to wallet...');
        setError('');

        try {
            setTxStatus('Waiting for wallet approval...');
            // Registration is a small fee (0.01 DNR) or free — we use 0.01 for demonstration
            const { txHash } = await executeSettlement({
                valueEther: '0.01',
                paymentType: 'identity',
                description: `e-Residency Registration: ${fullName}`,
                serviceType: 'IDENTITY',
                amount: '0.01',
            });

            setTxStatus('Recording identity on ledger...');
            await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    txHash,
                    paymentType: 'identity',
                    recipient: 'CITY_REGISTRY',
                    amount: '0.01',
                    amountDNR: 0.01,
                    description: `e-Residency Registration: ${fullName}`,
                    serviceType: 'IDENTITY',
                }),
            });

            setStep('done');
            setTimeout(() => onComplete({ name: fullName, photoUrl }), 1500);

        } catch (e: any) {
            const msg = e?.message || 'Registration failed.';
            if (msg.toLowerCase().includes('rejected') || e?.code === 4001) {
                setError('Transaction rejected. Please approve in your wallet.');
            } else {
                setError(msg);
            }
            setStep('photo');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-6"
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-neutral-obsidian/80 backdrop-blur-xl" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                className="relative w-full max-w-lg luxury-glass border border-white/10 rounded-[3rem] p-12 shadow-2xl"
            >
                {/* Close */}
                <button onClick={onClose} className="absolute top-8 right-8 p-3 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all">
                    <X className="w-5 h-5" />
                </button>

                {/* Step Indicator */}
                <div className="flex items-center gap-3 mb-10">
                    {(['name', 'photo'] as ModalStep[]).map((s, i) => (
                        <div key={s} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${step === s || step === 'signing' || step === 'done' ? 'bg-primary-bright text-neutral-obsidian' : 'bg-white/5 border border-white/10 text-white/30'}`}>
                                {i + 1}
                            </div>
                            {i === 0 && <div className="w-8 h-[1px] bg-white/10" />}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* ── STEP 1: Name ── */}
                    {step === 'name' && (
                        <motion.div key="name" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                            <div className="space-y-3">
                                <div className="text-[10px] text-primary-bright font-black uppercase tracking-[0.6em]">Step 1 of 2</div>
                                <h2 className="text-4xl font-display font-black text-white uppercase tracking-tight">
                                    Your Name <br /><span className="sexy-gradient-text">On Record.</span>
                                </h2>
                                <p className="text-neutral-dim text-sm font-medium">Enter your full legal name as it will appear on your e-Residency credential.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] text-white/30 font-black uppercase tracking-widest">Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && fullName.trim().length > 1 && setStep('photo')}
                                    placeholder="e.g. EMEKA IWUAGWU"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-lg font-display font-black uppercase tracking-widest outline-none focus:border-primary-bright/50 transition-all placeholder:text-white/10"
                                    autoFocus
                                />
                            </div>

                            <button
                                onClick={() => setStep('photo')}
                                disabled={fullName.trim().length < 2}
                                className="w-full btn-sexy disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Continue <ChevronRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}

                    {/* ── STEP 2: Photo ── */}
                    {step === 'photo' && (
                        <motion.div key="photo" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                            <div className="space-y-3">
                                <div className="text-[10px] text-primary-bright font-black uppercase tracking-[0.6em]">Step 2 of 2</div>
                                <h2 className="text-4xl font-display font-black text-white uppercase tracking-tight">
                                    Identity <br /><span className="sexy-gradient-text">Portrait.</span>
                                </h2>
                                <p className="text-neutral-dim text-sm font-medium">Upload a passport-style photo for your e-Residency card.</p>
                            </div>

                            {/* Photo upload zone */}
                            <div
                                onClick={() => fileRef.current?.click()}
                                className={`relative h-48 rounded-3xl border-2 ${photoUrl ? 'border-primary-bright/40' : 'border-dashed border-white/10'} flex items-center justify-center cursor-pointer hover:border-primary-bright/30 transition-all overflow-hidden group`}
                            >
                                {photoUrl ? (
                                    <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-4 text-white/20 group-hover:text-white/60 transition-colors">
                                        <Camera className="w-10 h-10" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Click to Upload Photo</span>
                                    </div>
                                )}
                                {photoUrl && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Change Photo</span>
                                    </div>
                                )}
                            </div>
                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />

                            {error && (
                                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest text-center">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button onClick={() => setStep('name')} className="flex-1 py-4 rounded-2xl border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">
                                    Back
                                </button>
                                <button
                                    onClick={handleComplete}
                                    disabled={!photoUrl}
                                    className="flex-[2] btn-sexy-gold disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ShieldCheck className="w-5 h-5" />
                                    Complete & Sign
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── SIGNING ── */}
                    {step === 'signing' && (
                        <motion.div key="signing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-center py-8">
                            <div className="w-24 h-24 rounded-full bg-primary-bright/10 border border-primary-bright/20 flex items-center justify-center mx-auto">
                                <Loader2 className="w-10 h-10 text-primary-bright animate-spin" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-display font-black text-white uppercase">Broadcasting...</h3>
                                <p className="text-[10px] text-primary-bright font-black uppercase tracking-widest">{txStatus}</p>
                            </div>
                        </motion.div>
                    )}

                    {/* ── DONE ── */}
                    {step === 'done' && (
                        <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-center py-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                                className="w-24 h-24 rounded-full bg-success/20 border border-success/30 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(34,197,94,0.3)]"
                            >
                                <CheckCircle2 className="w-10 h-10 text-success" />
                            </motion.div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-display font-black text-white uppercase">Identity Minted!</h3>
                                <p className="text-[10px] text-success font-black uppercase tracking-widest">Sovereign e-Residency Active</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function EResidencyPage() {
    const { data: session } = useSession();
    const [showModal, setShowModal] = useState(false);
    const [residencyData, setResidencyData] = useState<EResidencyData | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);

    // Get address from session (works regardless of Wagmi connection)
    const walletAddress = (session?.user as any)?.address || '';

    useEffect(() => {
        if (!walletAddress) return;
        const stored = loadResidencyData(walletAddress);
        if (stored?.registered) {
            setResidencyData(stored);
            setIsRegistered(true);
        }
    }, [walletAddress]);

    const handleRegistrationComplete = ({ name, photoUrl }: { name: string; photoUrl: string }) => {
        const now = new Date();
        const expiry = new Date(now);
        expiry.setFullYear(expiry.getFullYear() + 3);

        const formatDate = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

        const data: EResidencyData = {
            name: name.toUpperCase(),
            idNumber: generateIdNumber(walletAddress),
            walletAddress,
            issueDate: formatDate(now),
            expiryDate: formatDate(expiry),
            photoUrl,
        };

        saveResidencyData(walletAddress, data);
        setResidencyData(data);
        setIsRegistered(true);
        setShowModal(false);
    };

    // Card display data — unregistered state shows placeholder
    const cardDisplayData: EResidencyData = residencyData || {
        name: "UNREGISTERED CITIZEN",
        idNumber: "UNASSIGNED",
        walletAddress: walletAddress || "0x0000...0000",
        issueDate: "PENDING",
        expiryDate: "N/A",
        photoUrl: undefined,
    };

    return (
        <div className="flex flex-col gap-16">
            {/* ── Header ── */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row lg:items-end justify-between gap-10"
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.6em] text-primary-bright">
                        <Shield className="w-4 h-4" />
                        Sovereign Identity Protocol
                    </div>
                    <h1 className="text-7xl md:text-8xl font-display font-black text-white leading-[0.85] tracking-tight uppercase">
                        CIVIC <br />
                        <span className="sexy-gradient-text">IDENTITY.</span>
                    </h1>
                </div>

                <div className="flex gap-6">
                    {!isRegistered ? (
                        <button onClick={() => setShowModal(true)} className="btn-sexy min-w-[280px]">
                            <ShieldCheck className="w-5 h-5" />
                            Apply for Residency
                        </button>
                    ) : (
                        <>
                            <button className="btn-sexy min-w-[220px]">
                                <Share2 className="w-4 h-4" /> Distribute Node
                            </button>
                            <button className="btn-sexy-gold min-w-[220px]">
                                <Download className="w-4 h-4" /> Export Ledger
                            </button>
                        </>
                    )}
                </div>
            </motion.div>

            <div className="flex flex-col gap-16">
                {/* ── Card Showcase ── */}
                <div className="flex flex-col items-center justify-center py-20 bg-white/[0.01] rounded-[4rem] border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.05),_transparent_70%)]" />

                    <div className="max-w-[640px] w-full px-8 relative z-10">
                        <div className="text-[10px] text-white/20 uppercase tracking-[0.8em] font-black mb-8 text-center">
                            {isRegistered ? "ACTIVE CRYPTOGRAPHIC CREDENTIALS" : "REGISTRATION REQUIRED"}
                        </div>

                        <div className={isRegistered ? "" : "blur-sm grayscale opacity-30 pointer-events-none"}>
                            <EResidencyCard data={cardDisplayData} />
                        </div>

                        {!isRegistered && (
                            <div className="mt-8 text-center space-y-4">
                                <h3 className="text-2xl text-white font-display font-black uppercase">Identity Not Found</h3>
                                <p className="text-neutral-dim text-sm">Initialize your sovereign e-Residency to unlock Metropolis access.</p>
                                <button onClick={() => setShowModal(true)} className="btn-sexy mx-auto">
                                    <UserPlus className="w-5 h-5" />
                                    Register Now
                                </button>
                            </div>
                        )}
                    </div>

                    {isRegistered && (
                        <div className="flex gap-16 mt-16 text-center relative z-10">
                            <div className="space-y-1">
                                <div className="text-3xl text-white font-display font-black tracking-tight uppercase">AUTHENTICATED</div>
                                <div className="text-[10px] text-success uppercase tracking-[0.4em] font-black flex items-center justify-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" /> NETWORK VERIFIED
                                </div>
                            </div>
                            <div className="w-[1px] h-16 bg-white/10" />
                            <div className="space-y-1">
                                <div className="text-3xl text-white font-display font-black tracking-tight uppercase">1,095 DAYS</div>
                                <div className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-black">REMAINING VALIDITY</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Benefits ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {[
                        { icon: <Globe />, title: "IMMUTABLE ID", desc: "Your identity is anchored to the global Kortana ledger with zero-knowledge encryption." },
                        { icon: <Activity />, title: "METROPOLIS ACCESS", desc: "Instant biological authorization for all smart infrastructure and rapid transit nodes." },
                        { icon: <ShieldCheck />, title: "SOVEREIGN RIGHTS", desc: "Priority acquisition of residential assets and dynamic tax-shielding on all trades." }
                    ].map((item, idx) => (
                        <motion.div key={idx} whileHover={{ y: -10 }} className="sexy-card flex flex-col gap-8 p-12 !bg-white/[0.01] group">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:bg-primary-bright group-hover:text-neutral-obsidian transition-all duration-700">
                                {item.icon}
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-3xl text-white font-display font-black tracking-tight uppercase">{item.title}</h4>
                                <p className="text-neutral-dim text-sm leading-relaxed font-medium">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ── Identity Vault ── */}
                <div className="sexy-card !p-0 overflow-hidden border-white/5 bg-white/[0.01]">
                    <div className="flex flex-col lg:flex-row">
                        <div className="lg:w-1/3 p-16 space-y-10 bg-white/[0.02] border-r border-white/5">
                            <div className="w-24 h-24 rounded-[2rem] bg-primary-bright/10 border border-primary-bright/20 flex items-center justify-center text-primary-bright">
                                <FileUp className="w-12 h-12" />
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-5xl text-white font-display font-black tracking-tighter uppercase leading-tight">IDENTITY <br />VAULT.</h3>
                                <p className="text-neutral-dim text-sm leading-relaxed font-medium">
                                    Sensitive biological and legal data is fragmented and stored across encrypted IPFS nodes, never centralized.
                                </p>
                                <button className="text-primary-bright font-black uppercase tracking-[0.6em] text-[10px] flex items-center gap-4 group">
                                    ACCESS FILES <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform" />
                                </button>
                            </div>
                        </div>
                        <div className="lg:w-2/3 p-16 space-y-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                {[
                                    { label: "Sovereign Passport", status: isRegistered ? "SYNCED" : "PENDING" },
                                    { label: "Residential Proof", status: isRegistered ? "SYNCED" : "PENDING" },
                                    { label: "Biometric Signature", status: isRegistered ? "SYNCED" : "PENDING" }
                                ].map((doc, idx) => (
                                    <div key={idx} className="p-10 rounded-[2.5rem] bg-neutral-obsidian border border-white/5 flex items-center justify-between group hover:border-primary-bright/20 transition-all duration-700">
                                        <div className="flex flex-col gap-2">
                                            <span className="text-white font-display font-black tracking-tight text-xl uppercase">{doc.label}</span>
                                            <span className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-black">STATUS: {doc.status}</span>
                                        </div>
                                        <div className={`w-12 h-12 rounded-full border flex items-center justify-center ${isRegistered ? 'bg-success/10 border-success/20 text-success' : 'bg-white/5 border-white/10 text-white/10'}`}>
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                    </div>
                                ))}
                                <button className="p-10 rounded-[2.5rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-4 text-white/10 hover:text-white hover:border-primary-bright/20 transition-all duration-700 min-h-[120px]">
                                    <UserPlus className="w-8 h-8" />
                                    <span className="text-[10px] uppercase tracking-[0.6em] font-black">APPEND RECORD</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Registration Modal ── */}
            <AnimatePresence>
                {showModal && (
                    <RegistrationModal
                        onClose={() => setShowModal(false)}
                        onComplete={handleRegistrationComplete}
                        walletAddress={walletAddress}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
