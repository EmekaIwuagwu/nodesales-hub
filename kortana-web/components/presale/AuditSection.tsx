"use client";

import { motion } from 'framer-motion';
import { ShieldCheck, Clock, Calendar, ChevronRight, FileText } from 'lucide-react';

const audits = [
    {
        title: "Internal Security Audit",
        provider: "Kortana Team",
        date: "Jan 15, 2026",
        status: "completed",
        desc: "Comprehensive review of the consensus engine and state machine logic.",
        color: "bg-green-500",
        icon: ShieldCheck
    },
    {
        title: "Smart Contract Audit",
        provider: "Trail of Bits",
        date: "In Progress",
        status: "active",
        desc: "Full audit of the EVM compatibility layer and core bridge architecture.",
        color: "bg-yellow-500",
        icon: Clock
    },
    {
        title: "Certik Protocol Audit",
        provider: "Certik",
        date: "Mar 15, 2026",
        status: "scheduled",
        desc: "Formal verification of the DPoH security model and validator incentives.",
        color: "bg-blue-500",
        icon: Calendar
    }
];

export default function AuditSection() {
    return (
        <div className="space-y-12">
            <div className="text-center max-w-2xl mx-auto">
                <h3 className="text-3xl font-black text-white mb-4 font-space">Security & Trust</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                    We believe in radical transparency. Every aspect of the Kortana protocol undergoes multiple independent security assessments.
                </p>
            </div>

            <div className="relative">
                {/* Connection Line */}
                <div className="absolute top-1/2 left-0 w-full h-px bg-white/10 -translate-y-1/2 hidden md:block" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {audits.map((audit, index) => {
                        const Icon = audit.icon;
                        return (
                            <motion.div
                                key={audit.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white/5 backdrop-blur-md p-8 rounded-[32px] border border-white/10 hover:border-white/20 transition group"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-4 rounded-2xl ${audit.color}/10 ${audit.color.replace('bg-', 'text-')}`}>
                                        <Icon size={24} />
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${audit.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                            audit.status === 'active' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'
                                        }`}>
                                        {audit.status}
                                    </div>
                                </div>

                                <h4 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-400 transition">{audit.title}</h4>
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-4">{audit.provider} • {audit.date}</p>
                                <p className="text-xs text-gray-400 leading-relaxed mb-6">{audit.desc}</p>

                                {audit.status === 'completed' ? (
                                    <button className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition">
                                        <FileText size={14} /> View Audit Report <ChevronRight size={14} />
                                    </button>
                                ) : (
                                    <div className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Pending Publication</div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-xl italic">K</div>
                    <div>
                        <p className="text-sm font-bold text-white">Commitment to Security</p>
                        <p className="text-xs text-gray-500">All audit reports are public and verifiable on GitHub.</p>
                    </div>
                </div>
                <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition">
                    Browse GitHub Repo
                </button>
            </div>
        </div>
    );
}
