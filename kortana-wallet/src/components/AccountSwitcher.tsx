import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, Download, Trash2, CheckCircle2, User } from 'lucide-react';
import { useWalletStore, Account } from '@/store/useWalletStore';
import { createWalletFromMnemonic, createWalletFromPrivateKey } from '@/lib/wallet';
import { vaultService } from '@/lib/VaultService';

export const AccountSwitcher: React.FC = () => {
    const {
        address,
        accounts,
        mnemonic,
        addAccount,
        removeAccount,
        setAddress,
        setPrivateKey,
        showNotification
    } = useWalletStore();

    const [isOpen, setIsOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importKey, setImportKey] = useState('');

    // Ensure the active address is an account as soon as possible.
    useEffect(() => {
        if (address && accounts.length === 0) {
            addAccount({ name: 'Account 1', address, derivationIndex: 0 });
        }
    }, [address, accounts, addAccount]);

    const handleSwitchAccount = (acc: Account) => {
        if (!mnemonic) {
            showNotification('Wallet is locked', 'error');
            return;
        }
        try {
            if (acc.encryptedPrivateKey) {
                // Imported account
                const pk = vaultService.decrypt(acc.encryptedPrivateKey, mnemonic);
                if (!pk) throw new Error('Decryption Failed');
                const wallet = createWalletFromPrivateKey(pk);
                setPrivateKey(wallet.privateKey);
                setAddress(wallet.address);
            } else if (acc.derivationIndex !== undefined) {
                // HD Account
                const wallet = createWalletFromMnemonic(mnemonic, acc.derivationIndex);
                setPrivateKey(wallet.privateKey);
                setAddress(wallet.address);
            }
            setIsOpen(false);
            showNotification(`Switched to ${acc.name}`, 'success');
        } catch (error) {
            console.error(error);
            showNotification('Failed to switch account', 'error');
        }
    };

    const handleCreateAccount = () => {
        if (!mnemonic) return;
        const hdAccounts = accounts.filter(a => a.derivationIndex !== undefined);
        const nextIndex = hdAccounts.length > 0 ? Math.max(...hdAccounts.map(a => a.derivationIndex!)) + 1 : 1;
        
        try {
            const wallet = createWalletFromMnemonic(mnemonic, nextIndex);
            const newAccount: Account = {
                name: `Account ${nextIndex + 1}`,
                address: wallet.address,
                derivationIndex: nextIndex
            };
            addAccount(newAccount);
            handleSwitchAccount(newAccount);
        } catch (error) {
            showNotification('Failed to create account', 'error');
        }
    };

    const handleImportAccount = () => {
        if (!mnemonic || !importKey) return;
        try {
            // Check if valid private key
            const formattedKey = importKey.startsWith('0x') ? importKey : `0x${importKey}`;
            const wallet = createWalletFromPrivateKey(formattedKey);
            
            // duplicate check
            if (accounts.some(a => a.address.toLowerCase() === wallet.address.toLowerCase())) {
                showNotification('Account already exists', 'error');
                return;
            }

            const encryptedKp = vaultService.encrypt(wallet.privateKey, mnemonic);
            const numImported = accounts.filter(a => a.encryptedPrivateKey).length;
            const newAccount: Account = {
                name: `Imported Account ${numImported + 1}`,
                address: wallet.address,
                encryptedPrivateKey: encryptedKp
            };
            addAccount(newAccount);
            setImportKey('');
            setIsImporting(false);
            handleSwitchAccount(newAccount);
        } catch (error) {
            console.error(error);
            showNotification('Invalid private key', 'error');
        }
    };

    const handleRemoveAccount = (acc: Account, e: React.MouseEvent) => {
        e.stopPropagation();
        if (accounts.length <= 1) {
            showNotification('Cannot remove the last account', 'error');
            return;
        }
        removeAccount(acc.address);
        if (address === acc.address) {
            handleSwitchAccount(accounts.find(a => a.address !== acc.address)!);
        } else {
            showNotification('Account removed', 'info');
        }
    };

    const activeAccount = accounts.find(a => a.address === address) || { name: 'Account', address };

    return (
        <div className="relative z-[100]">
            <div
                className="flex items-center gap-2 px-2.5 md:px-5 py-1.5 md:py-2.5 bg-white/5 rounded-2xl md:rounded-3xl w-fit cursor-pointer hover:bg-white/10 transition-all border border-white/5 shadow-inner group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.5)] border border-white/10" />
                <span className="font-mono text-[10px] md:text-xs lg:text-sm text-gray-200 group-hover:text-cyan-400 transition-colors tracking-widest font-bold">
                    {activeAccount.name}
                </span>
                <span className="font-mono text-[10px] md:text-xs lg:text-sm text-gray-500 group-hover:text-cyan-400 transition-colors tracking-widest font-bold hidden xs:block">
                    {address?.slice(0, 4)}...{address?.slice(-4)}
                </span>
                <ChevronDown className={`size-3 md:size-4 text-gray-600 group-hover:text-cyan-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="absolute top-full left-0 mt-3 w-64 md:w-80 bg-deep-space/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl z-[101] overflow-hidden"
                        >
                            <div className="p-3 md:p-4 border-b border-white/5">
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Your Accounts</h3>
                            </div>
                            
                            <div className="max-h-48 md:max-h-60 overflow-y-auto w-full custom-scrollbar">
                                {accounts.map((acc, idx) => (
                                    <div
                                        key={acc.address}
                                        onClick={() => handleSwitchAccount(acc)}
                                        className={`flex items-center justify-between p-3 md:p-4 hover:bg-white/5 cursor-pointer transition-colors border-l-2 ${address === acc.address ? 'border-cyan-400 bg-cyan-400/5' : 'border-transparent'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400/20 to-purple-500/20 border border-white/10 flex items-center justify-center relative overflow-hidden">
                                                <User className="size-4 text-cyan-400/80" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-white flex items-center gap-2">
                                                    {acc.name}
                                                    {acc.encryptedPrivateKey && <span className="text-[8px] bg-purple-500/20 text-purple-300 px-1 py-0.5 rounded-sm uppercase tracking-wider">Imported</span>}
                                                </div>
                                                <div className="text-[10px] font-mono text-gray-500">{acc.address.slice(0, 8)}...{acc.address.slice(-6)}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {address === acc.address && <CheckCircle2 className="size-4 text-cyan-400" />}
                                            {accounts.length > 1 && (
                                                <button 
                                                    onClick={(e) => handleRemoveAccount(acc, e)}
                                                    className="p-1.5 text-gray-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-3 border-t border-white/5 space-y-2">
                                {!isImporting ? (
                                    <>
                                        <button
                                            onClick={handleCreateAccount}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all font-bold text-xs"
                                        >
                                            <div className="w-6 h-6 rounded-full bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20">
                                                <Plus className="size-3 text-cyan-400" />
                                            </div>
                                            Add New Account
                                        </button>
                                        <button
                                            onClick={() => setIsImporting(true)}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all font-bold text-xs"
                                        >
                                            <div className="w-6 h-6 rounded-full bg-purple-400/10 flex items-center justify-center border border-purple-400/20">
                                                <Download className="size-3 text-purple-400" />
                                            </div>
                                            Import Account
                                        </button>
                                    </>
                                ) : (
                                    <div className="p-2 space-y-3">
                                        <input
                                            type="text"
                                            value={importKey}
                                            onChange={(e) => setImportKey(e.target.value)}
                                            placeholder="Paste private key string"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={() => setIsImporting(false)} className="flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-white border border-transparent hover:border-white/10 transition-all">Cancel</button>
                                            <button onClick={handleImportAccount} className="flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 hover:bg-cyan-400/20 transition-all">Import</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
