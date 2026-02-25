"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Globe,
    Search,
    Download,
    Trash2,
    Shield,
    ExternalLink,
    RefreshCw,
    X,
    CheckCircle2,
    CreditCard,
    MapPin,
    Mail,
    Smartphone,
    Database,
    ArrowUpRight,
    TrendingUp,
    Wallet
} from 'lucide-react';
import AdminSidebar from '@/components/admin/Sidebar';

export default function AdminDashboard() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dbStatus, setDbStatus] = useState<'connected' | 'syncing' | 'error'>('syncing');
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
        fetchUsers();
    }, []);

    const checkAuth = async () => {
        const cookies = document.cookie.split('; ');
        const authCookie = cookies.find(row => row.startsWith('presale_admin_auth='));

        if (!authCookie) {
            router.push('/presale/admin/login');
            return false;
        }
        return true;
    };

    const fetchUsers = async () => {
        setDbStatus('syncing');
        try {
            const res = await fetch('/api/presale/admin/registrations');

            if (res.status === 401) {
                router.push('/presale/admin/login');
                return;
            }

            const data = await res.json();
            if (data.success) {
                setUsers(data.users);
                setDbStatus('connected');
            } else {
                setDbStatus('error');
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setDbStatus('error');
            setLoading(false);
        }
    };

    const approveUser = async (userId: string) => {
        try {
            const res = await fetch('/api/presale/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, status: 'confirmed' }),
            });
            if (res.ok) {
                fetchUsers();
                if (selectedUser?._id === userId) {
                    setSelectedUser({ ...selectedUser, paymentStatus: 'confirmed' });
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deleteUser = async (userId: string) => {
        if (!confirm('Permanently redact this investor record?')) return;
        try {
            const res = await fetch('/api/presale/admin/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            if (res.ok) {
                fetchUsers();
                setSelectedUser(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filteredUsers = users.filter(user =>
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.transactionHash?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const downloadCSV = () => {
        const headers = ['FullName', 'Email', 'Phone', 'Country', 'Wallet', 'Tier', 'TxHash', 'DNR_Amount', 'USD_Value', 'Date'];
        const rows = users.map(u => [
            u.fullName,
            u.email,
            u.phone,
            u.country,
            u.walletAddress,
            u.tier,
            u.transactionHash || 'N/A',
            u.tokenAmount || 0,
            u.usdCost || 0,
            new Date(u.createdAt).toLocaleDateString()
        ]);

        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `kortana_investors_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-[#020410] min-h-screen text-white flex">
            <AdminSidebar />

            <main className="flex-1 lg:ml-[280px] p-8 md:p-12">
                <div className="max-w-7xl mx-auto space-y-12">
                    {/* Header Section */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${dbStatus === 'connected' ? 'bg-emerald-500/10 text-emerald-500' :
                                    dbStatus === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500 animate-pulse'
                                    }`}>
                                    <Database size={10} />
                                    {dbStatus === 'connected' ? 'Live Database Connected' : dbStatus === 'error' ? 'Connection Offline' : 'Syncing...'}
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black font-space tracking-tight">Kortana Terminal</h1>
                            <p className="text-gray-500 font-medium max-w-lg">Manage institutional credit market liquidity and whitelist registrations.</p>
                        </div>

                        <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl">
                            <button
                                onClick={downloadCSV}
                                className="flex items-center gap-2 px-6 py-3 hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                <Download size={14} /> Export CSV
                            </button>
                            <button
                                onClick={fetchUsers}
                                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20"
                            >
                                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Sync Data
                            </button>
                        </div>
                    </header>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <QuickStat
                            icon={Users}
                            label="Total Whitelist"
                            value={users.length}
                            color="indigo"
                            subValue={`+${users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 86400000)).length} new today`}
                        />
                        <QuickStat
                            icon={TrendingUp}
                            label="Conversion Rate"
                            value={`${((users.filter(u => u.transactionHash).length / (users.length || 1)) * 100).toFixed(1)}%`}
                            color="cyan"
                            subValue={`${users.filter(u => u.transactionHash).length} paid investors`}
                        />
                        <QuickStat
                            icon={ArrowUpRight}
                            label="DNR Allocated"
                            value={`${(users.reduce((acc, curr) => acc + (curr.tokenAmount || 0), 0) / 1000000).toFixed(1)}M`}
                            color="purple"
                            subValue={`Target: 500M DNR`}
                        />
                        <div className="relative glass-panel bg-white/5 border border-white/5 rounded-3xl p-6 flex flex-col justify-center gap-2 overflow-hidden group">
                            <Search className="absolute right-6 top-6 text-white/5 group-hover:text-white/10 transition-colors" size={60} />
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Global Intelligence</p>
                            <input
                                type="text"
                                placeholder="Filter Investors..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent border-none outline-none text-xl font-black text-white p-0 placeholder:text-gray-700 font-space"
                            />
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="glass-panel bg-white/5 border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead>
                                    <tr className="bg-white/5 text-[9px] uppercase tracking-[0.2em] font-black text-gray-500">
                                        <th className="px-8 py-6">Investor</th>
                                        <th className="px-8 py-6 text-center">Commitment</th>
                                        <th className="px-8 py-6 text-center">Tier</th>
                                        <th className="px-8 py-6">Proof of Payment</th>
                                        <th className="px-8 py-6">Wallet Identity</th>
                                        <th className="px-8 py-6 text-right">Verification</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    <AnimatePresence>
                                        {filteredUsers.map((user, idx) => (
                                            <motion.tr
                                                key={user._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                onClick={() => setSelectedUser(user)}
                                                className="hover:bg-indigo-500/5 transition-all group border-none cursor-pointer"
                                            >
                                                <td className="px-8 py-6">
                                                    <div>
                                                        <p className="font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{user.fullName}</p>
                                                        <p className="text-[10px] text-gray-600 font-bold">{user.email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <p className="font-black text-white text-base">{(user.tokenAmount || 0).toLocaleString()}</p>
                                                        <p className="text-[10px] font-bold text-emerald-500 tracking-widest">${(user.usdCost || 0).toLocaleString()} <span className="text-gray-600">USD</span></p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest inline-block skew-x-[-12deg] ${user.tier === 'enterprise' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                                        user.tier === 'professional' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                                                            'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                                        }`}>
                                                        {user.tier}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    {user.transactionHash ? (
                                                        <div className="flex items-center gap-2 text-indigo-400 text-[11px] font-bold">
                                                            <span className="truncate max-w-[100px] font-mono">{user.transactionHash}</span>
                                                            <ExternalLink size={12} />
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-gray-700 font-black uppercase italic tracking-widest">Wait-list</span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6 font-mono text-[11px] text-gray-500 font-bold">
                                                    {user.walletAddress.slice(0, 10)}...{user.walletAddress.slice(-8)}
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <div className={`w-2 h-2 rounded-full ${user.paymentStatus === 'confirmed' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                                                            user.paymentStatus === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-gray-700'
                                                            }`} />
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${user.paymentStatus === 'confirmed' ? 'text-emerald-500' : 'text-gray-500'
                                                            }`}>
                                                            {user.paymentStatus || 'Awaiting'}
                                                        </span>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>

                        {loading && (
                            <div className="p-32 flex flex-col items-center justify-center space-y-4">
                                <RefreshCw className="text-indigo-500 animate-spin" size={40} />
                                <p className="font-black uppercase tracking-[0.3em] text-[10px] text-gray-600">Synchronizing Ledger...</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Investor Detailed Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedUser(null)}
                            className="absolute inset-0 bg-[#020410]/95 backdrop-blur-xl"
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-4xl bg-white/[0.02] border border-white/5 rounded-[48px] overflow-hidden shadow-[0_0_100px_rgba(99,102,241,0.1)] flex flex-col md:flex-row"
                        >
                            {/* Modal Sidebar (Profile Summary) */}
                            <div className="w-full md:w-80 bg-white/5 p-10 border-r border-white/5 space-y-8">
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="w-24 h-24 rounded-full bg-indigo-600/20 border-2 border-indigo-500/30 flex items-center justify-center text-3xl font-black text-indigo-400">
                                        {selectedUser.fullName?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight">{selectedUser.fullName}</h3>
                                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">{selectedUser.tier} Investor</p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-8 border-t border-white/5">
                                    <DetailItem icon={Mail} label="Email Address" value={selectedUser.email} />
                                    <DetailItem icon={Smartphone} label="Contact" value={selectedUser.phone || 'Unspecified'} />
                                    <DetailItem icon={MapPin} label="Jurisdiction" value={selectedUser.country} />
                                </div>

                                <button
                                    onClick={() => deleteUser(selectedUser._id)}
                                    className="w-full py-4 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 mt-auto"
                                >
                                    <Trash2 size={14} /> Redact Investor
                                </button>
                            </div>

                            {/* Modal Main Content */}
                            <div className="flex-1 p-10 md:p-16 space-y-12 overflow-y-auto max-h-[90vh]">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Capital Audit Portal</p>
                                        <h2 className="text-3xl font-black font-space mt-2">DNR Commitment</h2>
                                    </div>
                                    <button
                                        onClick={() => setSelectedUser(null)}
                                        className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Financial Card */}
                                <div className="grid grid-cols-2 gap-8 p-10 bg-indigo-600/10 border border-indigo-500/20 rounded-[32px] relative overflow-hidden">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Token Allocation</p>
                                        <p className="text-4xl font-black font-space">{(selectedUser.tokenAmount || 0).toLocaleString()} <span className="text-sm font-bold opacity-50">DNR</span></p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Settlement Value</p>
                                        <p className="text-4xl font-black font-space">${(selectedUser.usdCost || 0).toLocaleString()} <span className="text-sm font-bold opacity-50">USD</span></p>
                                    </div>
                                    <ArrowUpRight className="absolute -right-4 -bottom-4 text-indigo-500/10" size={120} />
                                </div>

                                {/* Audit Trail */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <Shield size={20} className="text-emerald-500" />
                                        <h4 className="text-sm font-black uppercase tracking-widest">Audit Trail</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                <Wallet size={12} /> Destination Wallet
                                            </p>
                                            <p className="text-xs font-mono font-bold text-white break-all">{selectedUser.walletAddress}</p>
                                        </div>
                                        <div className="group p-6 bg-white/5 border border-white/5 rounded-2xl space-y-2 hover:border-indigo-500/30 transition-all cursor-pointer">
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center justify-between">
                                                <span className="flex items-center gap-2"><CreditCard size={12} /> Payment Hash</span>
                                                <ExternalLink size={12} />
                                            </p>
                                            <p className="text-xs font-mono font-bold text-indigo-400 break-all">{selectedUser.transactionHash || 'Waiting for submission...'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-8 border-t border-white/5 flex gap-4">
                                    <button
                                        onClick={() => approveUser(selectedUser._id)}
                                        disabled={selectedUser.paymentStatus === 'confirmed'}
                                        className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${selectedUser.paymentStatus === 'confirmed'
                                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/20 active:scale-95'
                                            }`}
                                    >
                                        {selectedUser.paymentStatus === 'confirmed' ? (
                                            <>
                                                <CheckCircle2 size={18} />
                                                Audit Verified
                                            </>
                                        ) : (
                                            <>
                                                <Shield size={18} />
                                                Confirm Payment
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function DetailItem({ icon: Icon, label, value }: any) {
    return (
        <div className="space-y-1">
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
                <Icon size={12} /> {label}
            </p>
            <p className="text-xs font-bold text-white truncate">{value}</p>
        </div>
    );
}

function QuickStat({ label, value, subValue, icon: Icon, color }: any) {
    const colorClasses: any = {
        indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
        cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
        purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    };

    return (
        <div className="glass-panel bg-white/5 border border-white/5 rounded-3xl p-6 space-y-4 relative overflow-hidden group">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colorClasses[color]} group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</p>
                <div className="flex items-end gap-3">
                    <p className="text-3xl font-black font-space">{value}</p>
                    <p className="text-[10px] font-bold text-gray-700 mb-1">{subValue}</p>
                </div>
            </div>
            <div className={`absolute -right-2 -bottom-2 w-24 h-24 blur-3xl rounded-full opacity-10 ${color === 'indigo' ? 'bg-indigo-500' : color === 'cyan' ? 'bg-cyan-500' : 'bg-purple-500'}`} />
        </div>
    );
}
