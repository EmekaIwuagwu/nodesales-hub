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
    Calendar,
    ArrowUpRight,
    TrendingUp,
    Database
} from 'lucide-react';
import AdminSidebar from '@/components/admin/Sidebar';

export default function AdminDashboard() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dbStatus, setDbStatus] = useState<'connected' | 'syncing' | 'error'>('syncing');
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
            {/* Navigation Sidebar */}
            <AdminSidebar />

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-[280px] p-8 md:p-12">
                <div className="max-w-7xl mx-auto space-y-12">

                    {/* Header Section */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${dbStatus === 'connected' ? 'bg-emerald-500/10 text-emerald-500' :
                                    dbStatus === 'error' ? 'bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' :
                                        'bg-amber-500/10 text-amber-500 animate-pulse'
                                    }`}>
                                    <Database size={10} />
                                    {dbStatus === 'connected' ? 'Live Database Connected' :
                                        dbStatus === 'error' ? 'Database Connection Failure' :
                                            'Synchronizing Ledger...'}
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
                                        <th className="px-8 py-6">ID & Investor</th>
                                        <th className="px-8 py-6 text-center">Commitment</th>
                                        <th className="px-8 py-6 text-center">Tier Status</th>
                                        <th className="px-8 py-6">Audit Trail (Receipt)</th>
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
                                                className="hover:bg-white/5 transition-all group border-none"
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-black text-xs text-gray-500">
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-white uppercase tracking-tight">{user.fullName}</p>
                                                            <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold">
                                                                <span>{user.email}</span>
                                                                <span className="w-1 h-1 rounded-full bg-gray-700" />
                                                                <span className="text-indigo-400">{user.country}</span>
                                                            </div>
                                                        </div>
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
                                                        <a
                                                            href={
                                                                user.transactionHash.startsWith('http') ? user.transactionHash :
                                                                    user.paymentMethod?.toLowerCase().includes('trc') ? `https://tronscan.org/#/transaction/${user.transactionHash}` :
                                                                        user.paymentMethod?.toLowerCase().includes('polygon') ? `https://polygonscan.com/tx/${user.transactionHash}` :
                                                                            `https://etherscan.io/tx/${user.transactionHash}`
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition group/link"
                                                        >
                                                            <span className="font-mono text-[11px] font-bold truncate max-w-[120px]">{user.transactionHash}</span>
                                                            <ExternalLink size={12} className="group-hover/link:translate-x-1 transition-transform" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-[10px] text-gray-700 font-black uppercase tracking-widest italic">Wait-list Only</span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6 font-mono text-[11px] text-gray-500 font-bold">
                                                    {user.walletAddress.slice(0, 10)}...{user.walletAddress.slice(-8)}
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <div className="text-right mr-2 hidden sm:block">
                                                            <p className={`text-[9px] font-bold uppercase tracking-widest ${user.paymentStatus === 'confirmed' ? 'text-emerald-500' :
                                                                user.paymentStatus === 'pending' ? 'text-amber-500' : 'text-gray-600'
                                                                }`}>
                                                                {user.paymentStatus || 'Awaiting'}
                                                            </p>
                                                            <p className="text-[8px] text-gray-700 font-bold uppercase">System Auth</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={async () => {
                                                                    if (confirm('Verify this capital injection?')) {
                                                                        await fetch('/api/presale/admin/users', {
                                                                            method: 'PATCH',
                                                                            signal: null,
                                                                            headers: { 'Content-Type': 'application/json' },
                                                                            body: JSON.stringify({ userId: user._id, status: 'confirmed' }),
                                                                        });
                                                                        fetchUsers();
                                                                    }
                                                                }}
                                                                disabled={user.paymentStatus === 'confirmed'}
                                                                className={`p-2.5 rounded-xl transition-all ${user.paymentStatus === 'confirmed'
                                                                    ? 'bg-emerald-500/5 text-emerald-500 border border-emerald-500/20 opacity-50'
                                                                    : 'bg-white/5 text-white hover:bg-emerald-500 hover:text-white border border-white/10'
                                                                    }`}
                                                            >
                                                                <Shield size={16} />
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    if (confirm('Delete this investor record permanently?')) {
                                                                        await fetch('/api/presale/admin/users', {
                                                                            method: 'DELETE',
                                                                            headers: { 'Content-Type': 'application/json' },
                                                                            body: JSON.stringify({ userId: user._id }),
                                                                        });
                                                                        fetchUsers();
                                                                    }
                                                                }}
                                                                className="p-2.5 bg-white/5 text-gray-500 hover:bg-red-500 hover:text-white border border-white/10 rounded-xl transition-all"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
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
                                <p className="font-black uppercase tracking-[0.3em] text-[10px] text-gray-600">Decrypting Blockchain Ledger...</p>
                            </div>
                        )}

                        {!loading && dbStatus === 'error' && (
                            <div className="p-32 text-center flex flex-col items-center gap-6">
                                <div className="p-4 bg-red-500/10 rounded-full text-red-500 border border-red-500/20">
                                    <Shield size={40} />
                                </div>
                                <div className="space-y-2 max-w-md">
                                    <p className="text-xl font-black text-white font-space uppercase tracking-tighter">Audit Connection Failed</p>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        The terminal cannot reach the secure database cluster. This is likely due to an <strong>IP Whitelist</strong> restriction on MongoDB Atlas for the production environment.
                                    </p>
                                </div>
                                <button onClick={fetchUsers} className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition">
                                    Try Re-establishing Secure Tunnel
                                </button>
                            </div>
                        )}

                        {!loading && dbStatus !== 'error' && filteredUsers.length === 0 && (
                            <div className="p-32 text-center text-gray-600 flex flex-col items-center gap-4">
                                <Database size={40} className="opacity-20" />
                                <p className="font-bold text-sm">No transaction records match your search query.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
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
