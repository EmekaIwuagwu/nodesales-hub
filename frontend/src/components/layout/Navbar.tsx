import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 border-b border-white/10 bg-black/20 backdrop-blur-xl z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent-dnr flex items-center justify-center font-bold text-black" style={{ background: 'var(--accent-dnr)' }}>
              K
            </div>
            <span className="font-space font-bold text-xl tracking-tight">KortanaDEX</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/swap" className="text-text-primary hover:text-accent-dnr transition-colors">Swap</Link>
            <Link href="/pool" className="text-text-secondary hover:text-text-primary transition-colors">Pool</Link>
            <Link href="/analytics" className="text-text-secondary hover:text-text-primary transition-colors">Analytics</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ConnectButton showBalance={false} chainStatus="icon" />
        </div>
      </div>
    </nav>
  );
}
