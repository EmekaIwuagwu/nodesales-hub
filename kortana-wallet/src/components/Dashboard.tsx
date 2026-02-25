'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    History, Send, Settings, LogOut,
    ExternalLink, Copy, Zap, ArrowLeft,
    LayoutGrid, Layers, ArrowDownLeft
} from 'lucide-react';
import { useWalletStore } from '@/store/useWalletStore';
import { ComplianceModal } from './ComplianceModal';
import { providerService } from '@/lib/ProviderService';

// Import Views
import { HomeView } from './views/HomeView';
import { TransactView } from './views/TransactView';
import { SettingsView } from './views/SettingsView';
import { TransactionsView } from './views/TransactionsView';
import { ReceiveView } from './views/ReceiveView';
import {
    ComplianceView, ESGView, RiskAIView,
    SubNetView, StableView, BridgeView
} from './views/FeatureViews';

export const Dashboard: React.FC = () => {
    const { address, balance, network, setBalance, setLocked } = useWalletStore();
    const [isComplianceOpen, setIsComplianceOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('home');

    // Auto-refresh balance on load and when network changes
    useEffect(() => {
        if (address) {
            refreshBalance();
            const interval = setInterval(refreshBalance, 10000); // Every 10s
            return () => clearInterval(interval);
        }
    }, [address, network]);

    const refreshBalance = async () => {
        if (!address) return;
        const newBalance = await providerService.getBalance(address, network);
        setBalance(newBalance);
    };

    const handleLogout = () => {
        setLocked(true);
    };

    const handleFeatureClick = (id: string) => {
        setActiveTab(id);
    };

    const copyAddress = () => {
        if (!address) return;
        navigator.clipboard.writeText(address);
        alert('Address copied to clipboard');
    };

    return (
        <div className="flex h-screen bg-deep-space text-white overflow-hidden relative font-sans">
            <div className="grainy-overlay" />

            {/* Background Nebulas */}
            <div className="nebula-purple absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full opacity-30 select-none pointer-events-none" />
            <div className="nebula-cyan absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full opacity-20 select-none pointer-events-none" />

            {/* Sidebar */}
            <aside className="flex w-14 md:w-20 lg:w-72 glass-panel border-r-0 rounded-none bg-deep-space/60 backdrop-blur-3xl px-1.5 md:px-3 lg:px-6 py-6 flex-col z-20 transition-all duration-300">
                <div className="mb-8 lg:mb-12 flex items-center justify-center lg:justify-start gap-4 lg:px-2">
                    <img src="/images/logo.png" alt="K" className="w-8 h-8 lg:w-12 lg:h-12 object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]" />
                    <div className="hidden lg:block">
                        <h2 className="font-black text-2xl tracking-tighter leading-none uppercase">Kortana</h2>
                        <p className="text-[10px] font-bold tracking-[0.3em] text-cyan-400 uppercase mt-1">Poseidon</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1.5 md:space-y-2">
                    {[
                        { id: 'home', icon: LayoutGrid, label: 'Home' },
                        { id: 'transact', icon: Send, label: 'Send' },
                        { id: 'receive', icon: ArrowDownLeft, label: 'Receive' },
                        { id: 'bridge', icon: Layers, label: 'Bridge' },
                        { id: 'history', icon: History, label: 'Transactions' },
                        { id: 'settings', icon: Settings, label: 'Settings' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center justify-center lg:justify-start gap-4 p-2.5 md:p-4 rounded-lg md:rounded-2xl transition-all duration-300 group
                                ${activeTab === item.id ? 'bg-white/10 text-white border border-white/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                            title={item.label}
                        >
                            <item.icon strokeWidth={activeTab === item.id ? 2.5 : 2} className={`size-4.5 md:size-5 ${activeTab === item.id ? 'text-cyan-400' : ''}`} />
                            <span className="hidden lg:block font-bold tracking-tight text-sm uppercase tracking-widest">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="mt-auto space-y-2">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center lg:justify-start gap-4 p-2.5 md:p-4 rounded-lg md:rounded-2xl text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/10 transition-all font-bold"
                        title="Lock Enclave"
                    >
                        <LogOut className="size-4.5 md:size-5" />
                        <span className="hidden lg:block text-xs uppercase tracking-[0.2em]">Lock Enclave</span>
                    </button>
                </div>
            </aside>

            {/* Main Container */}
            <main className="flex-1 overflow-y-auto p-4 md:p-12 relative z-10 space-y-6 md:space-y-12 max-w-[1600px] mx-auto w-full">
                {/* Top Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                    <div className="space-y-1 text-white">
                        <div className="flex items-center gap-2 md:gap-3">
                            {['compliance', 'esg', 'stable', 'risk', 'subnet', 'transact', 'receive', 'bridge', 'history', 'settings'].includes(activeTab) && activeTab !== 'home' && (
                                <button onClick={() => setActiveTab('home')} className="p-1.5 md:p-2 hover:bg-white/5 rounded-full transition-colors">
                                    <ArrowLeft className="size-4 md:size-5 text-gray-500" />
                                </button>
                            )}
                            <h1 className="text-sm md:text-3xl lg:text-4xl font-black tracking-tight text-white uppercase drop-shadow-sm font-heading">
                                {network === 'mainnet' ? 'ZEUS' : 'POSEIDON'} <span className="text-gradient-kortana">ENCLAVE</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-0.5 md:py-1.5 bg-white/5 rounded-full w-fit group cursor-pointer hover:bg-white/10 transition-all border border-white/5 ml-0.5 md:ml-11" onClick={copyAddress}>
                            <span className="font-mono text-[8px] md:text-[10px] text-gray-500 tracking-wider">
                                {address?.slice(0, 8)}...{address?.slice(-6)}
                            </span>
                            <Copy className="size-2 md:size-3 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-2 md:gap-4 mt-1 md:mt-0">
                        <div className={`px-3 md:px-5 py-1 md:py-2.5 glass-panel rounded-full flex items-center gap-1.5 md:gap-3 border-opacity-30 border ${network === 'mainnet' ? 'border-cyan-400 bg-cyan-400/5' : 'border-purple-400 bg-purple-400/5'}`}>
                            <div className={`w-1 h-1 md:w-2 md:h-2 rounded-full animate-pulse ${network === 'mainnet' ? 'bg-cyan-400' : 'bg-purple-400'}`} />
                            <span className={`text-[7px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] ${network === 'mainnet' ? 'text-cyan-400' : 'text-purple-400'}`}>
                                {network.toUpperCase()} SYNC
                            </span>
                        </div>
                        <button onClick={refreshBalance} className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl glass-panel flex items-center justify-center hover:scale-110 transition-transform cursor-pointer text-cyan-400 shrink-0">
                            <Zap className="size-3.5 md:size-5" />
                        </button>
                    </div>
                </div>

                {/* Tab Content Rendering */}
                <AnimatePresence mode="wait">
                    {activeTab === 'home' && <HomeView key="home" balance={balance} network={network} onFeatureClick={handleFeatureClick} />}
                    {activeTab === 'transact' && <TransactView key="transact" />}
                    {activeTab === 'receive' && <ReceiveView key="receive" />}
                    {activeTab === 'bridge' && <BridgeView key="bridge" />}
                    {activeTab === 'history' && <TransactionsView key="history" />}
                    {activeTab === 'settings' && <SettingsView key="settings" />}

                    {/* Feature Specific Views */}
                    {activeTab === 'compliance' && <ComplianceView key="compliance" />}
                    {activeTab === 'esg' && <ESGView key="esg" />}
                    {activeTab === 'stable' && <StableView key="stable" />}
                    {activeTab === 'risk' && <RiskAIView key="risk" />}
                    {activeTab === 'subnet' && <SubNetView key="subnet" />}
                </AnimatePresence>
            </main>

            <ComplianceModal isOpen={isComplianceOpen} onClose={() => setIsComplianceOpen(false)} />
        </div>
    );
};
