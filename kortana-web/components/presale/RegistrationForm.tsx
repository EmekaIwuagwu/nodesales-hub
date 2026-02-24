"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Mail, User, Phone, Globe, ShieldCheck, Copy, CheckCircle, AlertTriangle } from 'lucide-react';

interface RegistrationFormProps {
    selectedTier: string;
    onSuccess: (data: any) => void;
}

export default function RegistrationForm({ selectedTier, onSuccess }: RegistrationFormProps) {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        country: '',
        walletAddress: '',
        tier: selectedTier,
        terms: false
    });

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');
    const [referralData, setReferralData] = useState<{ link: string; code: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.tier) {
            setError('Please select a contribution tier first.');
            return;
        }

        setStatus('loading');
        setError('');

        try {
            // Get referral code from URL if exists
            const urlParams = new URLSearchParams(window.location.search);
            const referralCode = urlParams.get('ref');

            const response = await fetch('/api/presale/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, referralCode }),
            });

            const data = await response.json();

            if (data.success) {
                setStatus('success');
                setReferralData({ link: data.referralLink, code: data.referralCode });
                onSuccess(data);
            } else {
                setStatus('error');
                setError(data.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setStatus('error');
            setError('A network error occurred. Please check your connection.');
        }
    };

    const copyRefLink = () => {
        if (referralData) {
            navigator.clipboard.writeText(referralData.link);
            // Optional: Add a toast notification here
        }
    };

    if (status === 'success' && referralData) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-8 bg-indigo-600/10 rounded-3xl border border-indigo-500/30"
            >
                <div className="flex justify-center mb-6 text-green-500">
                    <CheckCircle size={64} />
                </div>
                <h2 className="text-3xl font-black text-white mb-2 font-space">Welcome to the Revolution!</h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    Your registration for the <strong>{formData.tier.toUpperCase()}</strong> tier is complete.
                    Check your email <strong>({formData.email})</strong> for confirmation and next steps.
                </p>

                <div className="bg-deep-space p-6 rounded-2xl border border-white/10 mb-8 max-w-md mx-auto">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-4">Your Unique Referral Link</p>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-white/5 p-3 rounded-lg text-xs text-indigo-400 font-mono truncate border border-white/5">
                            {referralData.link}
                        </div>
                        <button
                            onClick={copyRefLink}
                            className="p-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                        >
                            <Copy size={16} />
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-4 leading-relaxed line-clamp-2 italic">
                        "Share this link and earn 10% bonus tokens for every successful referral who joins the presale!"
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="px-8 py-3 bg-indigo-600 rounded-xl font-bold text-sm">Join Telegram Community</button>
                    <button className="px-8 py-3 bg-white/10 rounded-xl font-bold text-sm">Follow on X (Twitter)</button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="bg-white/5 backdrop-blur-xl p-8 md:p-12 rounded-[40px] border border-white/10 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-600 rounded-2xl text-white">
                    <ShieldCheck size={28} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white font-space">Whitelist Registration</h2>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Tier: <span className="text-indigo-400 font-bold">{selectedTier.toUpperCase() || 'SELECT ONE'}</span></p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <User size={12} /> Full Name
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="John Investor"
                            className="w-full bg-white/5 border border-white/10 focus:border-indigo-500 outline-none p-4 rounded-xl text-white transition text-sm"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Mail size={12} /> Email Address
                        </label>
                        <input
                            required
                            type="email"
                            placeholder="investor@example.com"
                            className="w-full bg-white/5 border border-white/10 focus:border-indigo-500 outline-none p-4 rounded-xl text-white transition text-sm"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Phone size={12} /> Phone Number
                        </label>
                        <input
                            required
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            className="w-full bg-white/5 border border-white/10 focus:border-indigo-500 outline-none p-4 rounded-xl text-white transition text-sm"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Globe size={12} /> Country
                        </label>
                        <select
                            required
                            className="w-full bg-white/5 border border-white/10 focus:border-indigo-500 outline-none p-4 rounded-xl text-white transition text-sm appearance-none"
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        >
                            <option value="" disabled className="bg-deep-space">Select Country</option>
                            <option value="US" className="bg-deep-space">United States</option>
                            <option value="UK" className="bg-deep-space">United Kingdom</option>
                            <option value="DE" className="bg-deep-space">Germany</option>
                            <option value="FR" className="bg-deep-space">France</option>
                            {/* Add more countries here */}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Wallet size={12} /> ERC-20 Wallet Address
                    </label>
                    <input
                        required
                        type="text"
                        placeholder="0x..."
                        className="w-full bg-white/5 border border-white/10 focus:border-indigo-500 outline-none p-4 rounded-xl text-white font-mono transition text-sm"
                        value={formData.walletAddress}
                        onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                    />
                    <p className="text-[10px] text-gray-500 italic">Please use a wallet you control (MetaMask, TrustWallet). Do NOT use exchange addresses.</p>
                </div>

                <div className="pt-4 space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            required
                            type="checkbox"
                            className="w-5 h-5 rounded bg-white/10 border-white/20 checked:bg-indigo-600 transition"
                            checked={formData.terms}
                            onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                        />
                        <span className="text-xs text-gray-400 group-hover:text-gray-300 transition leading-relaxed">
                            I agree to the <a href="#" className="text-indigo-400 underline hov:no-underline">Terms of Service</a> and <a href="#" className="text-indigo-400 underline hov:no-underline">Privacy Policy</a>
                        </span>
                    </label>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-500 text-xs font-bold"
                        >
                            <AlertTriangle size={16} />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className={`w-full py-5 rounded-2xl font-black text-sm tracking-widest uppercase transition-all flex justify-center items-center shadow-2xl ${status === 'loading'
                            ? 'bg-indigo-600/50 cursor-wait'
                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                        }`}
                >
                    {status === 'loading' ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                        </div>
                    ) : 'Secure My Spot Now'}
                </button>
            </form>
        </div>
    );
}
