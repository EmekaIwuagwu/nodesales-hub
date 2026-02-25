'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, AlertTriangle, Copy } from 'lucide-react';
import { useWalletStore } from '@/store/useWalletStore';
import { vaultService } from '@/lib/VaultService';

export const SettingsView: React.FC = () => {
    const { mnemonic, privateKey, network, setNetwork, setPasswordHash, reset, passwordHash, setEncryptedMnemonic } = useWalletStore();
    const [showKey, setShowKey] = useState(false);
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');

    const handlePasswordChange = () => {
        if (newPass.length < 8) return alert("Password too short");
        if (newPass !== confirmPass) return alert("Passwords do not match");

        const newHash = vaultService.hashPassword(newPass);
        setPasswordHash(newHash);

        // If we have the mnemonic in memory, re-encrypt it with the new password
        if (mnemonic) {
            const newEncrypted = vaultService.encrypt(mnemonic, newPass);
            setEncryptedMnemonic(newEncrypted);
        }

        setNewPass('');
        setConfirmPass('');
        alert("Password updated successfully.");
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6 md:space-y-12">
            <h2 className="text-xl md:text-4xl font-black tracking-tighter uppercase font-heading text-white">Wallet <span className="text-gradient-kortana">Settings</span></h2>

            <div className="space-y-6 md:space-y-8">
                {/* Network Switcher */}
                <section className="space-y-3 md:space-y-4">
                    <h3 className="text-[9px] md:text-xs font-black uppercase tracking-[0.3em] text-gray-500 ml-2">Network Configuration</h3>
                    <div className="glass-panel p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <p className="font-black text-white uppercase tracking-tight text-sm md:text-base text-white">Active Enclave</p>
                            <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest">{network === 'mainnet' ? 'Kortana Mainnet' : 'Kortana Testnet'}</p>
                        </div>
                        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 w-fit shrink-0">
                            <button
                                onClick={() => setNetwork('mainnet')}
                                className={`px-3 md:px-6 py-1.5 md:py-2 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${network === 'mainnet' ? 'bg-cyan-500 text-deep-space shadow-lg shadow-cyan-500/20' : 'text-gray-500 hover:text-white'}`}
                            >Mainnet</button>
                            <button
                                onClick={() => setNetwork('testnet')}
                                className={`px-3 md:px-6 py-1.5 md:py-2 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${network === 'testnet' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-gray-500 hover:text-white'}`}
                            >Testnet</button>
                        </div>
                    </div>
                </section>

                {/* Private Key Export */}
                <section className="space-y-3 md:space-y-4 text-white">
                    <h3 className="text-[9px] md:text-xs font-black uppercase tracking-[0.3em] text-gray-500 ml-2">Security & Export</h3>
                    <div className="glass-panel p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] space-y-6 border-rose-500/10 hover:border-rose-500/30 transition-all">
                        <div className="flex items-center gap-3 md:gap-4 flex-wrap sm:flex-nowrap">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                                <Key className="size-5 md:size-6" />
                            </div>
                            <div className="flex-1 min-w-[150px]">
                                <h4 className="font-black text-white uppercase text-sm md:text-base text-white">Export Private Key</h4>
                                <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-tight">EVM-compatible access</p>
                            </div>
                            <button
                                onClick={() => setShowKey(!showKey)}
                                className="w-full sm:w-auto btn-outline whitespace-nowrap"
                            >{showKey ? 'Hide Key' : 'Reveal Key'}</button>
                        </div>

                        <AnimatePresence>
                            {showKey && privateKey && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="p-4 md:p-6 bg-rose-500/5 border border-rose-500/20 rounded-xl md:rounded-2xl space-y-4 overflow-hidden"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-rose-500">
                                            <AlertTriangle className="size-3 md:size-3.5" />
                                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Never share your private key</span>
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <p className="font-mono text-[10px] md:text-xs break-all text-white bg-black/40 p-3 md:p-4 rounded-lg md:rounded-xl border border-white/5 select-all">{privateKey}</p>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(privateKey)}
                                            className="absolute right-2 top-2 p-1.5 md:p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        ><Copy className="size-3 md:size-3.5" /></button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>

                {/* Change Password */}
                <section className="space-y-3 md:space-y-4 text-white">
                    <h3 className="text-[9px] md:text-xs font-black uppercase tracking-[0.3em] text-gray-500 ml-2">Access Control</h3>
                    <div className="glass-panel p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] space-y-4 md:space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2 text-white">
                                <label className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">New password</label>
                                <input
                                    type="password"
                                    value={newPass}
                                    onChange={(e) => setNewPass(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 text-white focus:border-cyan-500/50 outline-none text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-2 text-white">
                                <label className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Confirm password</label>
                                <input
                                    type="password"
                                    value={confirmPass}
                                    onChange={(e) => setConfirmPass(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 text-white focus:border-cyan-500/50 outline-none text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <button onClick={handlePasswordChange} className="w-full btn-outline">Update Access Password</button>
                    </div>
                </section>

                <div className="pt-6 md:pt-8 border-t border-white/5">
                    <button onClick={reset} className="w-full p-4 md:p-6 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl md:rounded-2xl transition-all font-black uppercase tracking-widest text-[9px] md:text-[10px]">Destroy Enclave & Clear All Data</button>
                </div>
            </div>
        </motion.div>
    );
};
