"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';

export default function NewsletterSignup() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data.success) {
                setStatus('success');
                setEmail('');
            } else {
                setStatus('error');
            }
        } catch (err) {
            setStatus('error');
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 p-12 rounded-[48px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full -mr-32 -mt-32" />

            <div className="max-w-2xl mx-auto text-center relative z-10 space-y-8">
                <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto text-indigo-400">
                    <Mail size={32} />
                </div>

                <div className="space-y-4">
                    <h3 className="text-3xl font-black text-white font-space">Stay Synchronized</h3>
                    <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                        Get early access to mainnet benchmarks, governance updates, and the latest developer grants delivered straight to your inbox.
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {status === 'success' ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-center gap-3 text-green-500 font-bold bg-green-500/10 p-4 rounded-2xl border border-green-500/20"
                        >
                            <CheckCircle size={20} />
                            Welcome to the inner circle. Check your inbox soon!
                        </motion.div>
                    ) : (
                        <motion.form
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onSubmit={handleSubscribe}
                            className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
                        >
                            <div className="relative flex-1 group">
                                <input
                                    required
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    disabled={status === 'loading'}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 group-hover:border-white/20 focus:border-indigo-500 p-5 rounded-2xl outline-none text-white transition-all text-sm"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="px-8 py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 rounded-2xl font-black text-xs uppercase tracking-widest text-white transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 min-w-[160px]"
                            >
                                {status === 'loading' ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Join Newsletter <ArrowRight size={16} /></>
                                )}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-[0.2em]">
                    No Spam. Just high-frequency updates. Unsubscribe anytime.
                </p>
            </div>
        </div>
    );
}
