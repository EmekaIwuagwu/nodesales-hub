"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Landing/Navbar";
import Footer from "@/components/Landing/Footer";
import { Shield, Eye, Lock, Database } from "lucide-react";

export default function PrivacyPage() {
    return (
        <main className="relative min-h-screen bg-neutral-obsidian overflow-hidden">
            <Navbar />

            <section className="relative pt-60 pb-40 px-20">
                <div className="max-w-4xl mx-auto space-y-24">
                    <div className="space-y-8">
                        <div className="text-[10px] font-black uppercase tracking-[0.8em] text-primary-bright flex items-center gap-4">
                            <Shield className="w-4 h-4" />
                            Data Sovereignty / Privacy Protocol v1.0
                        </div>
                        <h1 className="text-7xl font-display font-black text-white leading-none tracking-tight uppercase">
                            PRIVACY <br />
                            <span className="sexy-gradient-text uppercase">DNA.</span>
                        </h1>
                    </div>

                    <div className="space-y-16 text-neutral-dim text-lg leading-loose font-medium">
                        <div className="space-y-6">
                            <h2 className="text-2xl text-white font-display font-black uppercase tracking-widest">1. ZERO-KNOWLEDGE FOUNDATION</h2>
                            <p>
                                BelloMundo operates on the principle of minimal data retention. Whenever possible, biological and personal data is processed via Zero-Knowledge Proofs (ZKPs). The city knows you are a citizen without knowing who you are in terms of legacy identities.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-2xl text-white font-display font-black uppercase tracking-widest">2. ENCRYPTED IPFS FRAGMENTATION</h2>
                            <p>
                                Identity documents and legal records are fragmented, encrypted, and distributed across the Kortana IPFS mesh. No single node contains a complete record, ensuring resistance to systemic breaches.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-2xl text-white font-display font-black uppercase tracking-widest">3. CITIZEN CONSENT CONTRACTS</h2>
                            <p>
                                You own your data. Access by city services (transport, utilities, health) is granted via time-locked smart contracts that expire automatically when the service is rendered.
                            </p>
                        </div>
                    </div>

                    <div className="p-12 rounded-[3rem] bg-white/[0.02] border border-white/5 flex items-center gap-10">
                        <div className="w-16 h-16 rounded-2xl bg-primary-bright/10 border border-primary-bright/20 flex items-center justify-center text-primary-bright">
                            <Lock className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="text-white font-display font-black uppercase tracking-widest">End-to-End Encrypted</div>
                            <div className="text-[10px] text-neutral-dim font-bold uppercase tracking-widest mt-1">Metropolis Protocol Secured</div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
