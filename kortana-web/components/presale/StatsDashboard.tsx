"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, DollarSign, Target, TrendingUp, Trophy } from 'lucide-react';

export default function StatsDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/presale/stats');
            const data = await res.json();
            setStats(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 60000); // 60s
        return () => clearInterval(interval);
    }, []);

    if (loading || !stats) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 bg-white/5 rounded-2xl border border-white/10" />
                ))}
            </div>
        );
    }

    const cards = [
        { label: 'Total Registrations', value: stats.totalRegistrations, icon: Users, color: 'text-indigo-400' },
        { label: 'Total Raised', value: stats.totalAmountRaised, icon: DollarSign, color: 'text-green-400' },
        { label: 'Avg Contribution', value: `$${(parseInt(stats.totalAmountRaised.replace(/\$|,/g, '')) / (stats.totalRegistrations || 1)).toFixed(0)}`, icon: Target, color: 'text-purple-400' },
        { label: 'Goal Progress', value: `${stats.percentageToGoal}%`, icon: TrendingUp, color: 'text-orange-400' }
    ];

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <motion.div
                            key={card.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:border-white/20 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl bg-white/5 ${card.color}`}>
                                    <Icon size={20} />
                                </div>
                                {card.label === 'Goal Progress' && (
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Goal: $2M</div>
                                )}
                            </div>
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">{card.label}</h4>
                            <div className="text-2xl font-black text-white font-space group-hover:scale-105 transition-transform origin-left">
                                {card.value}
                            </div>

                            {card.label === 'Goal Progress' && (
                                <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.percentageToGoal}%` }}
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                    />
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white/5 p-8 rounded-[32px] border border-white/10">
                    <div className="flex items-center gap-3 mb-8">
                        <Trophy className="text-yellow-500" size={24} />
                        <h3 className="text-xl font-bold text-white font-space">Referral Leaderboard</h3>
                    </div>
                    <div className="space-y-4">
                        {stats.topReferrers.map((referrer: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${idx === 0 ? 'bg-yellow-500 text-black' :
                                            idx === 1 ? 'bg-gray-300 text-black' :
                                                idx === 2 ? 'bg-orange-600 text-white' : 'bg-white/10 text-gray-400'
                                        }`}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition">{referrer.name}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Successful Referrals</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-white">{referrer.referralsCount}</p>
                                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">+{referrer.bonusTokens} KORT</p>
                                </div>
                            </div>
                        ))}
                        {stats.topReferrers.length === 0 && (
                            <p className="text-center text-gray-500 py-8 text-sm italic">The leaderboard is waiting for its first champion. Start referring now!</p>
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 p-8 rounded-[32px] border border-indigo-500/20 flex flex-col justify-center text-center">
                    <h3 className="text-2xl font-black text-white mb-4 font-space">Earn 10% Bonus</h3>
                    <p className="text-sm text-gray-300 leading-relaxed mb-8">
                        Build the Kortana ecosystem and get rewarded. For every friend who registers through your link, you both receive a token bonus.
                    </p>
                    <button className="w-full py-4 bg-indigo-600 rounded-xl font-bold text-sm shadow-xl shadow-indigo-600/20 hover:scale-[1.02] transition">Get My Referral Link</button>
                </div>
            </div>
        </div>
    );
}
