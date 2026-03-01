'use client';

// ==================================
// Student Lab Records Browse
// ==================================

import { useState, useEffect } from 'react';
import {
    FolderOpen, Search, Download, Eye, Loader2, FileText, ChevronRight, BookOpen, Share2
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Record {
    id: string;
    title: string;
    description: string;
    sizeBytes: number;
    createdAt: string;
    isActive: boolean;
    branch: { name: string } | null;
    year: { displayName: string } | null;
    semester: { displayName: string } | null;
}

export default function StudentRecordsPage() {
    const [records, setRecords] = useState<Record[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState('');
    const [branchId, setBranchId] = useState('');
    const [yearId, setYearId] = useState('');
    const [semesterId, setSemesterId] = useState('');

    // Metadata for dropdowns
    const [branches, setBranches] = useState<any[]>([]);
    const [years, setYears] = useState<any[]>([]);
    const [semesters, setSemesters] = useState<any[]>([]);

    const loadRecords = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (branchId) params.append('branchId', branchId);
            if (yearId) params.append('yearId', yearId);
            if (semesterId) params.append('semesterId', semesterId);

            const res = await api.get(`/records?${params.toString()}`);
            setRecords(res.data?.data || res.data || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load records');
        } finally {
            setLoading(false);
        }
    };

    const loadMetadata = async () => {
        try {
            const [bRes, yRes, sRes] = await Promise.all([
                api.get('/academic/branches').catch(() => ({ data: [] })),
                api.get('/academic/years').catch(() => ({ data: [] })),
                api.get('/academic/semesters').catch(() => ({ data: [] }))
            ]);
            setBranches(bRes.data?.data || bRes.data || []);
            setYears(yRes.data?.data || yRes.data || []);
            setSemesters(sRes.data?.data || sRes.data || []);
        } catch (error) {
            console.error("Failed to load metadata", error);
        }
    };

    useEffect(() => {
        loadMetadata();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadRecords();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, branchId, yearId, semesterId]);

    const handleView = async (id: string) => {
        try {
            const res = await api.get(`/records/${id}/view`);
            window.open(res.data.data.url, '_blank');
        } catch (error) {
            toast.error('Failed to get view link');
        }
    };

    const handleDownload = async (id: string) => {
        try {
            const res = await api.get(`/records/${id}/download`);
            const url = res.data.data.url;
            // Create temporary anchor to trigger download instead of opening in new tab
            const a = document.createElement('a');
            a.href = url;
            a.download = res.data.data.title || 'document';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            toast.error('Failed to download record');
        }
    };

    const handleShare = async (id: string, title: string) => {
        try {
            const toastId = toast.loading('Generating share link...');
            const res = await api.get(`/records/${id}/view`);
            const url = res.data.data.url;
            toast.dismiss(toastId);

            const shareText = `Check out this Lab Record on Legezt Hub:\n*${title}*\n\n${url}`;

            if (navigator.share) {
                try {
                    await navigator.share({
                        title: title,
                        text: 'Check out this Lab Record:',
                        url: url
                    });
                } catch (e) {
                    // Ignore abort errors from user cancelling share sheet
                }
            } else {
                // Fallback to WhatsApp Web/App redirect
                window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
            }
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to generate share link');
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="min-h-screen pt-24 pb-20 relative">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-5 md:px-6">

                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">
                        <Link href="/labs" className="hover:text-purple-400 transition-colors">Labs</Link>
                        <ChevronRight size={12} className="text-gray-600" />
                        <span className="text-purple-500">Lab Records</span>
                    </div>

                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6 border border-purple-500/20">
                        <BookOpen className="text-purple-400" size={32} />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                        Institutional <span className="text-purple-500">Lab Records</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl text-lg leading-relaxed">
                        Access official laboratory records, observation forms, and manuals customized for your branch and semester.
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-dark-200/50 backdrop-blur-xl border border-dark-border rounded-3xl p-6 mb-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search records..."
                                className="w-full bg-dark-100 border border-dark-border rounded-xl pl-12 pr-4 py-3 text-sm text-gray-300 focus:border-purple-500 outline-none transition-colors"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <select
                            className="bg-dark-100 border border-dark-border rounded-xl px-4 py-3 text-sm text-gray-300 focus:border-purple-500 outline-none transition-colors cursor-pointer"
                            value={branchId}
                            onChange={(e) => setBranchId(e.target.value)}
                        >
                            <option value="">All Branches</option>
                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>

                        <select
                            className="bg-dark-100 border border-dark-border rounded-xl px-4 py-3 text-sm text-gray-300 focus:border-purple-500 outline-none transition-colors cursor-pointer"
                            value={yearId}
                            onChange={(e) => setYearId(e.target.value)}
                        >
                            <option value="">All Years</option>
                            {years.filter(y => !branchId || y.branchId === branchId).map(y => <option key={y.id} value={y.id}>{y.displayName}</option>)}
                        </select>

                        <select
                            className="bg-dark-100 border border-dark-border rounded-xl px-4 py-3 text-sm text-gray-300 focus:border-purple-500 outline-none transition-colors cursor-pointer"
                            value={semesterId}
                            onChange={(e) => setSemesterId(e.target.value)}
                        >
                            <option value="">All Semesters</option>
                            {semesters.filter(s => !yearId || s.yearId === yearId).map(s => <option key={s.id} value={s.id}>{s.displayName}</option>)}
                        </select>
                    </div>
                </div>

                {/* Records List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-gray-500">
                        <Loader2 className="animate-spin mb-4" size={32} />
                        <p className="text-sm font-bold uppercase tracking-widest text-purple-500/50">Fetching Records...</p>
                    </div>
                ) : records.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-dark-200/30 backdrop-blur-sm border border-dark-border rounded-3xl p-16 text-center shadow-md relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay pointer-events-none" />

                        <div className="w-20 h-20 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-dark-border shadow-inner">
                            <FolderOpen size={32} className="text-gray-500" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Vault Empty</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-8 text-sm">
                            We couldn&apos;t find any lab records matching your active filters. Try clearing them to see all available documents.
                        </p>
                        <button
                            onClick={() => {
                                setSearch(''); setBranchId(''); setYearId(''); setSemesterId('');
                            }}
                            className="px-6 py-3 bg-purple-500/10 text-purple-400 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-purple-500/20 transition-colors border border-purple-500/20"
                        >
                            Clear Filters
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {records.map((record, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={record.id}
                                className="bg-dark-200/50 backdrop-blur-md border border-dark-border rounded-3xl overflow-hidden hover:border-purple-500/30 transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] group flex flex-col"
                            >
                                <div className="p-6 flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 shrink-0">
                                            <FileText size={24} />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleShare(record.id, record.title)}
                                                className="w-10 h-10 rounded-xl bg-dark-100 flex items-center justify-center text-gray-400 hover:bg-green-500 hover:text-white transition-colors border border-dark-border hover:border-green-400"
                                                title="Share Record"
                                            >
                                                <Share2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleView(record.id)}
                                                className="w-10 h-10 rounded-xl bg-dark-100 flex items-center justify-center text-gray-400 hover:bg-purple-500 hover:text-white transition-colors border border-dark-border hover:border-purple-400"
                                                title="View PDF"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDownload(record.id)}
                                                className="w-10 h-10 rounded-xl bg-dark-100 flex items-center justify-center text-gray-400 hover:bg-pink-500 hover:text-white transition-colors border border-dark-border hover:border-pink-400"
                                                title="Download PDF"
                                            >
                                                <Download size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-purple-400 transition-colors line-clamp-2">
                                        {record.title}
                                    </h3>

                                    <p className="text-gray-500 text-sm mb-6 line-clamp-3">
                                        {record.description || 'No description provided for this record.'}
                                    </p>
                                </div>

                                <div className="p-4 border-t border-dark-border bg-black/20 flex flex-wrap gap-2 items-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                    {record.branch && (
                                        <span className="px-2 py-1 bg-dark-100 rounded-md border border-dark-border">
                                            {record.branch.name}
                                        </span>
                                    )}
                                    {record.semester && (
                                        <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded-md border border-purple-500/20">
                                            {record.year?.displayName} / {record.semester.displayName}
                                        </span>
                                    )}
                                    <span className="ml-auto opacity-50">{formatBytes(record.sizeBytes)}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
