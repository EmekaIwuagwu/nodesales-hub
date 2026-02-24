"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Shield,
    Menu,
    X,
    ChevronRight,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(true);

    const handleLogout = () => {
        document.cookie = "presale_admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        window.location.href = '/presale/admin/login';
    };

    const menuItems = [
        { id: 'dashboard', label: 'Investors', icon: Users, href: '/presale/admin' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '#', badge: 'Soon' },
        { id: 'settings', label: 'Settings', icon: Settings, href: '#', badge: 'Soon' },
    ];

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-indigo-600 rounded-full shadow-2xl text-white outline-none active:scale-95 transition-transform"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isOpen ? 280 : 0, opacity: isOpen ? 1 : 0 }}
                className={`fixed left-0 top-0 h-screen bg-[#05071a] border-r border-white/5 z-40 overflow-hidden flex flex-col`}
            >
                {/* Brand */}
                <div className="p-8 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                            <Shield size={24} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black tracking-widest text-white leading-none">KORTANA</span>
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mt-1">Admin Panel</span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-4 mb-4">Core Management</p>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${isActive
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <Icon size={20} className={isActive ? 'text-white' : 'group-hover:text-indigo-400 transition-colors'} />
                                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                                </div>
                                {item.badge && (
                                    <span className="px-2 py-0.5 bg-white/5 text-[9px] font-black rounded uppercase text-gray-500">{item.badge}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Profile/Logout */}
                <div className="p-6 border-t border-white/5 space-y-4">
                    <div className="p-4 bg-white/5 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-400">
                            A
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-black text-white uppercase tracking-wider truncate">Kortana Admin</p>
                            <p className="text-[9px] text-indigo-400 font-bold uppercase truncate">Principal Auditor</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 p-4 text-red-500/70 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all font-bold text-sm group"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </motion.aside>

            {/* Backdrop for mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
                    />
                )}
            </AnimatePresence>
        </>
    );
}
