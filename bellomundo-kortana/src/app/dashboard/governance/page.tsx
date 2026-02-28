"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Globe, Users, Gavel, Scale, History,
    CheckCircle2, XCircle, Timer, Award,
    ChevronRight, ArrowUpRight, Loader2,
    ShieldCheck, Activity, Brain
} from "lucide-react";
import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";

export default function GovernancePage() {
    const { address } = useAccount();
    const { data: balance } = useBalance({ address });
    const [proposals, setProposals] = useState<any[]>([]);
    const [votedProposals, setVotedProposals] = useState<string[]>([]);
    const [isVoting, setIsVoting] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const votingPower = balance ? parseFloat(formatUnits(balance.value, 18)).toLocaleString() : "1,240";

    const fetchProposals = async () => {
        try {
            const res = await fetch("/api/governance");
            const data = await res.json();
            if (data.proposals) {
                setProposals(data.proposals);

                // Identify which ones we've already voted on
                if (address) {
                    const voted = data.proposals.filter((p: any) =>
                        p.voters?.some((v: any) => v.address.toLowerCase() === address.toLowerCase())
                    ).map((p: any) => p.proposalId);
                    setVotedProposals(voted);
                }
            }
        } catch (err) {
            console.error("Metropolis Governance Sync Failure:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useState(() => {
        fetchProposals();
    });

    const handleVote = async (id: string, choice: 'YES' | 'NO') => {
        setIsVoting(id);

        try {
            // 1. Submit to Governance API
            const govRes = await fetch("/api/governance", {
                method: "POST",
                body: JSON.stringify({ proposalId: id, choice }),
            });

            if (!govRes.ok) throw new Error("On-chain record rejected");

            // 2. Persist to Activity Ledger
            await fetch("/api/transactions", {
                method: "POST",
                body: JSON.stringify({
                    txHash: `vote-${Date.now()}`,
                    paymentType: "governance",
                    recipient: "TOWN_HALL",
                    amountDNR: 0,
                    description: `Cast Vote: ${choice} on ${id}`,
                    serviceType: "GOVERNANCE",
                    serviceId: id
                }),
            });

            // 3. Refresh UI
            await fetchProposals();
            setVotedProposals(prev => [...prev, id]);
        } catch (err) {
            console.error("Vote Protocol Failure:", err);
        } finally {
            setIsVoting(null);
        }
    };

    return (
        <div className="flex flex-col gap-16 max-w-[1400px] mx-auto pb-40">
            {/* Governance Header */}
            <div className="flex flex-col xl:flex-row items-end justify-between gap-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.6em] text-primary-bright">
                        <Scale className="w-4 h-4" />
                        Metropolis Legislative Protocol
                    </div>
                    <h1 className="text-7xl md:text-9xl text-white font-display font-black leading-[0.8] tracking-tight uppercase">
                        THE <br />
                        <span className="sexy-gradient-text">AGORA.</span>
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="sexy-card !bg-primary-bright/5 border-primary-bright/20 p-10 flex items-center gap-10 min-w-[400px]"
                >
                    <div className="w-20 h-20 rounded-[2rem] bg-primary-bright flex items-center justify-center text-neutral-obsidian shadow-[0_0_30px_rgba(56,189,248,0.4)]">
                        <Award className="w-10 h-10" />
                    </div>
                    <div>
                        <span className="text-[10px] text-primary-bright/60 uppercase tracking-[0.4em] font-black mb-1 block">Your Influence</span>
                        <div className="text-4xl text-white font-display font-black tracking-tighter">◈ {votingPower}</div>
                        <span className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-black">ACTIVE VOTING POWER</span>
                    </div>
                </motion.div>
            </div>

            {/* Strategic Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                    { label: "Active Proposals", value: "14", icon: <Gavel className="text-primary-bright" /> },
                    { label: "Total Quorum", value: "84.2%", icon: <Users className="text-secondary-warm" /> },
                    { label: "Execution Finality", value: "99.9%", icon: <Activity className="text-success" /> },
                    { label: "Core Sync Status", value: "STABLE", icon: <Brain className="text-primary-bright" /> }
                ].map((stat, idx) => (
                    <div key={idx} className="sexy-card !p-8 !bg-white/[0.01] border-white/5 flex items-center gap-6">
                        <div className="w-12 h-12 rounded-xl bg-neutral-obsidian border border-white/5 flex items-center justify-center">{stat.icon}</div>
                        <div>
                            <div className="text-xl text-white font-display font-black tracking-tight uppercase">{stat.value}</div>
                            <div className="text-[9px] text-white/20 uppercase tracking-widest font-black leading-none">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Proposal Registry */}
            <div className="space-y-12">
                <div className="flex items-center justify-between px-4">
                    <h2 className="text-[11px] text-white font-black uppercase tracking-[0.8em]">Operational Directives</h2>
                    <div className="flex gap-4">
                        <button className="px-6 py-2 rounded-full bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">All Archive</button>
                        <button className="px-6 py-2 rounded-full bg-primary-bright text-neutral-obsidian text-[9px] font-black uppercase tracking-widest">+ Create Proposal</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-10">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-40 sexy-card !bg-white/[0.01]">
                            <Loader2 className="w-12 h-12 text-primary-bright animate-spin mb-6" />
                            <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.5em]">Syncing Legislative Directives...</span>
                        </div>
                    ) : proposals.map((prop, idx) => {
                        const hasVoted = votedProposals.includes(prop.proposalId);
                        const isPropVoting = isVoting === prop.proposalId;
                        const totalVotes = prop.votesYes + prop.votesNo;
                        const yesPercent = totalVotes > 0 ? (prop.votesYes / totalVotes) * 100 : 0;

                        return (
                            <motion.div
                                key={prop.proposalId}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="sexy-card !p-0 overflow-hidden border-white/5 group hover:border-white/10 transition-all duration-700"
                            >
                                <div className="grid grid-cols-12">
                                    <div className="col-span-12 lg:col-span-8 p-12 space-y-8">
                                        <div className="flex items-center gap-6">
                                            <span className="text-[9px] font-black uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full text-white/40 border border-white/5 group-hover:border-primary-bright/20 transition-all">{prop.proposalId}</span>
                                            <div className="h-4 w-[1px] bg-white/10" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-primary-bright">{prop.category}</span>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-4xl text-white font-display font-black tracking-tighter uppercase group-hover:text-primary-bright transition-colors duration-500">{prop.title}</h3>
                                            <p className="text-neutral-dim text-sm leading-relaxed max-w-2xl font-medium tracking-wide">
                                                {prop.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-10 pt-4">
                                            <div className="flex -space-x-3">
                                                {[1, 2, 3, 4].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-neutral-obsidian bg-neutral-dim" />)}
                                                <div className="w-8 h-8 rounded-full border-2 border-neutral-obsidian bg-white/10 flex items-center justify-center text-[9px] font-black text-white">+82</div>
                                            </div>
                                            <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">PROPOSED BY: <span className="text-white/60">{prop.proposer}</span></span>
                                        </div>
                                    </div>

                                    <div className="col-span-12 lg:col-span-4 bg-white/[0.01] border-l border-white/5 p-12 flex flex-col justify-between gap-12">
                                        <div className="space-y-8">
                                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                                <span className="text-white/40">Collective Consensus</span>
                                                <span className="text-white">{yesPercent.toFixed(1)}% <span className="text-success">YES</span></span>
                                            </div>
                                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${yesPercent}%` }}
                                                    className="h-full bg-primary-bright shadow-[0_0_15px_rgba(56,189,248,0.4)]"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Timer className="w-4 h-4 text-secondary-warm" />
                                                    <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">{prop.timeLeft}</span>
                                                </div>
                                                <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">{totalVotes.toLocaleString()} AUDITED VOTES</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            {hasVoted ? (
                                                <div className="w-full py-5 rounded-2xl bg-success/10 border border-success/30 flex items-center justify-center gap-3 text-success text-[10px] font-black uppercase tracking-widest">
                                                    <CheckCircle2 className="w-4 h-4" /> VOTE REGISTERED
                                                </div>
                                            ) : prop.timeLeft === "Executed" ? (
                                                <div className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 text-white/20 text-[10px] font-black uppercase tracking-widest">
                                                    <ShieldCheck className="w-4 h-4" /> PROPOSAL ARCHIVED
                                                </div>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleVote(prop.proposalId, 'YES')}
                                                        disabled={isPropVoting !== null}
                                                        className="flex-1 py-5 rounded-2xl bg-white text-neutral-obsidian hover:bg-neutral-200 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
                                                    >
                                                        {isPropVoting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-success" />}
                                                        {isPropVoting ? 'SYNCING...' : 'YES'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleVote(prop.proposalId, 'NO')}
                                                        disabled={isPropVoting !== null}
                                                        className="flex-1 py-5 rounded-2xl bg-white/[0.03] border border-white/5 text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
                                                    >
                                                        {isPropVoting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 text-error" />}
                                                        {isPropVoting ? 'SYNCING...' : 'NO'}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Governance Guide Sidebar Suggestion */}
            <div className="sexy-card p-12 !bg-white/[0.01] border-white/5 flex flex-col md:flex-row items-center gap-12">
                <div className="w-24 h-24 rounded-[2rem] bg-neutral-obsidian border border-white/10 flex items-center justify-center text-primary-bright shrink-0">
                    <Globe className="w-12 h-12" />
                </div>
                <div className="flex-1 space-y-4 text-center md:text-left">
                    <h3 className="text-3xl text-white font-display font-black tracking-tight uppercase leading-tight">Civic Responsibility Node</h3>
                    <p className="text-neutral-dim text-sm leading-relaxed font-medium tracking-wide">
                        Your voting power is recalculating every block based on your DNR liquidity and residential asset density. Proposals reaching 66% consensus enter the execution queue after a 48-hour challenge period.
                    </p>
                </div>
                <button className="btn-sexy gap-4 !bg-white/[0.03] !border-white/10 whitespace-nowrap">
                    CONSTITUTION.MD <ArrowUpRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
