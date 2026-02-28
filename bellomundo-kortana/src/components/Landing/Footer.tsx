"use client";

import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function Footer() {
    return (
        <footer className="bg-neutral-obsidian border-t border-neutral-muted/30 pt-20 pb-10 px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                {/* Brand */}
                <div className="flex flex-col gap-6">
                    <Link href="/">
                        <Logo size="md" />
                    </Link>
                    <p className="text-body-s text-neutral-dim max-w-sm">
                        The financial operating system of the smart city — the settlement layer for an entire civilization.
                    </p>
                    <div className="text-xs text-neutral-dim mt-4">
                        Powered by <span className="text-primary-bright font-bold">Kortana Blockchain</span>
                    </div>
                </div>

                {/* Links */}
                <div className="flex flex-col gap-4">
                    <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-2">Products</h4>
                    <Link href="/properties" className="text-body-s text-neutral-dim hover:text-white transition-colors">Residential Rental</Link>
                    <Link href="/transport" className="text-body-s text-neutral-dim hover:text-white transition-colors">EV Leasing</Link>
                    <Link href="/utilities" className="text-body-s text-neutral-dim hover:text-white transition-colors">Ecological Utilities</Link>
                    <Link href="/eresidency" className="text-body-s text-neutral-dim hover:text-white transition-colors">e-Residency Card</Link>
                </div>

                <div className="flex flex-col gap-4">
                    <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-2">Company</h4>
                    <Link href="/about" className="text-body-s text-neutral-dim hover:text-white transition-colors">About the City</Link>
                    <Link href="/vision" className="text-body-s text-neutral-dim hover:text-white transition-colors">Our Vision</Link>
                    <Link href="/partners" className="text-body-s text-neutral-dim hover:text-white transition-colors">Partnerships</Link>
                    <Link href="/blog" className="text-body-s text-neutral-dim hover:text-white transition-colors">City News</Link>
                </div>

                <div className="flex flex-col gap-4">
                    <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-2">Legal</h4>
                    <Link href="/privacy" className="text-body-s text-neutral-dim hover:text-white transition-colors">Privacy Policy</Link>
                    <Link href="/terms" className="text-body-s text-neutral-dim hover:text-white transition-colors">Terms of Service</Link>
                    <Link href="/compliance" className="text-body-s text-neutral-dim hover:text-white transition-colors">Compliance</Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto pt-8 border-t border-neutral-muted/20 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-muted">
                <span>© 2045 BelloMundo Smart City Authority. All rights reserved.</span>
                <div className="flex gap-8">
                    <Link href="#" className="hover:text-primary-bright transition-colors">Twitter</Link>
                    <Link href="#" className="hover:text-primary-bright transition-colors">LinkedIn</Link>
                    <Link href="#" className="hover:text-primary-bright transition-colors">Telegram</Link>
                </div>
            </div>
        </footer>
    );
}
