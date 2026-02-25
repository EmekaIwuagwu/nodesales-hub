'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, ExternalLink, ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';
import { useWalletStore } from '@/store/useWalletStore';
import { providerService } from '@/lib/ProviderService';
import { ethers } from 'ethers';

export const TransactionsView: React.FC = () => {
    const { address, network } = useWalletStore();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (address) {
            fetchHistory();
        }
    }, [address, network]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const history = await providerService.getAddressHistory(address!, network);
            setTransactions(history);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatAmount = (value: string, from: string) => {
        const isOutflow = from.toLowerCase() === address?.toLowerCase();
        const formatted = ethers.formatEther(value);
        return {
            amount: `${isOutflow ? '-' : '+'}${formatted} DNR`,
            color: isOutflow ? 'text-rose-400' : 'text-neon-green',
            icon: isOutflow ? ArrowUpRight : ArrowDownLeft
        };
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8 text-white">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-xl md:text-3xl font-black tracking-tighter text-white font-heading uppercase">Live <span className="text-white/20">Ledger</span></h3>
                <div className="flex gap-2">
                    <button onClick={fetchHistory} className="px-3 md:px-5 py-2 md:py-2.5 bg-white/5 rounded-full text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest border border-white/10 hover:text-cyan-400 transition-colors">
                        Refresh
                    </button>
                    <button className="px-3 md:px-5 py-2 md:py-2.5 bg-white/5 rounded-full text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest border border-white/10">
                        <Filter className="inline mr-1 md:mr-2 size-2.5 md:size-3" /> Filter
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-cyan-400" size={32} />
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Querying Blockchain...</p>
                </div>
            ) : (
                <div className="glass-panel overflow-x-auto border-white/5 bg-transparent p-px rounded-2xl md:rounded-[2rem]">
                    <table className="w-full text-left min-w-[600px] md:min-w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="px-6 md:px-10 py-5 md:py-8 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-500">Transaction</th>
                                <th className="px-6 md:px-10 py-5 md:py-8 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-500">Method</th>
                                <th className="px-6 md:px-10 py-5 md:py-8 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Amount</th>
                                <th className="px-6 md:px-10 py-5 md:py-8 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {transactions.map((tx, i) => {
                                const { amount, color, icon: Icon } = formatAmount(tx.value || '0', tx.from);
                                return (
                                    <tr key={tx.hash || i} className="group hover:bg-white/[0.03] transition-colors cursor-pointer">
                                        <td className="px-6 md:px-10 py-5 md:py-8">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-mono text-[10px] md:text-xs text-cyan-400/80 group-hover:text-cyan-400 transition-colors truncate max-w-[120px] md:max-w-none">
                                                    {tx.hash || 'Internal Tx'}
                                                </span>
                                                <span className="text-[8px] font-bold text-gray-600 uppercase tracking-tighter">
                                                    {tx.from.slice(0, 6)}...{tx.from.slice(-4)} → {tx.to?.slice(0, 6)}...{tx.to?.slice(-4)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 md:px-10 py-5 md:py-8">
                                            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white/70 flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${color.replace('text', 'bg')}`} />
                                                {tx.method || (tx.from.toLowerCase() === address?.toLowerCase() ? 'Send' : 'Receive')}
                                            </span>
                                        </td>
                                        <td className={`px-6 md:px-10 py-5 md:py-8 text-right font-mono font-black text-xs md:text-base ${color}`}>
                                            <div className="flex items-center justify-end gap-2">
                                                <Icon size={14} />
                                                {amount}
                                            </div>
                                        </td>
                                        <td className="px-6 md:px-10 py-5 md:py-8 text-right text-[8px] md:text-[10px] font-bold text-gray-500 uppercase whitespace-nowrap">
                                            {tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleString() : 'Recent'}
                                        </td>
                                    </tr>
                                );
                            })}
                            {!loading && transactions.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <ExternalLink size={40} />
                                            <p className="uppercase font-black text-[10px] tracking-widest">No activity found on {network}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    );
};
