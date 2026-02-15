'use client';

import { useEffect, useState } from 'react';
import { Users, BookOpen, Folder, Code, TrendingUp, AlertCircle } from 'lucide-react';
import { labApi } from '@/lib/api';

export default function LeGeZtAdminDashboard() {
    const [statsData, setStatsData] = useState({
        colleges: 0,
        courses: 0,
        labs: 0,
        users: 0
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const res = await labApi.getDashboardStats();
            setStatsData(res.data);
        } catch (error) {
            console.error("Failed to load stats", error);
        }
    };

    // Derived Stats
    const stats = [
        { label: 'Total Colleges', value: statsData.colleges, icon: BookOpen, color: 'from-blue-500/20 to-blue-600/20', iconColor: 'text-blue-400' },
        { label: 'Active Courses', value: statsData.courses, icon: Folder, color: 'from-emerald-500/20 to-emerald-600/20', iconColor: 'text-emerald-400' },
        { label: 'Total Experiments', value: statsData.labs, icon: Code, color: 'from-primary-500/20 to-primary-600/20', iconColor: 'text-primary-400' },
        { label: 'Active Users', value: statsData.users, icon: Users, color: 'from-orange-500/20 to-orange-600/20', iconColor: 'text-orange-400' },
    ];

    return (
        <div className="space-y-10 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black text-white tracking-tighter italic">COMMAND <span className="text-primary-500">CENTER</span></h1>
                <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.3em]">Institutional Infrastructure Control</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="card-hover group relative overflow-hidden backdrop-blur-2xl border-white/5">
                        <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${stat.color} blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`} />
                        <div className="flex items-center gap-6 relative z-10">
                            <div className={`w-14 h-14 rounded-2xl bg-dark-300 border border-white/5 flex items-center justify-center ${stat.iconColor} shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                                <stat.icon size={28} />
                            </div>
                            <div>
                                <div className="text-3xl font-black text-white tracking-tighter">{stat.value}</div>
                                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity / Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Recent Activity */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-3">
                            <TrendingUp className="text-primary-500" size={20} />
                            REAL-TIME MODIFICATIONS
                        </h3>
                        <button className="text-[10px] font-black text-primary-400 uppercase tracking-widest hover:text-primary-300 transition-colors">Audit Logs</button>
                    </div>

                    <div className="bg-dark-200 border border-dark-border rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <div className="divide-y divide-dark-border/50">
                            {[1, 2, 3, 4].map((_, i) => (
                                <div key={i} className="flex items-center justify-between px-8 py-6 hover:bg-white/[0.02] transition-all group/item">
                                    <div className="flex items-center gap-6">
                                        <div className="w-10 h-10 rounded-full bg-dark-300 border border-dark-border flex items-center justify-center text-gray-500 group-hover/item:text-primary-500 group-hover/item:border-primary-500/30 transition-all">
                                            <TrendingUp size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-300 group-hover/item:text-white transition-colors tracking-tight">System provisioned new course module <span className="text-primary-500">&quot;Advanced Neural Nets&quot;</span></p>
                                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">Deploy Node: Alpha-01 • {i + 1}h ago</p>
                                        </div>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_8px_var(--primary)] animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* System Status */}
                <div className="space-y-6">
                    <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-3">
                        <AlertCircle className="text-orange-500" size={20} />
                        SYSTEM TELEMETRY
                    </h3>

                    <div className="bg-dark-200 border border-dark-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="space-y-10 relative z-10">
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Storage Cluster</span>
                                    <span className="text-sm font-black text-white italic">65<span className="text-gray-500">%</span></span>
                                </div>
                                <div className="w-full bg-dark-300 h-1.5 rounded-full border border-white/5 overflow-hidden">
                                    <div className="bg-gradient-to-r from-orange-500 to-primary-500 h-full w-[65%] rounded-full shadow-[0_0_10px_rgba(249,115,22,0.3)]" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Compute Health</span>
                                    <span className="text-sm font-black text-white italic">98<span className="text-gray-500">%</span></span>
                                </div>
                                <div className="w-full bg-dark-300 h-1.5 rounded-full border border-white/5 overflow-hidden">
                                    <div className="bg-gradient-to-r from-emerald-500 to-primary-500 h-full w-[98%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                                </div>
                            </div>

                            <div className="p-6 bg-orange-500/5 rounded-3xl border border-orange-500/10 space-y-3">
                                <div className="flex items-center gap-2 text-orange-400">
                                    <AlertCircle size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Scheduled Ops</span>
                                </div>
                                <p className="text-[11px] text-gray-500 font-bold leading-relaxed">
                                    Cluster synchronization and backup protocols initiated for Sat, Jan 10 at 02:00 AM.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
