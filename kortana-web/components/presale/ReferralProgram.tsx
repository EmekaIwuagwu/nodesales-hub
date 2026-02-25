"use client";

import { motion } from 'framer-motion';
import { Share2, Users, Gift, Copy, Twitter, Send } from 'lucide-react';

interface ReferralProgramProps {
    referralCode?: string;
    referralLink?: string;
}

export default function ReferralProgram({ referralCode, referralLink }: ReferralProgramProps) {
    const steps = [
        {
            title: "Share Your Link",
            desc: "Get your unique referral link after registering for the presale.",
            icon: Share2,
            color: "bg-blue-500"
        },
        {
            title: "Invite Friends",
            desc: "Your friends join the Kortana community through your link.",
            icon: Users,
            color: "bg-purple-500"
        },
        {
            title: "Earn Rewards",
            desc: "Get 10% bonus tokens for every successful contribution.",
            icon: Gift,
            color: "bg-green-500"
        }
    ];

    const copyToClipboard = () => {
        if (referralLink) {
            navigator.clipboard.writeText(referralLink);
            alert('Link copied to clipboard!');
        }
    };

    return (
        <div className="space-y-16">
            <div className="text-center max-w-2xl mx-auto space-y-4">
                <h3 className="text-3xl font-black text-white font-space">Ambassador Referral Program</h3>
                <p className="text-gray-400 text-sm">Grow the Kortana network and earn significant rewards. Our community-first model distributes value back to you.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {steps.map((step, idx) => {
                    const Icon = step.icon;
                    return (
                        <motion.div
                            key={step.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative p-8 rounded-[32px] bg-white/5 border border-white/10 text-center group hover:bg-white/10 transition"
                        >
                            <div className={`w-16 h-16 rounded-2xl ${step.color}/20 text-white flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                                <Icon size={28} className={step.color.replace('bg-', 'text-')} />
                            </div>
                            <h4 className="text-xl font-bold text-white mb-3">{step.title}</h4>
                            <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>

                            {idx < 2 && (
                                <div className="absolute top-1/2 -right-4 w-8 h-px bg-white/10 hidden md:block" />
                            )}
                        </motion.div>
                    );
                })}
            </div>

            <div className="bg-indigo-600/10 rounded-[40px] border border-indigo-500/20 p-8 md:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h4 className="text-2xl font-black text-white font-space">Double-Sided Benefits</h4>
                        <div className="space-y-4">
                            <div className="flex gap-4 items-start">
                                <div className="p-2 bg-indigo-600 rounded-lg text-white mt-1">
                                    <Gift size={16} />
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm">You Get: 10% Bonus</p>
                                    <p className="text-xs text-gray-400">Receive 10% of your friend's contribution in extra DNR tokens.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="p-2 bg-indigo-600 rounded-lg text-white mt-1">
                                    <Users size={16} />
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm">They Get: 5% Early Bird</p>
                                    <p className="text-xs text-gray-400">Your friends receive an additional 5% bonus for using your link.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-deep-space p-8 rounded-[32px] border border-white/10 space-y-6">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] text-center">Your Active Referral Link</p>

                        {referralLink ? (
                            <div className="space-y-6">
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-white/5 border border-white/5 p-4 rounded-xl text-xs font-mono text-indigo-400 truncate">
                                        {referralLink}
                                    </div>
                                    <button
                                        onClick={copyToClipboard}
                                        className="p-4 bg-indigo-600 rounded-xl hover:bg-indigo-700 transition"
                                    >
                                        <Copy size={20} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <button className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition">
                                        <Twitter size={16} className="text-[#1DA1F2]" /> X / Twitter
                                    </button>
                                    <button className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition">
                                        <Send size={16} className="text-[#0088cc]" /> Telegram
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-sm text-gray-400 italic mb-6">Register to generate your unique <br /> ambassador link.</p>
                                <button className="px-8 py-3 bg-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-600/25">Register Now</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
