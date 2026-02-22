'use client';

// ==================================
// Admin Manual Manager (Subject-Based)
// ==================================

import { useState, useEffect } from 'react';
import {
    Folder, Upload, Search, Trash2,
    Download, Eye, Loader2, FileText, ChevronRight, X, BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
    folder: { name: string };
}

export default function ManualManagerPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [manuals, setManuals] = useState<Pdf[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Upload Modal State
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadConfig, setUploadConfig] = useState({
        title: '',
        description: '',
        file: null as File | null
    });
    const [uploading, setUploading] = useState(false);

    const loadSubjects = async () => {
        try {
            const res = await api.get('/academic/subjects');
            const data = res.data?.data || res.data || [];
            setSubjects(data);
            if (data.length > 0 && !selectedSubject) {
                setSelectedSubject(data[0].id);
            }
        } catch (error) {
            toast.error('Failed to load subjects');
        }
    };

    const loadManuals = async () => {
        if (!selectedSubject) return;
        try {
            setLoading(true);
            // We fetch lab PDFs specifically for this subject
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

    const getOrCreateSubjectFolder = async () => {
        // First check if a "Lab Manuals" folder exists for this subject
        const fetchRes = await api.get(`/pdfs/folders?subjectId=${selectedSubject}`);
        const folders = fetchRes.data.data;

        let targetFolder = folders.find((f: any) => f.name.toLowerCase().includes('lab'));

        if (!targetFolder) {
            // Create root folder for this subject if missing
            const createRes = await api.post('/pdfs/folders', {
                name: 'Lab Manuals',
                subjectId: selectedSubject
            });
            targetFolder = createRes.data.data;
        }
        return targetFolder.id;
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadConfig.file || !uploadConfig.title || !selectedSubject) return;

        try {
            setUploading(true);
            const folderId = await getOrCreateSubjectFolder();

            const formData = new FormData();
            formData.append('file', uploadConfig.file);
            formData.append('title', uploadConfig.title);
            formData.append('folderId', folderId);
            if (uploadConfig.description) formData.append('description', uploadConfig.description);

            await api.post('/pdfs', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Lab Manual uploaded successfully');
            setShowUploadModal(false);
            setUploadConfig({ title: '', description: '', file: null });
            loadManuals(); // Reload list
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this manual?')) return;
        try {
            await api.delete(`/pdfs/${id}`);
            toast.success('Manual deleted');
            setManuals(manuals.filter(m => m.id !== id));
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleView = async (id: string) => {
        try {
            const res = await api.get(`/pdfs/${id}/view`);
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
                        <span className="text-primary-500">Manual Manager</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">
                        Subject Lab Manuals
                    </h1>
                    <p className="text-sm text-gray-400">
                        Upload manuals and associate them directly with academic subjects.
                    </p>
                </div>

                <button
                    onClick={() => setShowUploadModal(true)}
                    disabled={!selectedSubject}
                    className="btn-primary flex items-center gap-2 px-6 py-3 disabled:opacity-50"
                >
                    <Upload size={18} />
                    UPLOAD MANUAL
                </button>
            </div>

            {/* Filters */}
            <div className="bg-dark-200 border border-dark-border rounded-3xl p-6 mb-8 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Target Subject</label>
                        <select
                            className="w-full bg-dark-100 border border-dark-border rounded-xl px-4 py-3 text-sm text-gray-300 focus:border-primary-500 outline-none"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                        >
                            <option value="" disabled>Select a Subject...</option>
                            {subjects.map(sub => (
                                <option key={sub.id} value={sub.id}>
                                    {sub.name} ({sub.code}) - {sub.semester?.year?.branch?.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Search Manuals</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                className="w-full bg-dark-100 border border-dark-border rounded-xl pl-12 pr-4 py-3 text-sm text-gray-300 focus:border-primary-500 outline-none"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Records List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <Loader2 className="animate-spin mb-4" size={32} />
                    <p className="text-sm font-bold uppercase tracking-widest">Scanning Storage Cluster</p>
                </div>
            ) : !selectedSubject ? (
                <div className="bg-dark-200 border border-dark-border border-dashed rounded-3xl p-16 text-center shadow-md">
                    <h3 className="text-xl font-bold text-gray-300 mb-2">Select a Subject</h3>
                    <p className="text-gray-500 text-sm">Please select a subject from the dropdown above to view or upload manuals.</p>
                </div>
            ) : manuals.length === 0 ? (
                <div className="bg-dark-200 border border-dark-border border-dashed rounded-3xl p-16 text-center shadow-md">
                    <div className="w-20 h-20 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-dark-border shadow-inner">
                        <Folder size={32} className="text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-300 mb-2">No Manuals Found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-8 text-sm">
                        There are no lab manuals uploaded for the selected subject.
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {manuals.map((manual) => (
                        <div key={manual.id} className="bg-dark-200 border border-dark-border rounded-3xl p-6 hover:border-primary-500/50 transition-colors group relative overflow-hidden">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-400 flex items-center justify-center border border-primary-500/20">
                                    <BookOpen size={24} />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleView(manual.id)}
                                        className="w-8 h-8 rounded-lg bg-dark-100 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(manual.id)}
                                        className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{manual.title}</h3>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{manual.description || 'No description'}</p>

                            <div className="flex items-center justify-between text-[10px] font-bold text-gray-600 uppercase tracking-widest pt-4 border-t border-dark-border">
                                <span>{formatBytes(manual.sizeBytes)}</span>
                                <span>{new Date(manual.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
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

                            <h2 className="text-2xl font-bold text-white mb-2">Upload Subject Manual</h2>
                            <p className="text-sm text-gray-400 mb-8">Add a lab manual specifically for the selected academic subject.</p>

                            <form onSubmit={handleUpload} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">Manual Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-dark-100 border border-dark-border rounded-xl p-4 text-sm text-white focus:border-primary-500 outline-none"
                                        value={uploadConfig.title}
                                        onChange={e => setUploadConfig({ ...uploadConfig, title: e.target.value })}
                                        placeholder="e.g. Data Structures Full Manual"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Description (Optional)</label>
                                    <textarea
                                        className="w-full bg-dark-100 border border-dark-border rounded-xl p-4 text-sm text-gray-300 focus:border-primary-500 outline-none h-24 resize-none"
                                        value={uploadConfig.description}
                                        onChange={e => setUploadConfig({ ...uploadConfig, description: e.target.value })}
                                    />
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
                                        <div className="w-full bg-dark-100 border-2 border-dashed border-dark-border rounded-xl p-6 flex flex-col items-center justify-center transition-colors hover:border-primary-500">
                                            <Upload size={24} className="text-gray-500 mb-2" />
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
                                        className="px-6 py-3 rounded-xl bg-dark-100 text-gray-400 font-bold text-sm hover:text-white"
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading || !uploadConfig.file || !uploadConfig.title}
                                        className="btn-primary flex items-center gap-2 px-8 py-3 disabled:opacity-50"
                                    >
                                        {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                                        {uploading ? 'UPLOADING...' : 'SAVE MANUAL'}
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
