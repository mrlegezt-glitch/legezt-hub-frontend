'use client';

// ==================================
// Student Lab Manuals Browse
// ==================================

import { useState, useEffect } from 'react';
import {
    Folder, Search, Download, Eye, Loader2, FileText, ChevronRight, BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Subject {
    id: string;
    name: string;
    code: string;
    semester: { displayName: string; year: { branch: { name: string } } };
}

interface Pdf {
    id: string;
    title: string;
    description: string;
    sizeBytes: number;
    createdAt: string;
}

export default function StudentManualsPage() {
    const [manuals, setManuals] = useState<Pdf[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState('');
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubject, setSelectedSubject] = useState('');

    const loadSubjects = async () => {
        try {
            const res = await api.get('/academic/subjects');
            const data = res.data?.data || res.data || [];
            setSubjects(data);
            if (data.length > 0 && !selectedSubject) {
                setSelectedSubject(data[0].id);
            }
        } catch (error) {
            console.error("Failed to load subjects", error);
        }
    };

    const loadManuals = async () => {
        if (!selectedSubject) return;
        try {
            setLoading(true);
            let url = `/pdfs?type=lab&subjectId=${selectedSubject}`;
            if (search) url += `&search=${search}`;

            const res = await api.get(url);
            setManuals(res.data?.data || res.data || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load manuals');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSubjects();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadManuals();
        }, 300);
        return () => clearTimeout(timer);
    }, [selectedSubject, search]);

    const handleView = async (id: string) => {
        try {
            const res = await api.get(`/pdfs/${id}/view`);
            window.open(res.data.data.url, '_blank');
        } catch (error) {
            toast.error('Failed to get view link');
        }
    };

    const handleDownload = async (id: string) => {
        try {
            const res = await api.get(`/pdfs/${id}/download`);
            const url = res.data.data.url;
            const a = document.createElement('a');
            a.href = url;
            a.download = res.data.data.title || 'manual';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            toast.error('Failed to download manual');
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
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-5 md:px-6">

                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">
                        <Link href="/labs" className="hover:text-blue-400 transition-colors">Labs</Link>
                        <ChevronRight size={12} className="text-gray-600" />
                        <span className="text-blue-500">Lab Manuals</span>
                    </div>

                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-6 border border-blue-500/20">
                        <FileText className="text-blue-400" size={32} />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                        Subject <span className="text-blue-500">Lab Manuals</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl text-lg leading-relaxed">
                        Access primary lab manuals, experiment methodologies, and reference readings uploaded explicitly for your subjects.
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-dark-200/50 backdrop-blur-xl border border-dark-border rounded-3xl p-6 mb-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                        <select
                            className="bg-dark-100 border border-dark-border rounded-xl px-4 py-3 text-sm text-gray-300 focus:border-blue-500 outline-none transition-colors cursor-pointer"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                        >
                            <option value="" disabled>Select a Subject</option>
                            {subjects.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.name} ({s.code}) - {s.semester?.year?.branch?.name}
                                </option>
                            ))}
                        </select>

                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search manuals by name..."
                                className="w-full bg-dark-100 border border-dark-border rounded-xl pl-12 pr-4 py-3 text-sm text-gray-300 focus:border-blue-500 outline-none transition-colors"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Manuals List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-gray-500">
                        <Loader2 className="animate-spin mb-4" size={32} />
                        <p className="text-sm font-bold uppercase tracking-widest text-blue-500/50">Fetching Manuals...</p>
                    </div>
                ) : !selectedSubject ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-dark-200/30 backdrop-blur-sm border border-dark-border border-dashed rounded-3xl p-16 text-center shadow-md relative overflow-hidden"
                    >
                        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Select a Subject</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-8 text-sm">
                            Please select a subject from the dropdown above to view its available lab manuals.
                        </p>
                    </motion.div>
                ) : manuals.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-dark-200/30 backdrop-blur-sm border border-dark-border rounded-3xl p-16 text-center shadow-md relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay pointer-events-none" />

                        <div className="w-20 h-20 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-dark-border shadow-inner">
                            <Folder size={32} className="text-gray-500" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Vault Empty</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-8 text-sm">
                            We couldn&apos;t find any lab manuals matching your active filters.
                        </p>
                        <button
                            onClick={() => setSearch('')}
                            className="px-6 py-3 bg-blue-500/10 text-blue-400 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-blue-500/20 transition-colors border border-blue-500/20"
                        >
                            Clear Filters
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {manuals.map((manual, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={manual.id}
                                className="bg-dark-200/50 backdrop-blur-md border border-dark-border rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] group flex flex-col"
                            >
                                <div className="p-6 flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
                                            <BookOpen size={24} />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleView(manual.id)}
                                                className="w-10 h-10 rounded-xl bg-dark-100 flex items-center justify-center text-gray-400 hover:bg-blue-500 hover:text-white transition-colors border border-dark-border hover:border-blue-400"
                                                title="View PDF"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDownload(manual.id)}
                                                className="w-10 h-10 rounded-xl bg-dark-100 flex items-center justify-center text-gray-400 hover:bg-cyan-500 hover:text-white transition-colors border border-dark-border hover:border-cyan-400"
                                                title="Download PDF"
                                            >
                                                <Download size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-blue-400 transition-colors line-clamp-2">
                                        {manual.title}
                                    </h3>

                                    <p className="text-gray-500 text-sm mb-6 line-clamp-3">
                                        {manual.description || 'No description provided for this manual.'}
                                    </p>
                                </div>

                                <div className="p-4 border-t border-dark-border bg-black/20 flex flex-wrap gap-2 items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                    <span className="px-2 py-1 bg-dark-100 rounded-md border border-dark-border">
                                        {formatBytes(manual.sizeBytes)}
                                    </span>
                                    <span>{new Date(manual.createdAt).toLocaleDateString()}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
