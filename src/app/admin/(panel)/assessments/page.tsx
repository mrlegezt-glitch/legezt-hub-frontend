'use client';

import { useState, useEffect } from 'react';
import {
    FileText, Plus, Search, Trash2, Calendar, Clock,
    Layers, BookOpen, User, Loader2, Upload, X, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { assessmentApi, contentApi } from '@/lib/api';

export default function AssessmentManager() {
    const [assessments, setAssessments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'ASSIGNMENT',
        submissionDate: '',
        section: '',
        semesterId: '',
        yearId: '',
        subjectId: ''
    });
    const [file, setFile] = useState<File | null>(null);

    // Hierarchy State
    const [semesters, setSemesters] = useState<any[]>([]);
    const [years, setYears] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);

    useEffect(() => {
        fetchAssessments();
        fetchInitialData();
    }, []);

    const fetchAssessments = async () => {
        try {
            const res = await assessmentApi.list();
            setAssessments(res.data.data);
        } catch (error) {
            toast.error('Failed to load assessments');
        } finally {
            setLoading(false);
        }
    };

    const fetchInitialData = async () => {
        try {
            const res = await contentApi.getColleges();
            setColleges(res.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    // Cascading Fetches
    const [colleges, setColleges] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [selectedCollege, setSelectedCollege] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');

    useEffect(() => {
        if (selectedCollege) {
            contentApi.getBranches(selectedCollege).then(res => setBranches(res.data.data));
            setSelectedBranch('');
        } else {
            setBranches([]);
        }
    }, [selectedCollege]);

    useEffect(() => {
        if (selectedBranch) {
            contentApi.getYears(selectedBranch).then(res => setYears(res.data.data));
            setFormData(prev => ({ ...prev, yearId: '' }));
        } else {
            setYears([]);
        }
    }, [selectedBranch]);

    useEffect(() => {
        if (formData.yearId) {
            contentApi.getSemesters(formData.yearId).then(res => setSemesters(res.data.data));
            setFormData(prev => ({ ...prev, semesterId: '' }));
        } else {
            setSemesters([]);
        }
    }, [formData.yearId]);

    useEffect(() => {
        if (formData.semesterId) {
            contentApi.getSubjects(formData.semesterId).then(res => setSubjects(res.data.data));
            setFormData(prev => ({ ...prev, subjectId: '' }));
        } else {
            setSubjects([]);
        }
    }, [formData.semesterId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !formData.title || !formData.type) {
            toast.error('Please fill required fields and select a file');
            return;
        }

        setSaving(true);
        const data = new FormData();
        data.append('file', file);
        data.append('title', formData.title);
        data.append('type', formData.type);
        if (formData.description) data.append('description', formData.description);
        if (formData.section) data.append('section', formData.section);
        if (formData.semesterId) data.append('semesterId', formData.semesterId);
        if (formData.yearId) data.append('yearId', formData.yearId);
        if (formData.subjectId) data.append('subjectId', formData.subjectId);
        if (formData.submissionDate) {
            data.append('submissionDate', new Date(formData.submissionDate).toISOString());
        }

        try {
            await assessmentApi.create(data);
            toast.success('Assessment created successfully');
            setIsModalOpen(false);
            fetchAssessments();
            // Reset form
            setFormData({
                title: '', description: '', type: 'ASSIGNMENT',
                submissionDate: '', section: '', semesterId: '', yearId: '', subjectId: ''
            });
            setFile(null);
        } catch (error) {
            toast.error('Failed to create assessment');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this assessment?')) return;
        try {
            await assessmentApi.delete(id);
            toast.success('Deleted successfully');
            setAssessments(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter italic">
                        ASSESSMENT <span className="text-primary-500">ENGINE</span>
                    </h1>
                    <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.3em] mt-1">
                        Management of Assignments & Evaluating Materials
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-3 bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-primary-500/20 active:scale-95 shrink-0"
                >
                    <Plus size={18} />
                    New Assessment
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Stats / Filter Sidebar (Optional) */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-dark-200 border border-dark-border rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
                        <h3 className="text-sm font-black text-white tracking-widest uppercase">Quick Stats</h3>
                        <div className="space-y-4">
                            <div className="bg-dark-300/50 p-4 rounded-2xl border border-white/5">
                                <span className="text-[10px] font-black text-gray-500 uppercase block mb-1">Total Items</span>
                                <span className="text-2xl font-black text-white italic">{assessments.length}</span>
                            </div>
                            <div className="bg-dark-300/50 p-4 rounded-2xl border border-white/5">
                                <span className="text-[10px] font-black text-gray-500 uppercase block mb-1">Assignments</span>
                                <span className="text-2xl font-black text-indigo-400 italic">
                                    {assessments.filter(a => a.type === 'ASSIGNMENT').length}
                                </span>
                            </div>
                            <div className="bg-dark-300/50 p-4 rounded-2xl border border-white/5">
                                <span className="text-[10px] font-black text-gray-500 uppercase block mb-1">Surprise Tests</span>
                                <span className="text-2xl font-black text-orange-400 italic">
                                    {assessments.filter(a => a.type === 'SURPRISE_TEST').length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Area */}
                <div className="lg:col-span-3">
                    <div className="bg-dark-200 border border-dark-border rounded-[2.5rem] overflow-hidden shadow-2xl">
                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center">
                                <Loader2 className="animate-spin text-primary-500 mb-4" size={40} />
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Scanning Repository...</p>
                            </div>
                        ) : assessments.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center opacity-40">
                                <FileText size={60} className="text-gray-600 mb-4" />
                                <p className="text-sm font-bold text-gray-500">No assessments found.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-dark-300/50 border-b border-white/5">
                                        <tr className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                                            <th className="px-8 py-5">Title / Subject</th>
                                            <th className="px-8 py-5">Type</th>
                                            <th className="px-8 py-5">Post Date</th>
                                            <th className="px-8 py-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.03]">
                                        {assessments.map((a) => (
                                            <tr key={a.id} className="group hover:bg-white/[0.02] transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.type === 'SURPRISE_TEST' ? 'bg-orange-500/10 text-orange-400' : 'bg-primary-500/10 text-primary-400'}`}>
                                                            <FileText size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors uppercase tracking-tight">{a.title}</p>
                                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">
                                                                {a.subject?.name || 'General'} • {a.section ? `Section ${a.section}` : 'All Sections'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest ${a.type === 'SURPRISE_TEST' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
                                                        {a.type.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        {new Date(a.createdAt).toLocaleDateString()}
                                                    </p>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button
                                                        onClick={() => handleDelete(a.id)}
                                                        className="p-3 text-gray-600 hover:text-red-500 bg-dark-300/50 hover:bg-red-500/10 rounded-xl transition-all active:scale-95"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !saving && setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-dark-200 border border-dark-border rounded-[3rem] shadow-2xl overflow-hidden"
                        >
                            <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
                                <div className="p-10 border-b border-white/5 flex items-center justify-between">
                                    <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">Provision <span className="text-primary-500">Resource</span></h2>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                                        <X size={28} />
                                    </button>
                                </div>

                                <div className="p-10 overflow-y-auto space-y-8 custom-scrollbar">
                                    {/* file upload section */}
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <div className={`p-10 rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center gap-4 ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/5 bg-dark-300/50 group-hover:border-primary-500/30 group-hover:bg-primary-500/5'}`}>
                                            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${file ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-dark-200 text-gray-600'}`}>
                                                {file ? <CheckCircle2 size={32} /> : <Upload size={32} />}
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-gray-300">{file ? file.name : 'Select Evaluation PDF'}</p>
                                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">Maximum Load: 50MB • Type: PDF Only</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Title</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="e.g., Assignment-01 Logic Gates"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full bg-dark-300 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 hover:border-white/10 transition-all placeholder:text-gray-700"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Assessment Type</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, type: 'ASSIGNMENT' })}
                                                    className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${formData.type === 'ASSIGNMENT' ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-dark-300 border-white/5 text-gray-600 hover:text-gray-300'}`}
                                                >
                                                    Assignment
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, type: 'SURPRISE_TEST' })}
                                                    className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${formData.type === 'SURPRISE_TEST' ? 'bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-dark-300 border-white/5 text-gray-600 hover:text-gray-300'}`}
                                                >
                                                    Surprise Test
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Target Parameters</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <select
                                                className="bg-dark-300 border border-white/5 rounded-2xl px-4 py-4 text-white text-[10px] font-black uppercase tracking-tight outline-none focus:border-primary-500"
                                                value={selectedCollege}
                                                onChange={(e) => setSelectedCollege(e.target.value)}
                                            >
                                                <option value="">Select College</option>
                                                {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                            <select
                                                className="bg-dark-300 border border-white/5 rounded-2xl px-4 py-4 text-white text-[10px] font-black uppercase tracking-tight outline-none focus:border-primary-500"
                                                value={selectedBranch}
                                                onChange={(e) => setSelectedBranch(e.target.value)}
                                                disabled={!selectedCollege}
                                            >
                                                <option value="">Select Branch</option>
                                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                            </select>
                                            <select
                                                className="bg-dark-300 border border-white/5 rounded-2xl px-4 py-4 text-white text-[10px] font-black uppercase tracking-tight outline-none focus:border-primary-500"
                                                value={formData.yearId}
                                                onChange={(e) => setFormData({ ...formData, yearId: e.target.value })}
                                                disabled={!selectedBranch}
                                            >
                                                <option value="">Select Year</option>
                                                {years.map(y => <option key={y.id} value={y.id}>{y.displayName}</option>)}
                                            </select>
                                            <select
                                                className="bg-dark-300 border border-white/5 rounded-2xl px-4 py-4 text-white text-[10px] font-black uppercase tracking-tight outline-none focus:border-primary-500"
                                                value={formData.semesterId}
                                                onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })}
                                                disabled={!formData.yearId}
                                            >
                                                <option value="">Select Semester</option>
                                                {semesters.map(s => <option key={s.id} value={s.id}>{s.displayName}</option>)}
                                            </select>
                                            <select
                                                className="bg-dark-300 border border-white/5 rounded-2xl px-4 py-4 text-white text-[10px] font-black uppercase tracking-tight outline-none focus:border-primary-500"
                                                value={formData.subjectId}
                                                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                                                disabled={!formData.semesterId}
                                            >
                                                <option value="">Select Subject</option>
                                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                                            </select>
                                            <input
                                                placeholder="Section (e.g. A)"
                                                value={formData.section}
                                                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                                className="bg-dark-300 border border-white/5 rounded-2xl px-4 py-4 text-white text-[10px] font-black uppercase tracking-tight outline-none focus:border-primary-500"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-4">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Submission Deadline (Optional)</label>
                                            <input
                                                type="datetime-local"
                                                value={formData.submissionDate}
                                                onChange={(e) => setFormData({ ...formData, submissionDate: e.target.value })}
                                                className="bg-dark-300 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-10 border-t border-white/5 bg-dark-300/30 flex justify-end gap-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest px-8"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center gap-3 shadow-2xl shadow-primary-500/20 active:scale-95"
                                    >
                                        {saving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                        Initialize Upload
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
