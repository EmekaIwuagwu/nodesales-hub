'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Download, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useWalletStore } from '@/store/useWalletStore';

export const ReceiveView: React.FC = () => {
    const { address } = useWalletStore();
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        if (!address) return;
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto space-y-8 md:space-y-12 text-center"
        >
            <div className="space-y-2 md:space-y-4">
                <h2 className="text-2xl md:text-5xl font-black tracking-tighter uppercase text-white font-heading">Receive <span className="text-gradient-kortana">Assets</span></h2>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px] md:text-xs">Scan or copy address to deposit funds</p>
            </div>

            <div className="glass-panel p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] flex flex-col items-center gap-8 md:gap-12 relative overflow-hidden">
                {/* Decorative background flair */}
                <div className="absolute top-[-10%] left-[-10%] w-32 h-32 bg-cyan-400/10 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] right-[-10%] w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />

                <div className="p-4 md:p-6 bg-white rounded-[2rem] md:rounded-[3rem] shadow-[0_0_50px_rgba(255,255,255,0.1)] hover:scale-105 transition-transform duration-500">
                    {address ? (
                        <QRCodeSVG
                            value={address}
                            size={180}
                            level="H"
                            includeMargin={false}
                            imageSettings={{
                                src: "/images/logo.png",
                                x: undefined,
                                y: undefined,
                                height: 40,
                                width: 40,
                                excavate: true,
                            }}
                        />
                    ) : (
                        <div className="w-[180px] h-[180px] bg-gray-100 animate-pulse rounded-2xl" />
                    )}
                </div>

                <div className="w-full space-y-4 md:space-y-6 relative z-10">
                    <div className="space-y-2">
                        <p className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest">Kortana Net Address</p>
                        <div className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 break-all font-mono text-xs md:text-sm text-white select-all group relative">
                            {address}
                            <div className="absolute inset-0 bg-cyan-400/0 group-hover:bg-cyan-400/5 transition-colors pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex gap-3 md:gap-4">
                        <button
                            onClick={handleCopy}
                            className="flex-1 btn-launch !rounded-xl md:!rounded-2xl flex items-center justify-center gap-2"
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                            <span className="text-[10px] md:text-xs">{copied ? 'Copied!' : 'Copy Address'}</span>
                        </button>
                        <button className="p-3 md:p-5 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl text-white hover:bg-white/10 transition-colors">
                            <Share2 size={18} />
                        </button>
                        <button className="p-3 md:p-5 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl text-white hover:bg-white/10 transition-colors">
                            <Download size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 md:p-8 bg-rose-500/5 border border-rose-500/10 rounded-2xl md:rounded-[2rem] text-center">
                <p className="text-[9px] md:text-[10px] font-bold text-rose-400 uppercase tracking-[0.2em] leading-relaxed">
                    Only send DNR and EVM-compatible assets to this address on the Kortana network.
                    Sending other assets may result in permanent loss.
                </p>
            </div>
        </motion.div>
    );
};
