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
        <div className="space-y-8 max-w-7xl mx-auto pb-20 p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-dark-android border border-silver-dark/20 shadow-inner flex items-center justify-center text-silver-400">
                        <BookOpen size={24} className="drop-shadow-md" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-white drop-shadow-md">Assessment Manager</h1>
                        <p className="text-silver-500 font-bold text-[10px] uppercase tracking-widest mt-1">Manage Assignments & Materials</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-silver-gradient text-dark-android px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center gap-3 shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 border border-silver-light shrink-0"
                >
                    <Plus size={18} />
                    New Assessment
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Stats / Filter Sidebar (Optional) */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-dark-surface shadow-android-card border border-silver-dark/10 rounded-3xl p-8 space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-20 z-20" />
                        <h3 className="text-[10px] font-bold text-silver-500 tracking-widest uppercase relative z-10">Quick Stats</h3>
                        <div className="space-y-4 relative z-10">
                            <div className="bg-dark-android shadow-inner-metallic p-5 rounded-2xl border border-silver-800">
                                <span className="text-[10px] font-bold text-silver-600 uppercase tracking-widest block mb-1">Total Items</span>
                                <span className="text-3xl font-display font-bold text-white drop-shadow-md">{assessments.length}</span>
                            </div>
                            <div className="bg-dark-android shadow-inner-metallic p-5 rounded-2xl border border-silver-800">
                                <span className="text-[10px] font-bold text-silver-600 uppercase tracking-widest block mb-1">Assignments</span>
                                <span className="text-3xl font-display font-bold text-silver-300 drop-shadow-md">
                                    {assessments.filter(a => a.type === 'ASSIGNMENT').length}
                                </span>
                            </div>
                            <div className="bg-dark-android shadow-inner-metallic p-5 rounded-2xl border border-silver-800">
                                <span className="text-[10px] font-bold text-silver-600 uppercase tracking-widest block mb-1">Surprise Tests</span>
                                <span className="text-3xl font-display font-bold text-silver-400 drop-shadow-md">
                                    {assessments.filter(a => a.type === 'SURPRISE_TEST').length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Area */}
                <div className="lg:col-span-3">
                    <div className="bg-dark-surface shadow-android-card border border-silver-dark/10 rounded-3xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-20 z-20" />
                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center relative z-10">
                                <Loader2 className="animate-spin text-silver-500 mb-4" size={40} />
                                <p className="text-[10px] font-bold text-silver-500 uppercase tracking-widest">Scanning Repository...</p>
                            </div>
                        ) : assessments.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center opacity-40 relative z-10">
                                <FileText size={60} className="text-silver-600 mb-4 drop-shadow-md" />
                                <p className="text-sm font-bold text-silver-500">No assessments found.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto relative z-10">
                                <table className="w-full text-left">
                                    <thead className="bg-dark-android border-b border-silver-dark/20">
                                        <tr className="text-[10px] font-bold text-silver-500 uppercase tracking-widest">
                                            <th className="px-8 py-5">Title / Subject</th>
                                            <th className="px-8 py-5">Type</th>
                                            <th className="px-8 py-5">Post Date</th>
                                            <th className="px-8 py-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-silver-dark/5">
                                        {assessments.map((a) => (
                                            <tr key={a.id} className="group hover:bg-dark-android transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner border border-silver-dark/10 ${a.type === 'SURPRISE_TEST' ? 'bg-silver-200/5 text-silver-300' : 'bg-silver-metallic/10 text-white'}`}>
                                                            <FileText size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white group-hover:text-silver-300 transition-colors uppercase tracking-tight">{a.title}</p>
                                                            <p className="text-[10px] font-bold text-silver-500 uppercase tracking-widest mt-1">
                                                                {a.subject?.name || 'General'} • {a.section ? `Section ${a.section}` : 'All Sections'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-inner border ${a.type === 'SURPRISE_TEST' ? 'bg-dark-android text-silver-400 border-silver-dark/20' : 'bg-silver-metallic/5 text-silver-300 border-silver-metallic/20'}`}>
                                                        {a.type.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="text-[10px] font-bold text-silver-500 uppercase tracking-widest font-mono">
                                                        {new Date(a.createdAt).toLocaleDateString()}
                                                    </p>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button
                                                        onClick={() => handleDelete(a.id)}
                                                        className="p-3 text-silver-500 hover:text-red-400 bg-dark-android hover:bg-red-500/10 rounded-xl shadow-inner border border-transparent hover:border-red-500/20 transition-all active:scale-95"
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
                            className="relative w-full max-w-2xl bg-dark-surface shadow-android-card border border-silver-dark/20 rounded-3xl overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-30 z-20" />
                            <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh] relative z-10">
                                <div className="p-8 border-b border-silver-dark/10 flex items-center justify-between">
                                    <h2 className="text-2xl font-display font-bold text-white drop-shadow-md">Provision Resource</h2>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="text-silver-500 hover:text-white transition-colors bg-dark-android p-2 rounded-xl shadow-inner border border-transparent hover:border-silver-dark/30">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-8 overflow-y-auto space-y-8 scrollbar-thin scrollbar-thumb-silver-dark/30 hover:scrollbar-thumb-silver-dark/50 scrollbar-track-transparent">
                                    {/* file upload section */}
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <div className={`p-10 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center gap-4 ${file ? 'border-silver-metallic/50 bg-silver-gradient/5' : 'border-silver-dark/20 bg-dark-android shadow-inner-metallic group-hover:border-silver-400/30'}`}>
                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 border ${file ? 'bg-silver-gradient/10 text-white border-silver-metallic shadow-glow' : 'bg-dark-surface text-silver-500 shadow-android-card border-silver-dark/10'}`}>
                                                {file ? <CheckCircle2 size={32} /> : <Upload size={32} />}
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-white drop-shadow-md">{file ? file.name : 'Select Evaluation PDF'}</p>
                                                <p className="text-[10px] font-bold text-silver-600 uppercase tracking-widest mt-1">Maximum Load: 50MB • Type: PDF Only</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-bold text-silver-600 uppercase tracking-widest ml-2">Title</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="e.g., Assignment-01"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full bg-dark-android shadow-inner-metallic border border-silver-800 rounded-xl px-4 py-3.5 text-white font-bold outline-none focus:border-silver-500 transition-all placeholder-silver-600"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-bold text-silver-600 uppercase tracking-widest ml-2">Assessment Type</label>
                                            <div className="flex bg-dark-android p-1.5 rounded-xl border border-silver-800 shadow-inner">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, type: 'ASSIGNMENT' })}
                                                    className={`flex-1 text-[10px] uppercase tracking-widest font-bold py-3 pr-2 pl-2 rounded-lg transition-all ${formData.type === 'ASSIGNMENT' ? 'bg-silver-gradient text-dark-android shadow-3d' : 'text-silver-500 hover:text-white hover:bg-white/5'}`}
                                                >
                                                    Assignment
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, type: 'SURPRISE_TEST' })}
                                                    className={`flex-1 text-[10px] uppercase tracking-widest font-bold py-3 pr-2 pl-2 rounded-lg transition-all ${formData.type === 'SURPRISE_TEST' ? 'bg-silver-gradient text-dark-android shadow-3d' : 'text-silver-500 hover:text-white hover:bg-white/5'}`}
                                                >
                                                    Surp. Test
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-silver-600 uppercase tracking-widest ml-2">Target Parameters</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <div className="relative">
                                                <select
                                                    className="w-full bg-dark-android shadow-inner-metallic border border-silver-800 rounded-xl px-4 py-3 text-white text-[10px] font-bold uppercase tracking-widest appearance-none outline-none focus:border-silver-500 transition-all"
                                                    value={selectedCollege}
                                                    onChange={(e) => setSelectedCollege(e.target.value)}
                                                >
                                                    <option value="" className="text-silver-600">Select College</option>
                                                    {colleges.map(c => <option key={c.id} value={c.id} className="text-white bg-dark-surface font-bold">{c.name}</option>)}
                                                </select>
                                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-silver-500"><svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 12l-5-5 1.5-1.5L10 9l3.5-3.5L15 7l-5 5z" clipRule="evenodd" /></svg></div>
                                            </div>
                                            <div className="relative">
                                                <select
                                                    className="w-full bg-dark-android shadow-inner-metallic border border-silver-800 rounded-xl px-4 py-3 text-white text-[10px] font-bold uppercase tracking-widest appearance-none outline-none focus:border-silver-500 transition-all disabled:opacity-50"
                                                    value={selectedBranch}
                                                    onChange={(e) => setSelectedBranch(e.target.value)}
                                                    disabled={!selectedCollege}
                                                >
                                                    <option value="" className="text-silver-600">Select Branch</option>
                                                    {branches.map(b => <option key={b.id} value={b.id} className="text-white bg-dark-surface font-bold">{b.name}</option>)}
                                                </select>
                                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-silver-500"><svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 12l-5-5 1.5-1.5L10 9l3.5-3.5L15 7l-5 5z" clipRule="evenodd" /></svg></div>
                                            </div>
                                            <div className="relative">
                                                <select
                                                    className="w-full bg-dark-android shadow-inner-metallic border border-silver-800 rounded-xl px-4 py-3 text-white text-[10px] font-bold uppercase tracking-widest appearance-none outline-none focus:border-silver-500 transition-all disabled:opacity-50"
                                                    value={formData.yearId}
                                                    onChange={(e) => setFormData({ ...formData, yearId: e.target.value })}
                                                    disabled={!selectedBranch}
                                                >
                                                    <option value="" className="text-silver-600">Select Year</option>
                                                    {years.map(y => <option key={y.id} value={y.id} className="text-white bg-dark-surface font-bold">{y.displayName}</option>)}
                                                </select>
                                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-silver-500"><svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 12l-5-5 1.5-1.5L10 9l3.5-3.5L15 7l-5 5z" clipRule="evenodd" /></svg></div>
                                            </div>
                                            <div className="relative">
                                                <select
                                                    className="w-full bg-dark-android shadow-inner-metallic border border-silver-800 rounded-xl px-4 py-3 text-white text-[10px] font-bold uppercase tracking-widest appearance-none outline-none focus:border-silver-500 transition-all disabled:opacity-50"
                                                    value={formData.semesterId}
                                                    onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })}
                                                    disabled={!formData.yearId}
                                                >
                                                    <option value="" className="text-silver-600">Select Semester</option>
                                                    {semesters.map(s => <option key={s.id} value={s.id} className="text-white bg-dark-surface font-bold">{s.displayName}</option>)}
                                                </select>
                                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-silver-500"><svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 12l-5-5 1.5-1.5L10 9l3.5-3.5L15 7l-5 5z" clipRule="evenodd" /></svg></div>
                                            </div>
                                            <div className="relative">
                                                <select
                                                    className="w-full bg-dark-android shadow-inner-metallic border border-silver-800 rounded-xl px-4 py-3 text-white text-[10px] font-bold uppercase tracking-widest appearance-none outline-none focus:border-silver-500 transition-all disabled:opacity-50"
                                                    value={formData.subjectId}
                                                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                                                    disabled={!formData.semesterId}
                                                >
                                                    <option value="" className="text-silver-600">Select Sub</option>
                                                    {subjects.map(s => <option key={s.id} value={s.id} className="text-white bg-dark-surface font-bold">{s.name} ({s.code})</option>)}
                                                </select>
                                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-silver-500"><svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 12l-5-5 1.5-1.5L10 9l3.5-3.5L15 7l-5 5z" clipRule="evenodd" /></svg></div>
                                            </div>
                                            <input
                                                placeholder="Section (e.g. A)"
                                                value={formData.section}
                                                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                                className="w-full bg-dark-android shadow-inner-metallic border border-silver-800 rounded-xl px-4 py-3 text-white text-[10px] font-bold uppercase tracking-widest outline-none focus:border-silver-500 transition-all placeholder-silver-600"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-4">
                                            <label className="text-[10px] font-bold text-silver-600 uppercase tracking-widest ml-2">Submission Deadline (Optional)</label>
                                            <input
                                                type="datetime-local"
                                                value={formData.submissionDate}
                                                onChange={(e) => setFormData({ ...formData, submissionDate: e.target.value })}
                                                className="w-full bg-dark-android shadow-inner-metallic border border-silver-800 rounded-xl px-4 py-3.5 text-white font-bold font-mono outline-none focus:border-silver-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 border-t border-silver-dark/10 bg-dark-android flex justify-end gap-6 items-center">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-[10px] font-bold text-silver-500 hover:text-white uppercase tracking-widest transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="bg-silver-gradient text-dark-android px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center gap-3 shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 border border-silver-light disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
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
