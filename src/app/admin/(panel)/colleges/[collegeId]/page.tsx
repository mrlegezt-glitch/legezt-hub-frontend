'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ArrowLeft, Loader2, Layers, Calendar, BookOpen, Plus, FolderOpen, Trash2, ListTree, Link as LinkIcon, Search, Share2, CircleDashed } from 'lucide-react';
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
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/colleges" className="p-2 -ml-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-1">
                        {college.logo && (
                            <img src={college.logo} alt={college.name} className="w-12 h-12 rounded-lg object-contain bg-white/10" />
                        )}
                        <h1 className="text-3xl font-bold text-white">{college.name}</h1>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span className="font-mono bg-dark-200 px-2 py-0.5 rounded border border-dark-border">{college.code}</span>
                        <span>•</span>
                        <span>{college.branches.length} Branches</span>
                    </div>
                </div>
                <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="btn-primary px-4 py-2 rounded-lg text-sm"
                >
                    Edit College
                </button>
            </div>

            {/* Branch Tabs & Add Year */}
            <div className="flex items-center justify-between mb-8 border-b border-dark-border pb-2">
                <div className="flex items-center gap-2 overflow-x-auto">
                    {college.branches.map((branch) => (
                        <div key={branch.id} className="relative group">
                            <button
                                onClick={() => setActiveBranch(branch.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${activeBranch === branch.id
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                                    : 'bg-dark-200 text-gray-400 hover:text-white hover:bg-dark-100'
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
                                className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                title="Delete Branch"
                            >
                                <Trash2 size={10} />
                            </button>
                        </div>
                    ))}
                </div>
                {activeBranch && (
                    <button
                        onClick={() => setIsYearModalOpen(true)}
                        className="btn-primary px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 ml-4 flex-shrink-0"
                    >
                        <Plus size={14} /> Add Year
                    </button>
                )}
            </div>

            {/* Structure Content */}
            {currentBranch && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {currentBranch.years.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 bg-dark-200 border border-dark-border rounded-xl border-dashed">
                            <div className="w-16 h-16 bg-dark-300 rounded-full flex items-center justify-center mb-4 text-gray-500">
                                <Calendar size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No Years Added</h3>
                            <p className="text-gray-400 mb-6 text-center max-w-sm">
                                This branch doesn't have any years configured yet. Add a year to start organizing semesters and subjects.
                            </p>
                            <button
                                onClick={() => setIsYearModalOpen(true)}
                                className="btn-primary px-6 py-2 rounded-lg flex items-center gap-2"
                            >
                                <Plus size={18} />
                                Create First Year
                            </button>
                        </div>
                    ) : (
                        currentBranch.years.map((year) => (
                            <div key={year.id} className="bg-dark-200 border border-dark-border rounded-xl overflow-hidden">
                                <div className="bg-dark-300 px-6 py-4 border-b border-dark-border flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                            <Calendar size={18} />
                                        </div>
                                        <h3 className="font-bold text-lg text-white">{year.displayName}</h3>
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
                                        className="text-gray-500 hover:text-red-400 transition-colors p-1"
                                        title="Delete Year"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {year.semesters.map((sem) => (
                                        <div key={sem.id} className="bg-dark-100 rounded-xl p-5 border border-dark-border hover:border-primary-500/30 transition-colors">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-bold text-gray-300 flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                                    {sem.displayName}
                                                </h4>
                                                <button
                                                    onClick={() => openAddSubjectModal(sem.id, sem.displayName)}
                                                    className="text-xs flex items-center gap-1 text-primary-400 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition-colors"
                                                >
                                                    <Plus size={12} /> Add Subject
                                                </button>
                                            </div>

                                            <div className="space-y-2">
                                                {sem.subjects.map((sub) => (
                                                    <div key={sub.id} className="flex items-center justify-between p-2 bg-dark-300 rounded-lg group hover:bg-dark-400 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <BookOpen size={16} className="text-gray-500 group-hover:text-primary-400" />
                                                            <span className="text-sm font-medium text-gray-300 group-hover:text-white">{sub.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-mono text-gray-600 group-hover:text-gray-400">{sub.code}</span>
                                                            {sub.isShared && (
                                                                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded flex items-center gap-1" title="Shared Subject">
                                                                    <Share2 size={10} /> Shared
                                                                </span>
                                                            )}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openAddSubjectModal(sem.id, sem.displayName, sub);
                                                                }}
                                                                className="text-gray-500 hover:text-primary-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                                                            >
                                                                <FolderOpen size={14} />
                                                            </button>
                                                            <button
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    if (confirm(`Delete subject "${sub.name}"?`)) {
                                                                        try {
                                                                            // Use context-aware delete endpoint
                                                                            await api.delete(`/content/semesters/${sem.id}/subjects/${sub.id}`);
                                                                            await fetchCollege();
                                                                            toast.success('Subject removed');
                                                                        } catch (err) {
                                                                            toast.error('Failed to remove subject');
                                                                        }
                                                                    }
                                                                }}
                                                                className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                                                                title="Delete Subject"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {sem.subjects.length === 0 && (
                                                    <div className="text-xs text-gray-600 italic text-center py-2">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-dark-200 border border-dark-border p-6 rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">
                                {editingSubject ? 'Edit Subject' : isBulkMode ? 'Bulk Add Subjects' : `Add Subject to ${selectedSemester.name}`}
                            </h3>
                            <div className="flex bg-dark-300 p-1 rounded-lg">
                                <button
                                    onClick={() => { setIsLinkingMode(false); setIsBulkMode(false); }}
                                    className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${!isLinkingMode && !isBulkMode ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                >
                                    New
                                </button>
                                <button
                                    onClick={() => { setIsLinkingMode(false); setIsBulkMode(true); }}
                                    className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${isBulkMode ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Bulk
                                </button>
                                <button
                                    onClick={() => { setIsLinkingMode(true); setIsBulkMode(false); }}
                                    className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${isLinkingMode ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Link Existing
                                </button>
                            </div>
                        </div>

                        {isLinkingMode ? (
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input
                                        type="text"
                                        value={linkSearchQuery}
                                        onChange={(e) => setLinkSearchQuery(e.target.value)}
                                        className="w-full bg-dark-300 border border-dark-border rounded-lg pl-9 pr-4 py-2 text-white focus:ring-2 focus:ring-primary-500 outline-none placeholder:text-gray-600"
                                        placeholder="Search subjects..."
                                        autoFocus
                                    />
                                    {isSearching && (
                                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 animate-spin" size={14} />
                                    )}
                                </div>
                                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                                    {linkSearchResults.length === 0 && linkSearchQuery.length > 1 && !isSearching ? (
                                        <p className="text-center text-gray-500 text-sm py-4">No subjects found</p>
                                    ) : (
                                        linkSearchResults.map((subject) => (
                                            <div
                                                key={subject.id}
                                                onClick={() => setSelectedLinkSubject(subject)}
                                                className={`p-3 rounded-lg cursor-pointer border transition-colors flex items-center justify-between ${selectedLinkSubject?.id === subject.id
                                                    ? 'bg-primary-500/20 border-primary-500 text-white'
                                                    : 'bg-dark-300 border-transparent hover:bg-dark-400 text-gray-300'
                                                    }`}
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{subject.name}</p>
                                                    <p className="text-xs opacity-70">{subject.code}</p>
                                                </div>
                                                {selectedLinkSubject?.id === subject.id && (
                                                    <div className="w-2 h-2 rounded-full bg-primary-500" />
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : isBulkMode ? (
                            <div className="space-y-4">
                                <p className="text-xs text-gray-500 bg-dark-300 p-2 rounded border border-dark-border">
                                    Enter one subject per line: <br />
                                    <code className="text-primary-400">Subject Name, Code</code> or just <code className="text-primary-400">Subject Name</code>
                                </p>
                                <textarea
                                    value={bulkSubjectText}
                                    onChange={(e) => setBulkSubjectText(e.target.value)}
                                    className="w-full h-48 bg-dark-300 border border-dark-border rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary-500 outline-none font-mono text-sm"
                                    placeholder="Mathematics III, MATH301&#10;Data Structures, CS202&#10;Operating Systems"
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Subject Name</label>
                                    <input
                                        type="text"
                                        value={newSubject.name}
                                        onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                                        className="w-full bg-dark-300 border border-dark-border rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                        placeholder="e.g. Data Structures"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Subject Code</label>
                                    <input
                                        type="text"
                                        value={newSubject.code}
                                        onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                                        className="w-full bg-dark-300 border border-dark-border rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                        placeholder="e.g. CS101"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingSubject(null);
                                    setIsBulkMode(false);
                                    setIsLinkingMode(false);
                                    setLinkSearchQuery('');
                                    setSelectedLinkSubject(null);
                                }}
                                className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={isBulkMode ? handleBulkAddSubjects : handleAddSubject}
                                disabled={createLoading || (isLinkingMode ? !selectedLinkSubject : isBulkMode ? !bulkSubjectText.trim() : (!newSubject.name || !newSubject.code))}
                                className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-dark-200 border border-dark-border p-6 rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-xl font-bold text-white mb-6">Add Year</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Display Name</label>
                                <input
                                    type="text"
                                    value={newYear.displayName}
                                    onChange={(e) => setNewYear({ ...newYear, displayName: e.target.value })}
                                    className="w-full bg-dark-300 border border-dark-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary-500"
                                    placeholder="e.g. First Year"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Year Number</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="6"
                                    value={newYear.yearNumber}
                                    onChange={(e) => setNewYear({ ...newYear, yearNumber: parseInt(e.target.value) })}
                                    className="w-full bg-dark-300 border border-dark-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary-500"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setIsYearModalOpen(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddYear}
                                disabled={createYearLoading || !newYear.displayName}
                                className="btn-primary px-6 py-2 rounded-lg flex items-center gap-2"
                            >
                                {createYearLoading ? <Loader2 size={16} className="animate-spin" /> : 'Create Year'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
