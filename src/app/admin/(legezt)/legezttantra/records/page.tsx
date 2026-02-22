'use client';

// ==================================
// Admin Record Manager
// ==================================

import { useState, useEffect } from 'react';
import {
    FolderOpen, Upload, Search, Filter, Trash2,
    Download, Eye, Loader2, FileText, ChevronRight, X
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/stores/uiStore';
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

export default function RecordManagerPage() {
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

    // Upload Modal State
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadConfig, setUploadConfig] = useState({
        title: '',
        description: '',
        branchId: '',
        yearId: '',
        semesterId: '',
        file: null as File | null
    });
    const [uploading, setUploading] = useState(false);

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

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadConfig.file || !uploadConfig.title) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', uploadConfig.file);
            formData.append('title', uploadConfig.title);
            if (uploadConfig.description) formData.append('description', uploadConfig.description);
            if (uploadConfig.branchId) formData.append('branchId', uploadConfig.branchId);
            if (uploadConfig.yearId) formData.append('yearId', uploadConfig.yearId);
            if (uploadConfig.semesterId) formData.append('semesterId', uploadConfig.semesterId);

            await api.post('/records', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Record uploaded successfully');
            setShowUploadModal(false);
            setUploadConfig({ title: '', description: '', branchId: '', yearId: '', semesterId: '', file: null });
            loadRecords(); // Reload list
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this record?')) return;
        try {
            await api.delete(`/records/${id}`);
            toast.success('Record deleted');
            setRecords(records.filter(r => r.id !== id));
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleView = async (id: string) => {
        try {
            const res = await api.get(`/records/${id}/view`);
            window.open(res.data.data.url, '_blank');
        } catch (error) {
            toast.error('Failed to get view link');
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
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                        <Link href="/admin/legezttantra" className="hover:text-primary-400 transition-colors">Command Center</Link>
                        <ChevronRight size={12} className="text-gray-700" />
                        <span className="text-primary-500">Record Manager</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">
                        Lab Records
                    </h1>
                    <p className="text-sm text-gray-400">
                        Upload and manage practical records, manuals, and PDFs.
                    </p>
                </div>

                <button
                    onClick={() => setShowUploadModal(true)}
                    className="btn-primary flex items-center gap-2 px-6 py-3"
                >
                    <Upload size={18} />
                    UPLOAD RECORD
                </button>
            </div>

            {/* Filters */}
            <div className="bg-dark-200 border border-dark-border rounded-3xl p-6 mb-8 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search records..."
                            className="w-full bg-dark-100 border border-dark-border rounded-xl pl-12 pr-4 py-3 text-sm text-gray-300 focus:border-primary-500 outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        className="bg-dark-100 border border-dark-border rounded-xl px-4 py-3 text-sm text-gray-300 focus:border-primary-500 outline-none"
                        value={branchId}
                        onChange={(e) => setBranchId(e.target.value)}
                    >
                        <option value="">All Branches</option>
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>

                    <select
                        className="bg-dark-100 border border-dark-border rounded-xl px-4 py-3 text-sm text-gray-300 focus:border-primary-500 outline-none"
                        value={yearId}
                        onChange={(e) => setYearId(e.target.value)}
                    >
                        <option value="">All Years</option>
                        {years.filter(y => !branchId || y.branchId === branchId).map(y => <option key={y.id} value={y.id}>{y.displayName}</option>)}
                    </select>

                    <select
                        className="bg-dark-100 border border-dark-border rounded-xl px-4 py-3 text-sm text-gray-300 focus:border-primary-500 outline-none"
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
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <Loader2 className="animate-spin mb-4" size={32} />
                    <p className="text-sm font-bold uppercase tracking-widest">Scanning Storage Cluster</p>
                </div>
            ) : records.length === 0 ? (
                <div className="bg-dark-200 border border-dark-border border-dashed rounded-3xl p-16 text-center shadow-md">
                    <div className="w-20 h-20 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-dark-border shadow-inner">
                        <FolderOpen size={32} className="text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-300 mb-2">No Records Found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-8 text-sm">
                        There are no lab records uploaded matching your current filters.
                    </p>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="btn-primary inline-flex items-center gap-2"
                    >
                        <Upload size={16} />
                        UPLOAD NEW
                    </button>
                </div>
            ) : (
                <div className="bg-dark-200 border border-dark-border rounded-3xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-dark-border bg-black/20">
                                    <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest min-w-[300px]">Document Info</th>
                                    <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Branch</th>
                                    <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Year / Sem</th>
                                    <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Size & Date</th>
                                    <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((record) => (
                                    <tr key={record.id} className="border-b border-dark-border hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center shrink-0 border border-red-500/20">
                                                    <FileText size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-200 mb-0.5">{record.title}</div>
                                                    <div className="text-xs text-gray-500 line-clamp-1">{record.description || 'No description'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-400">
                                            {record.branch ? (
                                                <span className="px-2 py-1 bg-dark-100 rounded-md border border-dark-border text-xs font-medium text-gray-300">{record.branch.name}</span>
                                            ) : '-'}
                                        </td>
                                        <td className="p-4 text-sm text-gray-400">
                                            {record.semester ? (
                                                <span className="px-2 py-1 bg-primary-500/10 text-primary-400 rounded-md border border-primary-500/20 text-xs font-bold">{record.year?.displayName} / {record.semester.displayName}</span>
                                            ) : '-'}
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            <div className="font-mono text-xs">{formatBytes(record.sizeBytes)}</div>
                                            <div className="text-[10px] uppercase mt-1">{new Date(record.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleView(record.id)}
                                                    className="p-2 bg-dark-100 border border-dark-border rounded-lg text-gray-400 hover:text-white hover:border-gray-600 transition-all"
                                                    title="View PDF"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(record.id)}
                                                    className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm shadow-red-500/10"
                                                    title="Delete Record"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-dark-200 border border-dark-border rounded-3xl p-8 w-full max-w-xl shadow-2xl relative"
                        >
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <h2 className="text-2xl font-bold text-white mb-2">Upload Record</h2>
                            <p className="text-sm text-gray-400 mb-8">Add a new Lab PDF to the institutional repository.</p>

                            <form onSubmit={handleUpload} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">Document Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-dark-100 border border-dark-border rounded-xl p-4 text-sm text-white focus:border-primary-500 outline-none"
                                        value={uploadConfig.title}
                                        onChange={e => setUploadConfig({ ...uploadConfig, title: e.target.value })}
                                        placeholder="e.g. Physics Lab Manual Part-1"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Description (Optional)</label>
                                    <textarea
                                        className="w-full bg-dark-100 border border-dark-border rounded-xl p-4 text-sm text-gray-300 focus:border-primary-500 outline-none h-24 resize-none"
                                        value={uploadConfig.description}
                                        onChange={e => setUploadConfig({ ...uploadConfig, description: e.target.value })}
                                        placeholder="Brief description of the record content..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">Branch</label>
                                        <select
                                            className="w-full bg-dark-100 border border-dark-border rounded-xl p-4 text-sm text-white focus:border-primary-500 outline-none"
                                            value={uploadConfig.branchId}
                                            onChange={e => setUploadConfig({ ...uploadConfig, branchId: e.target.value, yearId: '', semesterId: '' })}
                                        >
                                            <option value="">Select Branch...</option>
                                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">Year</label>
                                        <select
                                            className="w-full bg-dark-100 border border-dark-border rounded-xl p-4 text-sm text-white focus:border-primary-500 outline-none"
                                            value={uploadConfig.yearId}
                                            onChange={e => setUploadConfig({ ...uploadConfig, yearId: e.target.value, semesterId: '' })}
                                        >
                                            <option value="">Select Year...</option>
                                            {years.filter(y => !uploadConfig.branchId || y.branchId === uploadConfig.branchId).map(y => <option key={y.id} value={y.id}>{y.displayName}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">Semester</label>
                                    <select
                                        className="w-full bg-dark-100 border border-dark-border rounded-xl p-4 text-sm text-white focus:border-primary-500 outline-none"
                                        value={uploadConfig.semesterId}
                                        onChange={e => setUploadConfig({ ...uploadConfig, semesterId: e.target.value })}
                                    >
                                        <option value="">Select Semester...</option>
                                        {semesters.filter(s => !uploadConfig.yearId || s.yearId === uploadConfig.yearId).map(s => <option key={s.id} value={s.id}>{s.displayName}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">PDF File (Max 50MB)</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            required
                                            onChange={e => setUploadConfig({ ...uploadConfig, file: e.target.files ? e.target.files[0] : null })}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="w-full bg-dark-100 border-2 border-dashed border-dark-border rounded-xl p-6 flex flex-col items-center justify-center transition-colors group-hover:border-primary-500">
                                            <Upload size={24} className="text-gray-500 mb-2 group-hover:text-primary-400" />
                                            <span className="text-sm font-medium text-gray-300">
                                                {uploadConfig.file ? uploadConfig.file.name : 'Click or drag PDF here'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-dark-border flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowUploadModal(false)}
                                        className="px-6 py-3 rounded-xl bg-dark-100 text-gray-400 font-bold text-sm hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading || !uploadConfig.file || !uploadConfig.title}
                                        className="btn-primary flex items-center gap-2 px-8 py-3 disabled:opacity-50"
                                    >
                                        {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                                        {uploading ? 'UPLOADING...' : 'CONFIRM UPLOAD'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
