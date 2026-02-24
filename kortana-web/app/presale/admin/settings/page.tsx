"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Settings,
    Shield,
    Lock,
    Database,
    Bell,
    Code2,
    Globe,
    Cpu,
    Save,
    RefreshCw,
    Wallet,
    Terminal
} from 'lucide-react';
import AdminSidebar from '@/components/admin/Sidebar';

export default function SettingsPage() {
    const [saving, setSaving] = useState(false);

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => setSaving(false), 2000);
    };

    return (
        <div className="bg-[#020410] min-h-screen text-white flex">
            <AdminSidebar />

            <main className="flex-1 lg:ml-[280px] p-8 md:p-12">
                <div className="max-w-4xl mx-auto space-y-12">
                    {/* Header */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                    <Settings size={20} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">System Configuration</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black font-space tracking-tight">Vault Controls</h1>
                            <p className="text-gray-500 font-medium">Fine-tune the Kortana presale engine, security protocols, and treasury parameters.</p>
                        </div>

                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-8 py-4 bg-indigo-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20 active:scale-95 overflow-hidden relative"
                        >
                            {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                            <span>{saving ? 'Syncing...' : 'Save Changes'}</span>
                        </button>
                    </header>

                    {/* Settings Sections */}
                    <div className="space-y-8 pb-20">
                        {/* Treasury & Wallets */}
                        <SettingsSection icon={Wallet} title="Treasury Management" description="Configured multi-sig addresses and withdrawal limits.">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="Native Disbursement Wallet" value="0x7a5E...Ba789" />
                                <InputGroup label="Escrow Settlement" value="Connected to v2" />
                            </div>
                        </SettingsSection>

                        {/* Network Security */}
                        <SettingsSection icon={Shield} title="Protocol Integrity" description="Global anti-fraud and validation parameters.">
                            <div className="space-y-4">
                                <ToggleGroup label="Strict Wallet Address Checksums" checked={true} />
                                <ToggleGroup label="Automated Receipt Verification" checked={true} />
                                <ToggleGroup label="MIP-1 Compliance Mode" checked={false} />
                            </div>
                        </SettingsSection>

                        {/* Blockchain Connectivity */}
                        <SettingsSection icon={Terminal} title="Node Infrastructure" description="RPC endpoints and block explorer synchronisation.">
                            <div className="space-y-6">
                                <div className="p-6 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center group hover:border-indigo-500/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-xs text-emerald-500">9002</div>
                                        <div>
                                            <p className="text-sm font-black text-white">Kortana Mainnet (ZEUS-RPC)</p>
                                            <p className="text-[10px] text-gray-500">https://zeus-rpc.mainnet.kortana.xyz</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-3 py-1.5 rounded-lg">
                                        Active
                                    </div>
                                </div>
                            </div>
                        </SettingsSection>

                        {/* Database Controls */}
                        <SettingsSection icon={Database} title="Ledger Persistence" description="Database clusters and backup orchestration.">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-4">
                                    <div className="flex justify-between items-start">
                                        <Cpu size={24} className="text-indigo-400" />
                                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest px-2 py-1 bg-indigo-500/10 rounded">Primary</span>
                                    </div>
                                    <div>
                                        <p className="font-black text-white">MongoDB Atlas Cluster-0</p>
                                        <p className="text-[10px] text-gray-500 mt-1">Region: us-east-1 (AWS)</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-center items-center text-center space-y-2 border-dashed opacity-50">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Secondary Replication</p>
                                    <p className="text-[9px] text-gray-700">Add backup cluster for high availability</p>
                                </div>
                            </div>
                        </SettingsSection>
                    </div>
                </div>
            </main>
        </div>
    );
}

function SettingsSection({ icon: Icon, title, description, children }: any) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400">
                    <Icon size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-black font-space tracking-tight text-white">{title}</h2>
                    <p className="text-xs text-gray-500 font-medium">{description}</p>
                </div>
            </div>
            <div className="p-8 bg-white/5 border border-white/5 rounded-[40px]">
                {children}
            </div>
        </motion.section>
    );
}

function InputGroup({ label, value }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">{label}</label>
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-mono text-sm group focus-within:border-indigo-500/50 transition-all">
                {value}
            </div>
        </div>
    );
}

function ToggleGroup({ label, checked }: any) {
    return (
        <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl group hover:bg-white/10 transition-colors">
            <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{label}</span>
            <div className={`w-12 h-6 rounded-full relative transition-all cursor-pointer ${checked ? 'bg-indigo-600' : 'bg-white/10'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${checked ? 'left-7' : 'left-1'}`} />
            </div>
        </div>
    );
}
