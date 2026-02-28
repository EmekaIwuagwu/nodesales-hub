"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Landing/Navbar";
import Footer from "@/components/Landing/Footer";
import { FileText, Shield, Scale, Gavel } from "lucide-react";

export default function TermsPage() {
    return (
        <main className="relative min-h-screen bg-neutral-obsidian overflow-hidden">
            <Navbar />

            <section className="relative pt-60 pb-40 px-20">
                <div className="max-w-4xl mx-auto space-y-24">
                    <div className="space-y-8">
                        <div className="text-[10px] font-black uppercase tracking-[0.8em] text-secondary-warm flex items-center gap-4">
                            <Scale className="w-4 h-4" />
                            Algorithmic Law / Citizen Charter v1.2
                        </div>
                        <h1 className="text-7xl font-display font-black text-white leading-none tracking-tight uppercase">
                            SYSTEM <br />
                            <span className="sexy-gradient-text uppercase">TERMS.</span>
                        </h1>
                    </div>

                    <div className="space-y-16 text-neutral-dim text-lg leading-loose font-medium">
                        <div className="space-y-6">
                            <h2 className="text-2xl text-white font-display font-black uppercase tracking-widest">1. THE KORTANA CONSENSUS</h2>
                            <p>
                                By accessing BelloMundo protocols, you agree to be bound by the cryptographic consensus of the Kortana Network. Disagreements are resolved via decentralized arbitration nodes as defined in the Urban Core contract.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-2xl text-white font-display font-black uppercase tracking-widest">2. DINAR SETTLEMENT</h2>
                            <p>
                                All urban services, including but not limited to transit, power, and residency, are settled exclusively in DNR tokens. Failure to maintain a sufficient balance may result in automated service throttling.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-2xl text-white font-display font-black uppercase tracking-widest">3. CITIZEN CONDUCT</h2>
                            <p>
                                Sovereign residents must adhere to the algorithmic laws of the metropolis. Activities that threaten network stability or physical infrastructure are detected via cognitive monitoring and penalized through smart contract escrow forfeitures.
                            </p>
                        </div>
                    </div>

                    <div className="p-12 rounded-[3rem] bg-white/[0.02] border border-white/5 flex items-center gap-10">
                        <div className="w-16 h-16 rounded-2xl bg-secondary-warm/10 border border-secondary-warm/20 flex items-center justify-center text-secondary-warm">
                            <Gavel className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="text-white font-display font-black uppercase tracking-widest">Algorithmic Enforcement</div>
                            <div className="text-[10px] text-neutral-dim font-bold uppercase tracking-widest mt-1">Non-Discretionary Arbitration</div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
