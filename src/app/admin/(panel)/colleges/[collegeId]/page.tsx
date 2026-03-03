'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ArrowLeft, Loader2, Layers, Calendar, BookOpen, Plus, FolderOpen, Trash2, ListTree, Link as LinkIcon, Search, Share2, CircleDashed, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Subject { id: string; name: string; code: string; isShared?: boolean; }
interface Semester { id: string; displayName: string; subjects: Subject[]; }
interface Year { id: string; displayName: string; semesters: Semester[]; }
interface Branch { id: string; name: string; code: string; years: Year[]; }
interface College { id: string; name: string; code: string; logo?: string; branches: Branch[]; }

export default function CollegeDetailPage() {
    const { collegeId } = useParams();
    const router = useRouter();
    const [college, setCollege] = useState<College | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeBranch, setActiveBranch] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState<{ id: string, name: string } | null>(null);
    const [newSubject, setNewSubject] = useState({ name: '', code: '' });
    const [createLoading, setCreateLoading] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [bulkSubjectText, setBulkSubjectText] = useState('');

    // Linking State
    const [isLinkingMode, setIsLinkingMode] = useState(false);
    const [linkSearchQuery, setLinkSearchQuery] = useState('');
    const [linkSearchResults, setLinkSearchResults] = useState<Subject[]>([]);
    const [selectedLinkSubject, setSelectedLinkSubject] = useState<Subject | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', code: '', logo: '' });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [updateLoading, setUpdateLoading] = useState(false);

    // Branch Creation State
    const [newBranch, setNewBranch] = useState({ name: '', code: '' });
    const [createBranchLoading, setCreateBranchLoading] = useState(false);

    // Year Creation State
    const [isYearModalOpen, setIsYearModalOpen] = useState(false);
    const [newYear, setNewYear] = useState({ displayName: '', yearNumber: 1 });
    const [createYearLoading, setCreateYearLoading] = useState(false);

    // Search Effect
    useEffect(() => {
        const searchSubjects = async () => {
            if (!linkSearchQuery || linkSearchQuery.length < 2) {
                setLinkSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                // Assuming we have a global subject search endpoint or filtering existing list endpoint
                // We'll use the generic subjects list with search param
                const res = await api.get(`/content/subjects?search=${encodeURIComponent(linkSearchQuery)}`);
                setLinkSearchResults(res.data.data);
            } catch (error) {
                console.error('Search failed', error);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(searchSubjects, 500);
        return () => clearTimeout(timeoutId);
    }, [linkSearchQuery]);

    // Initialize Edit Form
    useEffect(() => {
        if (college) {
            setEditForm({ name: college.name, code: college.code, logo: college.logo || '' });
        }
    }, [college]);

    const fetchCollege = async () => {
        try {
            const res = await api.get(`/admin/colleges/${collegeId}`);
            setCollege(res.data.data);
            if (!activeBranch && res.data.data.branches.length > 0) {
                setActiveBranch(res.data.data.branches[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch college:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (collegeId) fetchCollege();
    }, [collegeId]);

    const openAddSubjectModal = (semId: string, semName: string, subject?: Subject) => {
        setSelectedSemester({ id: semId, name: semName });
        if (subject) {
            setEditingSubject(subject);
            setNewSubject({ name: subject.name, code: subject.code });
        } else {
            setEditingSubject(null);
            setNewSubject({ name: '', code: '' });
        }
        setIsModalOpen(true);
    };

    const handleAddSubject = async () => {
        if (!selectedSemester) return;
        setCreateLoading(true);
        try {
            if (editingSubject) {
                await api.patch(`/content/subjects/${editingSubject.id}`, {
                    name: newSubject.name,
                    code: newSubject.code
                });
            } else if (isLinkingMode && selectedLinkSubject) {
                // Link Subject
                await api.post('/content/subjects', {
                    semesterId: selectedSemester.id,
                    existingSubjectId: selectedLinkSubject.id
                });
            } else {
                // Create New
                await api.post('/content/subjects', {
                    semesterId: selectedSemester.id,
                    name: newSubject.name,
                    code: newSubject.code,
                });
            }

            await fetchCollege(); // Refresh data
            setIsModalOpen(false);
            setEditingSubject(null);
            setNewSubject({ name: '', code: '' });
            setIsLinkingMode(false);
            setLinkSearchQuery('');
            setSelectedLinkSubject(null);
            toast.success(editingSubject ? 'Subject updated' : isLinkingMode ? 'Subject linked' : 'Subject added');
        } catch (error) {
            console.error(error);
            toast.error(`Failed to ${editingSubject ? 'update' : 'create'} subject`);
        } finally {
            setCreateLoading(false);
        }
    };

    const handleBulkAddSubjects = async () => {
        if (!selectedSemester || !bulkSubjectText.trim()) return;
        setCreateLoading(true);
        try {
            // Logic: Split by lines. Each line can be "Subject Name, Code" or just "Subject Name"
            const lines = bulkSubjectText.split('\n').filter(line => line.trim());
            const subjectsToAdd = lines.map(line => {
                const parts = line.split(',').map(p => p.trim());
                return {
                    name: parts[0],
                    code: parts[1] || parts[0].substring(0, 3).toUpperCase() + Math.floor(Math.random() * 900 + 100),
                    semesterId: selectedSemester.id
                };
            });

            // Sequential or parallel creation
            await Promise.all(subjectsToAdd.map(sub => api.post('/content/subjects', sub)));

            await fetchCollege();
            setIsModalOpen(false);
            setIsBulkMode(false);
            setBulkSubjectText('');
            toast.success(`Success! Added ${subjectsToAdd.length} subjects.`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to add some subjects in bulk');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleUpdateCollege = async () => {
        if (!college) return;
        setUpdateLoading(true);
        try {
            let logoUrl = editForm.logo;

            // Upload new logo if selected
            if (logoFile) {
                const formData = new FormData();
                formData.append('file', logoFile);
                const uploadRes = await api.post('/admin/upload/image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                logoUrl = uploadRes.data.data.url;
            }

            await api.patch(`/admin/colleges/${college.id}`, {
                name: editForm.name,
                code: editForm.code,
                logo: logoUrl
            });

            await fetchCollege();
            setIsEditModalOpen(false);
            toast.success('College details updated');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update college');
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleAddBranch = async () => {
        if (!newBranch.name || !newBranch.code || !college) return;
        setCreateBranchLoading(true);
        try {
            await api.post('/content/branches', {
                collegeId: college.id,
                name: newBranch.name,
                code: newBranch.code
            });
            await fetchCollege();
            setNewBranch({ name: '', code: '' });
            toast.success('Branch added successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to add branch');
        } finally {
            setCreateBranchLoading(false);
        }
    };

    const handleAddYear = async () => {
        if (!activeBranch || !newYear.displayName) return;
        setCreateYearLoading(true);
        try {
            await api.post('/content/years', {
                branchId: activeBranch,
                displayName: newYear.displayName,
                yearNumber: parseInt(newYear.yearNumber.toString())
            });
            await fetchCollege();
            setIsYearModalOpen(false);
            setNewYear({ displayName: '', yearNumber: 1 });
            toast.success('Year added successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to add year');
        } finally {
            setCreateYearLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 size={32} className="animate-spin text-primary-500" />
            </div>
        );
    }

    if (!college) {
        return (
            <div className="p-8 text-center text-gray-500">
                <p>College not found.</p>
                <button onClick={() => router.back()} className="text-primary-400 mt-2 hover:underline">Go Back</button>
            </div>
        );
    }

    const currentBranch = college.branches.find(b => b.id === activeBranch);

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto pb-24">
            {/* Header */}
            <div className="flex items-start sm:items-center justify-between gap-4 mb-8 flex-col sm:flex-row">
                <div className="flex items-center gap-4">
                    <Link href="/admin/colleges" className="p-2 -ml-2 hover:bg-white/5 rounded-full text-silver-400 hover:text-white transition-colors bg-dark-android shadow-inner border border-transparent hover:border-silver-dark/20">
                        <ArrowLeft size={24} />
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-1">
                            {college.logo && (
                                <img src={college.logo} alt={college.name} className="w-14 h-14 rounded-xl object-contain bg-dark-android shadow-inner border border-silver-dark/20 p-1" />
                            )}
                            <h1 className="text-3xl font-display font-bold text-white drop-shadow-md">{college.name}</h1>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-bold text-silver-500 mt-2 tracking-wide uppercase">
                            <span className="font-mono bg-dark-android border border-silver-dark/20 shadow-inner px-2 py-1 rounded-md text-silver-300 tracking-wider">
                                {college.code}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-silver-dark/50" />
                            <span>{college.branches.length} Branches</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="bg-silver-gradient text-dark-android font-bold px-6 py-2.5 rounded-xl shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 border border-silver-light transition-all flex items-center justify-center gap-2"
                >
                    Edit College
                </button>
            </div>

            {/* Branch Tabs & Add Year */}
            <div className="flex items-center justify-between mb-8 border-b border-silver-dark/10 pb-4">
                <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2">
                    {college.branches.map((branch) => (
                        <div key={branch.id} className="relative group flex-shrink-0">
                            <button
                                onClick={() => setActiveBranch(branch.id)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${activeBranch === branch.id
                                    ? 'bg-silver-gradient border-silver-light text-dark-android shadow-3d'
                                    : 'bg-dark-surface shadow-android-card border-silver-dark/10 text-silver-400 hover:text-white hover:border-silver-dark/30 hover:bg-dark-android'
                                    }`}
                            >
                                <Layers size={16} />
                                {branch.name}
                            </button>
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (confirm('Are you sure you want to delete this branch? This action cannot be undone.')) {
                                        try {
                                            await api.delete(`/content/branches/${branch.id}`);
                                            fetchCollege();
                                        } catch (err) {
                                            alert('Failed to delete branch');
                                        }
                                    }
                                }}
                                className="absolute -top-1.5 -right-1.5 bg-dark-android text-red-500 hover:text-red-400 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all border border-silver-dark/20 shadow-inner hover:bg-red-500/10 z-10"
                                title="Delete Branch"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                </div>
                {activeBranch && (
                    <button
                        onClick={() => setIsYearModalOpen(true)}
                        className="bg-silver-gradient text-dark-android font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 ml-4 flex-shrink-0 shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 border border-silver-light transition-all"
                    >
                        <Plus size={14} /> Add Year
                    </button>
                )}
            </div>

            {/* Structure Content */}
            {currentBranch && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {currentBranch.years.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 bg-dark-android shadow-inner border border-dashed border-silver-dark/20 rounded-3xl">
                            <div className="w-20 h-20 bg-dark-surface shadow-android-card rounded-2xl flex items-center justify-center mb-6 text-silver-500 border border-silver-dark/10">
                                <Calendar size={36} className="drop-shadow-md" />
                            </div>
                            <h3 className="text-2xl font-display font-bold text-silver-300 drop-shadow-md mb-2">No Years Added</h3>
                            <p className="text-silver-500 mb-8 text-center max-w-sm font-medium">
                                This branch doesn&apos;t have any years configured yet. Add a year to start organizing semesters and subjects.
                            </p>
                            <button
                                onClick={() => setIsYearModalOpen(true)}
                                className="bg-silver-gradient text-dark-android font-bold px-8 py-3 rounded-xl shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 border border-silver-light transition-all flex items-center gap-2"
                            >
                                <Plus size={18} />
                                Create First Year
                            </button>
                        </div>
                    ) : (
                        currentBranch.years.map((year) => (
                            <div key={year.id} className="bg-dark-surface shadow-android-card border border-silver-dark/10 rounded-3xl overflow-hidden relative">
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-30 z-20" />
                                <div className="bg-dark-android px-6 py-5 border-b border-silver-dark/10 flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-dark-surface border border-silver-dark/20 shadow-inner flex items-center justify-center text-silver-400">
                                            <Calendar size={20} className="drop-shadow-md" />
                                        </div>
                                        <h3 className="font-display font-bold text-xl text-white drop-shadow-md">{year.displayName}</h3>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (confirm(`Delete year "${year.displayName}"? All semesters and subjects within this year will be removed.`)) {
                                                try {
                                                    await api.delete(`/content/years/${year.id}`);
                                                    fetchCollege();
                                                } catch (err) {
                                                    alert('Failed to delete year');
                                                }
                                            }
                                        }}
                                        className="text-silver-500 hover:text-red-400 bg-dark-surface shadow-inner hover:bg-red-500/10 p-2.5 rounded-xl border border-transparent hover:border-red-500/20 transition-all"
                                        title="Delete Year"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>

                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                    {year.semesters.map((sem) => (
                                        <div key={sem.id} className="bg-dark-android rounded-2xl p-6 border border-silver-dark/10 shadow-inner hover:border-silver-dark/30 transition-colors">
                                            <div className="flex items-center justify-between mb-5">
                                                <h4 className="font-bold text-silver-300 flex items-center gap-3">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-silver-metallic shadow-glow" />
                                                    <span className="uppercase tracking-widest">{sem.displayName}</span>
                                                </h4>
                                                <button
                                                    onClick={() => openAddSubjectModal(sem.id, sem.displayName)}
                                                    className="text-[10px] font-bold text-silver-300 bg-dark-surface shadow-android-card border border-silver-dark/20 px-3 py-1.5 rounded-lg hover:bg-silver-metallic/20 transition-colors flex items-center gap-1 uppercase tracking-wider"
                                                >
                                                    <Plus size={14} /> Subject
                                                </button>
                                            </div>

                                            <div className="space-y-3">
                                                {sem.subjects.map((sub) => (
                                                    <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-dark-surface border border-silver-dark/10 rounded-xl shadow-android-card group hover:bg-dark-android hover:border-silver-dark/30 transition-all gap-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-dark-android rounded-lg shadow-inner group-hover:bg-dark-surface transition-colors">
                                                                <BookOpen size={16} className="text-silver-500 group-hover:text-silver-300" />
                                                            </div>
                                                            <span className="text-sm font-bold text-silver-400 group-hover:text-white transition-colors">{sub.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[10px] font-mono font-bold text-silver-500 bg-dark-android border border-silver-dark/20 shadow-inner px-2 py-1 rounded tracking-widest">{sub.code}</span>
                                                            {sub.isShared && (
                                                                <span className="text-[10px] bg-dark-android border border-blue-500/20 shadow-inner text-blue-400 px-2 py-1 rounded flex items-center gap-1 font-bold uppercase tracking-widest" title="Shared Subject">
                                                                    <Share2 size={10} /> Shared
                                                                </span>
                                                            )}
                                                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        openAddSubjectModal(sem.id, sem.displayName, sub);
                                                                    }}
                                                                    className="text-silver-500 hover:text-silver-300 p-2 bg-dark-android hover:bg-dark-100/10 rounded-lg shadow-inner transition-colors"
                                                                >
                                                                    <FolderOpen size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={async (e) => {
                                                                        e.stopPropagation();
                                                                        if (confirm(`Delete subject "${sub.name}"?`)) {
                                                                            try {
                                                                                await api.delete(`/content/semesters/${sem.id}/subjects/${sub.id}`);
                                                                                await fetchCollege();
                                                                                toast.success('Subject removed');
                                                                            } catch (err) {
                                                                                toast.error('Failed to remove subject');
                                                                            }
                                                                        }
                                                                    }}
                                                                    className="text-silver-500 hover:text-red-400 p-2 bg-dark-android hover:bg-red-500/10 rounded-lg shadow-inner transition-colors border border-transparent hover:border-red-500/20"
                                                                    title="Delete Subject"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {sem.subjects.length === 0 && (
                                                    <div className="text-xs font-bold tracking-wider uppercase text-silver-600 italic text-center py-4 bg-dark-surface shadow-inner-metallic rounded-xl border border-dashed border-silver-dark/20">
                                                        No subjects yet
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
            {/* Subject Creation Modal */}
            {isModalOpen && selectedSemester && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                    <div className="bg-dark-surface shadow-android-card border border-silver-dark/20 p-8 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-30 z-20" />
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <h3 className="text-2xl font-display font-bold text-white drop-shadow-md">
                                {editingSubject ? 'Edit Subject' : isBulkMode ? 'Bulk Add Subjects' : `Add Subject to ${selectedSemester.name}`}
                            </h3>
                            <div className="flex bg-dark-android p-1.5 rounded-xl border border-silver-dark/10 shadow-inner">
                                <button
                                    onClick={() => { setIsLinkingMode(false); setIsBulkMode(false); }}
                                    className={`flex-1 text-[10px] uppercase tracking-widest font-bold py-2 px-3 rounded-lg transition-all ${!isLinkingMode && !isBulkMode ? 'bg-silver-gradient text-dark-android shadow-3d' : 'text-silver-500 hover:text-white hover:bg-white/5'}`}
                                >
                                    New
                                </button>
                                <button
                                    onClick={() => { setIsLinkingMode(false); setIsBulkMode(true); }}
                                    className={`flex-1 text-[10px] uppercase tracking-widest font-bold py-2 px-3 rounded-lg transition-all ${isBulkMode ? 'bg-silver-gradient text-dark-android shadow-3d' : 'text-silver-500 hover:text-white hover:bg-white/5'}`}
                                >
                                    Bulk
                                </button>
                                <button
                                    onClick={() => { setIsLinkingMode(true); setIsBulkMode(false); }}
                                    className={`flex-1 text-[10px] uppercase tracking-widest font-bold py-2 px-3 rounded-lg transition-all ${isLinkingMode ? 'bg-silver-gradient text-dark-android shadow-3d' : 'text-silver-500 hover:text-white hover:bg-white/5'}`}
                                >
                                    Link Existing
                                </button>
                            </div>
                        </div>

                        {isLinkingMode ? (
                            <div className="space-y-4 relative z-10">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-silver-500" size={18} />
                                    <input
                                        type="text"
                                        value={linkSearchQuery}
                                        onChange={(e) => setLinkSearchQuery(e.target.value)}
                                        className="w-full bg-dark-android border border-silver-800 rounded-xl pl-11 pr-4 py-3 text-white font-bold shadow-inner-metallic outline-none focus:border-silver-500 transition-all placeholder-silver-600"
                                        placeholder="Search subjects..."
                                        autoFocus
                                    />
                                    {isSearching && (
                                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-silver-500 animate-spin" size={16} />
                                    )}
                                </div>
                                <div className="max-h-60 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-silver-dark/30 hover:scrollbar-thumb-silver-dark/50 scrollbar-track-transparent">
                                    {linkSearchResults.length === 0 && linkSearchQuery.length > 1 && !isSearching ? (
                                        <p className="text-center text-silver-500 text-sm py-4 font-medium">No subjects found</p>
                                    ) : (
                                        linkSearchResults.map((subject) => (
                                            <div
                                                key={subject.id}
                                                onClick={() => setSelectedLinkSubject(subject)}
                                                className={`p-4 rounded-xl cursor-pointer border transition-all flex items-center justify-between ${selectedLinkSubject?.id === subject.id
                                                    ? 'bg-silver-metallic/10 border-silver-metallic shadow-glow text-white'
                                                    : 'bg-dark-android border-silver-dark/10 shadow-inner hover:bg-dark-surface hover:border-silver-dark/30 text-silver-300'
                                                    }`}
                                            >
                                                <div className="flex-1">
                                                    <p className="font-bold text-sm">{subject.name}</p>
                                                    <p className="text-xs font-mono font-bold text-silver-500 mt-1 uppercase tracking-widest">{subject.code}</p>
                                                </div>
                                                {selectedLinkSubject?.id === subject.id && (
                                                    <div className="w-2.5 h-2.5 rounded-full bg-silver-metallic shadow-glow" />
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : isBulkMode ? (
                            <div className="space-y-4 relative z-10">
                                <p className="text-xs font-bold tracking-wide text-silver-500 bg-dark-android p-3 rounded-xl border border-silver-dark/10 shadow-inner leading-relaxed">
                                    Enter one subject per line: <br />
                                    <code className="text-silver-300 font-mono tracking-wider bg-dark-surface px-1.5 py-0.5 rounded ml-1 border border-silver-dark/20 text-[11px] shadow-sm">Subject Name, Code</code> or just <code className="text-silver-300 font-mono tracking-wider bg-dark-surface px-1.5 py-0.5 rounded ml-1 border border-silver-dark/20 text-[11px] shadow-sm">Subject Name</code>
                                </p>
                                <textarea
                                    value={bulkSubjectText}
                                    onChange={(e) => setBulkSubjectText(e.target.value)}
                                    className="w-full h-48 bg-dark-android shadow-inner-metallic border border-silver-800 rounded-xl px-4 py-3 text-white font-bold focus:border-silver-500 outline-none font-mono text-sm resize-none transition-all placeholder-silver-700"
                                    placeholder="Mathematics III, MATH301&#10;Data Structures, CS202&#10;Operating Systems"
                                />
                            </div>
                        ) : (
                            <div className="space-y-5 relative z-10">
                                <div>
                                    <label className="block text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 ml-2">Subject Name</label>
                                    <input
                                        type="text"
                                        value={newSubject.name}
                                        onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                                        className="w-full bg-dark-android shadow-inner-metallic border border-silver-800 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-silver-500 transition-all placeholder-silver-600"
                                        placeholder="e.g. Data Structures"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 ml-2">Subject Code</label>
                                    <input
                                        type="text"
                                        value={newSubject.code}
                                        onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                                        className="w-full bg-dark-android shadow-inner-metallic border border-silver-800 rounded-xl px-4 py-3 text-white font-bold font-mono tracking-wider outline-none focus:border-silver-500 transition-all placeholder-silver-600"
                                        placeholder="e.g. CS101"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-8 relative z-10">
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingSubject(null);
                                    setIsBulkMode(false);
                                    setIsLinkingMode(false);
                                    setLinkSearchQuery('');
                                    setSelectedLinkSubject(null);
                                }}
                                className="px-6 py-3 text-sm font-bold text-silver-400 hover:text-white rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={isBulkMode ? handleBulkAddSubjects : handleAddSubject}
                                disabled={createLoading || (isLinkingMode ? !selectedLinkSubject : isBulkMode ? !bulkSubjectText.trim() : (!newSubject.name || !newSubject.code))}
                                className="bg-silver-gradient text-dark-android font-bold px-6 py-3 rounded-xl shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 border border-silver-light transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
                            >
                                {createLoading ? <Loader2 size={18} className="animate-spin" /> : isLinkingMode ? <LinkIcon size={18} /> : isBulkMode ? <ListTree size={18} /> : editingSubject ? <FolderOpen size={18} /> : <Plus size={18} />}
                                {editingSubject ? 'Update Subject' : isLinkingMode ? 'Link Subject' : isBulkMode ? 'Add Subjects' : 'Create Subject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit College Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-dark-200 border border-dark-border p-6 rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-xl font-bold text-white mb-6">Edit College Details</h3>

                        <div className="space-y-4">
                            {/* Logo Upload */}
                            <div className="flex flex-col items-center gap-3 mb-6">
                                <div className="w-24 h-24 rounded-full bg-dark-300 border-2 border-dashed border-dark-border flex items-center justify-center overflow-hidden relative group">
                                    {(logoFile ? URL.createObjectURL(logoFile) : editForm.logo) ? (
                                        <img
                                            src={logoFile ? URL.createObjectURL(logoFile) : editForm.logo}
                                            className="w-full h-full object-cover"
                                            alt="Logo Preview"
                                        />
                                    ) : (
                                        <span className="text-gray-500 text-xs">No Logo</span>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                                    />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <span className="text-xs text-white">Change</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400">Click to upload new logo</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">College Name</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full bg-dark-300 border border-dark-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Code</label>
                                <input
                                    type="text"
                                    value={editForm.code}
                                    onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                                    className="w-full bg-dark-300 border border-dark-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary-500"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-dark-border">
                            <h4 className="text-sm font-bold text-white mb-3">Add Branch</h4>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Branch Name</label>
                                    <input
                                        type="text"
                                        value={newBranch.name}
                                        onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                                        className="w-full bg-dark-300 border border-dark-border rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary-500"
                                        placeholder="Computer Science"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Code</label>
                                    <input
                                        type="text"
                                        value={newBranch.code}
                                        onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value })}
                                        className="w-full bg-dark-300 border border-dark-border rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary-500"
                                        placeholder="CSE"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={handleAddBranch}
                                    disabled={!newBranch.name || !newBranch.code || createBranchLoading}
                                    className="text-xs bg-dark-300 hover:bg-dark-100 text-primary-400 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                                >
                                    {createBranchLoading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                                    Add Branch
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <button
                            onClick={() => setIsEditModalOpen(false)}
                            className="px-4 py-2 text-gray-400 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpdateCollege}
                            disabled={updateLoading}
                            className="btn-primary px-6 py-2 rounded-lg flex items-center gap-2"
                        >
                            {updateLoading ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
                        </button>
                    </div>
                </div>
            )}

            {/* Add Year Modal */}
            {isYearModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                    <div className="bg-dark-surface shadow-android-card border border-silver-dark/20 p-8 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-30 z-20" />
                        <h3 className="text-2xl font-display font-bold text-white mb-8 drop-shadow-md relative z-10">Add Year</h3>
                        <div className="space-y-5 relative z-10">
                            <div>
                                <label className="block text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 ml-2">Display Name</label>
                                <input
                                    type="text"
                                    value={newYear.displayName}
                                    onChange={(e) => setNewYear({ ...newYear, displayName: e.target.value })}
                                    className="w-full bg-dark-android shadow-inner-metallic border border-silver-800 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-silver-500 transition-all placeholder-silver-600"
                                    placeholder="e.g. First Year"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 ml-2">Year Number</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="6"
                                    value={newYear.yearNumber}
                                    onChange={(e) => setNewYear({ ...newYear, yearNumber: parseInt(e.target.value) })}
                                    className="w-full bg-dark-android shadow-inner-metallic border border-silver-800 rounded-xl px-4 py-3 text-white font-bold font-mono tracking-wider outline-none focus:border-silver-500 transition-all placeholder-silver-600"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-8 relative z-10">
                            <button
                                onClick={() => setIsYearModalOpen(false)}
                                className="px-6 py-3 text-sm font-bold text-silver-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddYear}
                                disabled={createYearLoading || !newYear.displayName}
                                className="bg-silver-gradient text-dark-android font-bold px-6 py-3 rounded-xl shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 border border-silver-light transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
                            >
                                {createYearLoading ? <Loader2 size={18} className="animate-spin" /> : 'Create Year'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
