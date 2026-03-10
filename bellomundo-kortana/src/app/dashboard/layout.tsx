"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { clearActiveWallet } from "@/lib/walletProvider";
import {
    LayoutDashboard,
    Building2,
    Car,
    Zap,
    UserCheck,
    Settings,
    ChevronRight,
    LogOut,
    Search,
    Bell,
    Loader2,
    Menu,
    ChevronLeft,
    X,
    Info,
    AlertCircle,
    CheckCircle,
    Activity,
    Globe,
    ShieldCheck,
    ShoppingCart,
    BarChart3
} from "lucide-react";
import Logo from "@/components/ui/Logo";

const sidebarItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "Command Center", href: "/dashboard" },
    { icon: <BarChart3 className="w-5 h-5" />, label: "Intelligence", href: "/dashboard/analytics" },
    { icon: <Activity className="w-5 h-5" />, label: "Asset Ledger", href: "/dashboard/history" },
    { icon: <Building2 className="w-5 h-5" />, label: "Properties", href: "/dashboard/properties" },
    { icon: <ShoppingCart className="w-5 h-5" />, label: "Marketplace", href: "/dashboard/marketplace" },
    { icon: <Car className="w-5 h-5" />, label: "Transport", href: "/dashboard/transport" },
    { icon: <Zap className="w-5 h-5" />, label: "Utilities", href: "/dashboard/utilities" },
    { icon: <Globe className="w-5 h-5" />, label: "The Agora", href: "/dashboard/governance" },
    { icon: <UserCheck className="w-5 h-5" />, label: "e-Residency", href: "/dashboard/eresidency" },
    { icon: <Settings className="w-5 h-5" />, label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const { address } = useAccount();  // Kept for Wagmi tx signing context
    const { disconnect } = useDisconnect();
    // Use session address as the source of truth for display and balance
    // The session is set by whichever wallet was used to log in.
    const sessionAddress = ((session?.user as any)?.address ?? address) as `0x${string}` | undefined;

    const handleSignOut = async () => {
        disconnect();
        clearActiveWallet();
        await signOut({ callbackUrl: '/' });
    };

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearchResults, setShowSearchResults] = useState(false);

    const { data: balanceData } = useBalance({
        address: sessionAddress
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            redirect("/");
        }
    }, [status]);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-neutral-obsidian flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary-bright animate-spin" />
            </div>
        );
    }

    const displayBalance = balanceData ? parseFloat(formatUnits(balanceData.value, 18)).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "---";
    const shortenedAddress = sessionAddress ? `${sessionAddress.slice(0, 4)}...${sessionAddress.slice(-4)}` : "----";


    return (
        <div className="flex min-h-screen bg-neutral-obsidian overflow-hidden">
            {/* Sidebar - Collapsible Luxury Glass */}
            <motion.aside
                initial={false}
                animate={{ width: isCollapsed ? 100 : 320 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="hidden lg:flex flex-col h-screen border-r border-white/5 luxury-glass overflow-hidden z-[50] relative"
            >
                <div className={`p-10 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!isCollapsed && (
                        <Link href="/">
                            <Logo size="md" />
                        </Link>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"
                    >
                        {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>

                <nav className="flex-1 px-4 flex flex-col gap-2">
                    {sidebarItems.map((item, idx) => (
                        <Link
                            key={idx}
                            href={item.href}
                            className={`group flex items-center rounded-3xl transition-all duration-500 hover:bg-white/[0.03] border border-transparent hover:border-white/5 ${isCollapsed ? 'justify-center p-4' : 'justify-between px-6 py-4'}`}
                        >
                            <div className="flex items-center gap-5">
                                <div className="text-white/30 group-hover:text-primary-bright transition-colors duration-500">
                                    {item.icon}
                                </div>
                                {!isCollapsed && (
                                    <span className="text-[10px] font-display font-black tracking-[0.4em] uppercase text-white/50 group-hover:text-white transition-colors duration-500">{item.label}</span>
                                )}
                            </div>
                            {!isCollapsed && <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/40 group-hover:translate-x-1 transition-all" />}
                        </Link>
                    ))}
                </nav>

                <div className="p-8">
                    <button
                        onClick={handleSignOut}
                        className={`flex items-center gap-5 rounded-3xl text-white/20 hover:text-error hover:bg-error/5 border border-transparent hover:border-error/10 transition-all group ${isCollapsed ? 'justify-center p-4' : 'px-6 py-4 w-full'}`}
                    >
                        <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        {!isCollapsed && <span className="text-[11px] font-display font-black tracking-[0.4em] uppercase">Sign Out</span>}
                    </button>

                    {!isCollapsed && (
                        <div className="mt-10 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Network Health</span>
                            </div>
                            <div className="text-xs font-mono text-white/20">
                                METROPOLIS-ALPHA <br />
                                STABLE @ 100%
                            </div>
                        </div>
                    )}
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen relative overflow-hidden">
                {/* Header - Transparent Floating */}
                <header className="h-24 px-12 flex items-center justify-between z-40 relative">
                    <div className="absolute inset-0 bg-neutral-obsidian/40 backdrop-blur-xl border-b border-white/5" />

                    <div className="relative z-10 flex">
                        {/* Global Search / The Registry */}
                        <div className="flex-1 max-w-2xl relative">
                            <div className="relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4 group-focus-within:text-primary-bright transition-colors" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setShowSearchResults(e.target.value.length > 0);
                                    }}
                                    onFocus={() => searchQuery.length > 0 && setShowSearchResults(true)}
                                    onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                                    placeholder="ACCESS METROPOLIS REGISTRY..."
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-full py-4 pl-14 pr-8 text-[11px] font-black tracking-widest text-white placeholder:text-white/10 focus:outline-none focus:border-primary-bright/30 transition-all uppercase"
                                />
                            </div>

                            {/* Search Results Dropdown */}
                            <AnimatePresence>
                                {showSearchResults && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                        className="absolute top-full left-0 w-full mt-4 luxury-glass border border-white/10 rounded-[2.5rem] p-6 shadow-2xl z-[100] max-h-[500px] overflow-y-auto"
                                    >
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between px-4">
                                                <span className="text-[9px] text-white/20 font-black uppercase tracking-[0.4em]">Registry Matches</span>
                                                <span className="text-[9px] text-primary-bright font-black uppercase tracking-widest">Live Sync</span>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                {[
                                                    { icon: <Building2 className="text-primary-bright" />, label: "Sector 7 Residential Node", type: "Location" },
                                                    { icon: <Activity className="text-secondary-warm" />, label: "DNR Yield Protocol A-4", type: "Intelligence" },
                                                    { icon: <ShieldCheck className="text-success" />, title: "Citizenship Audit Record", type: "Security" },
                                                    { icon: <LayoutDashboard className="text-white/40" />, label: "Command Center Analytics", type: "Module" }
                                                ].map((res, i) => (
                                                    <button key={i} className="flex items-center gap-6 p-6 rounded-3xl hover:bg-white/[0.05] border border-transparent hover:border-white/5 transition-all text-left group">
                                                        <div className="w-10 h-10 rounded-xl bg-neutral-obsidian flex items-center justify-center p-2.5 group-hover:bg-primary-bright group-hover:text-neutral-obsidian transition-all">
                                                            {res.icon}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-[11px] font-black text-white uppercase tracking-widest">{res.label || res.title}</div>
                                                            <div className="text-[9px] text-white/20 font-black uppercase tracking-widest mt-0.5">{res.type}</div>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white transition-all" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="relative z-10 flex items-center gap-8">
                        <div className="hidden xl:flex flex-col items-end gap-1 opacity-40">
                            <span className="text-[9px] font-black text-white uppercase tracking-[0.3em]">System Time</span>
                            <span className="text-xs font-mono text-white">07:31:04 UTC</span>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsNotifOpen(true)}
                            className="relative p-4 bg-white/[0.03] rounded-full border border-white/5 text-white/60 hover:text-white hover:border-primary-bright transition-all"
                        >
                            <Bell className="w-4 h-4" />
                            <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-secondary-warm rounded-full" />
                        </motion.button>

                        <div className="flex items-center gap-4 bg-white/[0.03] p-1.5 pl-6 rounded-full border border-white/5 hover:border-white/20 transition-all cursor-pointer group">
                            <div className="flex flex-col items-end">
                                <span className="text-[12px] font-black text-white group-hover:text-primary-bright transition-colors uppercase tracking-tight">{parseFloat(displayBalance).toLocaleString()} DNR</span>
                                <span className="text-[8px] text-white/30 leading-none font-mono uppercase tracking-widest">{shortenedAddress}</span>
                            </div>
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 p-0.5">
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-bright to-secondary-warm opacity-80" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Viewport */}
                <main className="flex-1 overflow-y-auto relative noise-overlay">
                    <div className="max-w-[1440px] mx-auto p-12">
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            {children}
                        </motion.div>
                    </div>

                    {/* Notification Panel - Slide Out */}
                    <AnimatePresence>
                        {isNotifOpen && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    onClick={() => setIsNotifOpen(false)}
                                    className="fixed inset-0 bg-neutral-obsidian/40 backdrop-blur-sm z-[100]"
                                />
                                <motion.div
                                    initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                    className="fixed top-0 right-0 h-screen w-[400px] luxury-glass border-l border-white/10 z-[101] p-10 flex flex-col gap-10"
                                >
                                    <div className="flex items-center justify-between border-b border-white/5 pb-8">
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">Alert Registry</h3>
                                            <span className="text-[9px] text-white/20 font-black uppercase tracking-widest">Metropolis System Sync</span>
                                        </div>
                                        <button onClick={() => setIsNotifOpen(false)} className="p-3 rounded-xl bg-white/5 text-white/20 hover:text-white transition-all">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                                        {[
                                            { icon: <CheckCircle className="text-success" />, title: "Contract Finalized", time: "2m ago", desc: "Residential Acquisition of Aetheria Penthouse successful." },
                                            { icon: <Info className="text-primary-bright" />, title: "Grid Update", time: "1h ago", desc: "Sector 5 energy buffer is now operating at peak efficiency." },
                                            { icon: <AlertCircle className="text-secondary-warm" />, title: "Balance Alert", time: "4h ago", desc: "Your DNR holdings have dropped below 1,000. Consider minting." },
                                        ].map((notif, idx) => (
                                            <div key={idx} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3 hover:border-white/10 transition-all cursor-pointer">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-neutral-obsidian border border-white/5 flex items-center justify-center p-1.5">{notif.icon}</div>
                                                        <span className="text-[10px] font-black uppercase text-white tracking-widest">{notif.title}</span>
                                                    </div>
                                                    <span className="text-[9px] font-mono text-white/20">{notif.time}</span>
                                                </div>
                                                <p className="text-[11px] text-white/40 leading-relaxed font-medium">{notif.desc}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <button className="btn-sexy w-full !bg-white/[0.03] !border-white/10 uppercase tracking-[0.3em] py-6">
                                        Clear Archive
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Atmospheric Parallax Elements */}
                    <div className="fixed top-24 right-10 w-[40rem] h-[40rem] bg-primary-bright/5 blur-[150px] rounded-full pointer-events-none -z-10" />
                    <div className="fixed bottom-10 left-80 w-[30rem] h-[30rem] bg-secondary-warm/5 blur-[120px] rounded-full pointer-events-none -z-10" />
                </main>
            </div>
        </div>
    );
}
