'use client';

import { useState, useEffect } from 'react';
import { api, pdfApi } from '@/lib/api';
import {
    FileText, Upload, Plus, Folder, Loader2, X, ChevronRight,
    School, BookOpen, Layers, Calendar, Edit2, Trash2, Check, X as XIcon, Info, Scan, Wand2, Eye, Download
} from 'lucide-react';
import { toast } from 'sonner';
import { PDFCreatorModal } from '@/components/admin/PDFCreator';

// Types
interface College { id: string; name: string; }
interface Branch { id: string; name: string; }
interface Year { id: string; displayName: string; }
interface Semester { id: string; displayName: string; }
interface Subject { id: string; name: string; code: string; }
interface Folder { id: string; name: string; }
interface PDF {
    id: string;
    title: string;
    fileName: string;
    sizeFormatted: string;
    downloadCount: number;
    viewCount: number;
    thumbnailUrl?: string | null;
    createdAt: string;
    folder?: {
        id: string;
        name: string;
        subject?: {
            name: string;
            semester?: {
                displayName: string;
                year?: {
                    displayName: string;
                    branch?: {
                        name: string;
                        college?: { name: string; }
                    }
                }
            }
        }
    }
}

export default function PDFsPage() {
    const [pdfs, setPdfs] = useState<PDF[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [showPDFCreator, setShowPDFCreator] = useState(false);

    // Filter/Selection States
    const [colleges, setColleges] = useState<College[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [years, setYears] = useState<Year[]>([]);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);

    const [selectedCollege, setSelectedCollege] = useState<string>('');
    const [selectedBranch, setSelectedBranch] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [selectedSemester, setSelectedSemester] = useState<string>('');
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [selectedFolder, setSelectedFolder] = useState<string>('');

    // File Upload State
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [notifyUsers, setNotifyUsers] = useState(true);
    const [isBacklog, setIsBacklog] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Edit State
    const [editingPdf, setEditingPdf] = useState<PDF | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [updating, setUpdating] = useState(false);

    // Content Edit State (Magic Wand)
    const [editingContentPdf, setEditingContentPdf] = useState<PDF | null>(null);
    const [initialEditFile, setInitialEditFile] = useState<File | undefined>(undefined);
    const [isPreparingEdit, setIsPreparingEdit] = useState(false);

    // Location Popup State
    const [locationPopupPdf, setLocationPopupPdf] = useState<PDF | null>(null);
    const [isRenamingLocationFolder, setIsRenamingLocationFolder] = useState(false);
    const [newLocationFolderName, setNewLocationFolderName] = useState('');

    // Folder Creation/Edit State (for Upload Modal)
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [isRenamingFolder, setIsRenamingFolder] = useState(false);
    const [renameFolderName, setRenameFolderName] = useState('');

    // Initial Data Fetch
    useEffect(() => {
        fetchPDFs();
        fetchColleges();
    }, []);

    const fetchPDFs = async () => {
        try {
            const res = await api.get('/pdfs?limit=20');
            setPdfs(res.data.data);
        } catch (error) {
            console.error('Failed to fetch PDFs', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchColleges = async () => {
        try {
            const res = await api.get('/content/colleges');
            setColleges(res.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    // Cascading Fetches
    useEffect(() => {
        if (!selectedCollege) { setBranches([]); return; }
        const fetchBranches = async () => {
            const res = await api.get(`/content/colleges/${selectedCollege}/branches`);
            setBranches(res.data.data);
        };
        fetchBranches();
        setSelectedBranch('');
    }, [selectedCollege]);

    useEffect(() => {
        if (!selectedBranch) { setYears([]); return; }
        const fetchYears = async () => {
            const res = await api.get(`/content/branches/${selectedBranch}/years`);
            setYears(res.data.data);
        };
        fetchYears();
        setSelectedYear('');
    }, [selectedBranch]);

    useEffect(() => {
        if (!selectedYear) { setSemesters([]); return; }
        const fetchSemesters = async () => {
            const res = await api.get(`/content/years/${selectedYear}/semesters`);
            setSemesters(res.data.data);
        };
        fetchSemesters();
        setSelectedSemester('');
    }, [selectedYear]);

    useEffect(() => {
        if (!selectedSemester) { setSubjects([]); return; }
        const fetchSubjects = async () => {
            const res = await api.get(`/content/semesters/${selectedSemester}/subjects`);
            setSubjects(res.data.data);
        };
        fetchSubjects();
        setSelectedSubject('');
    }, [selectedSemester]);

    useEffect(() => {
        if (!selectedSubject) { setFolders([]); return; }
        fetchFolders();
        setSelectedFolder('');
    }, [selectedSubject]);

    const fetchFolders = async () => {
        const res = await pdfApi.getFolders({ subjectId: selectedSubject });
        setFolders(res.data.data);
    };

    const handleCreateFolder = async () => {
        if (!newFolderName || !selectedSubject) return;
        try {
            const res = await api.post('/pdfs/folders', {
                name: newFolderName,
                subjectId: selectedSubject
            });
            setFolders([...folders, res.data.data]);
            setSelectedFolder(res.data.data.id);
            setNewFolderName('');
            setIsCreatingFolder(false);
            toast.success('Folder created');
        } catch (error) {
            toast.error('Failed to create folder');
        }
    };

    const handleRenameFolder = async () => {
        if (!selectedFolder || !renameFolderName) return;
        try {
            await pdfApi.updateFolder(selectedFolder, renameFolderName);
            setFolders(folders.map(f => f.id === selectedFolder ? { ...f, name: renameFolderName } : f));
            setIsRenamingFolder(false);
            setRenameFolderName('');
            toast.success('Folder renamed');
        } catch (error) {
            toast.error('Failed to rename folder');
        }
    };

    const handleDeleteFolder = async () => {
        if (!selectedFolder) return;
        if (!confirm('Are you sure you want to delete this folder?')) return;

        try {
            await api.delete(`/pdfs/folders/${selectedFolder}`);
            setFolders(folders.filter(f => f.id !== selectedFolder));
            setSelectedFolder('');
            toast.success('Folder deleted');
        } catch (error) {
            toast.error('Failed to delete folder');
        }
    };

    const handleUpload = async () => {
        if (!file || !selectedFolder || !title) {
            toast.error('Please fill all required fields');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('folderId', selectedFolder);
        formData.append('notify', notifyUsers.toString());
        formData.append('isBacklog', isBacklog.toString());
        if (description) formData.append('description', description);

        try {
            await api.post('/pdfs', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('PDF Uploaded Successfully');
            setIsUploadModalOpen(false);
            fetchPDFs(); // Refresh list
            // Reset form
            setFile(null);
            setTitle('');
            setDescription('');
            setNotifyUsers(true);
            setIsBacklog(false);
        } catch (error) {
            console.error(error);
            toast.error('Upload Failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this PDF?')) return;
        try {
            await api.delete(`/pdfs/${id}`);
            toast.success('PDF deleted successfully');
            fetchPDFs();
        } catch (error) {
            toast.error('Failed to delete PDF');
        }
    };

    const openEditModal = (pdf: PDF) => {
        setEditingPdf(pdf);
        setEditTitle(pdf.title);
    };

    const handleUpdate = async () => {
        if (!editingPdf || !editTitle) return;
        setUpdating(true);
        try {
            await api.patch(`/pdfs/${editingPdf.id}`, { title: editTitle });
            toast.success('PDF updated successfully');
            setEditingPdf(null);
            fetchPDFs();
        } catch (error) {
            toast.error('Failed to update PDF');
        } finally {
            setUpdating(false);
        }
    };

    // Advanced Content Editing Handlers
    const handleEditContent = async (pdf: PDF) => {
        setIsPreparingEdit(true);
        try {
            // 1. Get Download URL
            const res = await api.get(`/pdfs/${pdf.id}/download`);
            const url = res.data.data.url;

            // 2. Fetch Blob
            const blobRes = await fetch(url);
            const blob = await blobRes.blob();

            // 3. Convert to File
            const file = new File([blob], pdf.fileName || 'document.pdf', { type: 'application/pdf' });

            // 4. Open Editor
            setInitialEditFile(file);
            setEditingContentPdf(pdf);
        } catch (error) {
            console.error(error);
            toast.error('Failed to prepare PDF for editing');
        } finally {
            setIsPreparingEdit(false);
        }
    };

    const handleContentUpdate = async (file: File) => {
        if (!editingContentPdf) return;

        const loadingToast = toast.loading('Updating PDF content...');
        try {
            const formData = new FormData();
            formData.append('file', file);

            await api.patch(`/pdfs/${editingContentPdf.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.dismiss(loadingToast);
            toast.success('PDF Content Updated Successfully!');
            setEditingContentPdf(null);
            setInitialEditFile(undefined);
            fetchPDFs(); // Refresh to update size/etc
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('Failed to update PDF content');
        }
    };

    // Location Popup Logic
    const openLocationPopup = (pdf: PDF) => {
        setLocationPopupPdf(pdf);
        setNewLocationFolderName(pdf.folder?.name || '');
        setIsRenamingLocationFolder(false);
    };

    const handleRenameLocationFolder = async () => {
        if (!locationPopupPdf?.folder?.id || !newLocationFolderName) return;
        try {
            await pdfApi.updateFolder(locationPopupPdf.folder.id, newLocationFolderName);
            // Optimistically update the UI
            setPdfs(pdfs.map(p =>
                p.folder?.id === locationPopupPdf.folder?.id
                    ? { ...p, folder: { ...p.folder!, name: newLocationFolderName } }
                    : p
            ));
            setLocationPopupPdf(prev => prev ? ({ ...prev, folder: { ...prev.folder!, name: newLocationFolderName } }) : null);
            setIsRenamingLocationFolder(false);
            toast.success('Folder renamed successfully');
        } catch (error) {
            toast.error('Failed to rename folder');
        }
    };


    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen pb-24 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-dark-android border border-silver-dark/20 shadow-inner flex items-center justify-center text-silver-400 group">
                        <FileText size={28} className="drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-white drop-shadow-md">PDF Management</h1>
                        <p className="text-[10px] font-bold text-silver-500 uppercase tracking-widest mt-1">Manage study resources</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-silver-gradient text-dark-android font-bold uppercase tracking-widest text-[10px] w-full md:w-auto px-6 py-3.5 rounded-xl shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 border border-silver-light transition-all flex items-center justify-center gap-3 shrink-0"
                >
                    <Upload size={18} />
                    Upload PDF
                </button>
            </div>

            {/* Recent Uploads Table & Mobile Cards */}
            <div className="bg-dark-surface shadow-android-card border border-silver-dark/10 rounded-3xl overflow-hidden relative mb-8">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-20 z-20" />
                <div className="px-8 py-6 border-b border-silver-dark/20 bg-dark-android relative z-10">
                    <h3 className="font-display font-bold text-white drop-shadow-md text-lg">Recent Uploads</h3>
                </div>
                {loading ? (
                    <div className="p-20 text-center relative z-10">
                        <Loader2 className="animate-spin text-silver-500 mx-auto drop-shadow-md" size={40} />
                        <p className="text-[10px] font-bold text-silver-500 uppercase tracking-widest mt-4">Scanning Records...</p>
                    </div>
                ) : pdfs.length === 0 ? (
                    <div className="p-20 text-center opacity-40 relative z-10">
                        <FileText className="text-silver-600 mx-auto drop-shadow-md mb-4" size={60} />
                        <p className="text-sm font-bold text-silver-500">No PDFs found. Upload one to get started.</p>
                    </div>
                ) : (
                    <div className="relative z-10">
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left min-w-[800px]">
                                <thead className="bg-dark-android border-b border-silver-dark/10">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold text-silver-500 uppercase tracking-widest leading-loose">Title</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-silver-500 uppercase tracking-widest leading-loose">Location</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-silver-500 uppercase tracking-widest leading-loose">Size</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-silver-500 uppercase tracking-widest leading-loose">Downloads</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-silver-500 uppercase tracking-widest leading-loose">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-silver-500 uppercase tracking-widest leading-loose text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-silver-dark/10">
                                    {pdfs.map((pdf) => {
                                        const folderName = pdf.folder?.name || 'Unknown';
                                        return (
                                            <tr key={pdf.id} className="hover:bg-dark-android/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {/* Thumbnail with overlay */}
                                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center flex-shrink-0 relative overflow-hidden transition-all group-hover:shadow-glow border border-white/10 shadow-inner">
                                                            {pdf.thumbnailUrl ? (
                                                                <img src={pdf.thumbnailUrl} alt={pdf.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                            ) : (
                                                                <FileText size={20} className="drop-shadow-md" />
                                                            )}
                                                            {/* View Count Badge */}
                                                            <div className="absolute top-0 right-0 bg-dark-android/80 px-1 py-0.5 rounded-bl shadow-inner text-[8px] font-bold text-silver-300 flex items-center gap-[2px] backdrop-blur-sm">
                                                                <Eye size={8} /> {pdf.viewCount}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white group-hover:text-silver-300 transition-colors">{pdf.title}</div>
                                                            <div className="text-xs text-silver-500 truncate max-w-[200px] font-medium mt-0.5">{pdf.fileName}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-2 text-silver-300 font-bold bg-dark-android px-3 py-1.5 rounded-lg border border-silver-dark/20 shadow-inner">
                                                            <Folder size={14} className="text-silver-500" />
                                                            {folderName}
                                                        </div>
                                                        <button
                                                            onClick={() => openLocationPopup(pdf)}
                                                            className="p-1.5 text-silver-500 hover:text-white bg-dark-android hover:bg-silver-dark/20 border border-transparent hover:border-silver-dark/30 rounded-lg shadow-inner transition-all"
                                                        >
                                                            <Info size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-silver-400 font-medium text-sm">{pdf.sizeFormatted}</td>
                                                <td className="px-6 py-4 text-silver-400 font-bold text-sm bg-dark-android/30">{pdf.downloadCount}</td>
                                                <td className="px-6 py-4 text-silver-500 font-medium text-sm">
                                                    {new Date(pdf.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => openEditModal(pdf)}
                                                            className="p-2 text-silver-400 hover:text-white bg-dark-android border border-transparent hover:border-silver-dark/20 shadow-inner rounded-xl transition-all"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditContent(pdf)}
                                                            className="p-2 text-silver-400 hover:text-purple-400 bg-dark-android border border-transparent hover:border-purple-500/20 shadow-inner rounded-xl transition-all"
                                                            title="Edit Content (Magic Wand)"
                                                        >
                                                            {isPreparingEdit && editingContentPdf?.id === pdf.id ? (
                                                                <Loader2 size={16} className="animate-spin text-purple-400" />
                                                            ) : (
                                                                <Wand2 size={16} />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(pdf.id)}
                                                            className="p-2 text-silver-400 hover:text-red-400 bg-dark-android border border-transparent hover:border-red-500/20 shadow-inner rounded-xl transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-silver-dark/10">
                            {pdfs.map((pdf) => {
                                const folderName = pdf.folder?.name || 'Unknown';
                                return (
                                    <div key={pdf.id} className="p-5 space-y-4 hover:bg-dark-android/30 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                {/* Thumbnail with overlay */}
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center flex-shrink-0 relative overflow-hidden border border-white/10 shadow-inner">
                                                    {pdf.thumbnailUrl ? (
                                                        <img src={pdf.thumbnailUrl} alt={pdf.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <FileText size={20} className="drop-shadow-md" />
                                                    )}
                                                    {/* Mobile Badge */}
                                                    <div className="absolute top-0 right-0 bg-dark-android/80 px-1 py-0.5 rounded-bl shadow-inner text-[8px] font-bold text-silver-300 flex items-center gap-[2px] backdrop-blur-sm">
                                                        <Eye size={8} /> {pdf.viewCount}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white line-clamp-1 drop-shadow-md">{pdf.title}</div>
                                                    <div className="text-xs text-silver-500 truncate max-w-[200px] font-medium mt-0.5">{pdf.fileName}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => openEditModal(pdf)}
                                                    className="p-2 text-silver-400 hover:text-white bg-dark-android border border-transparent hover:border-silver-dark/20 shadow-inner rounded-xl transition-all"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(pdf.id)}
                                                    className="p-2 text-silver-400 hover:text-red-400 bg-dark-android border border-transparent hover:border-red-500/20 shadow-inner rounded-xl transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEditContent(pdf)}
                                                    className="p-2 text-silver-400 hover:text-purple-400 bg-dark-android border border-transparent hover:border-purple-500/20 shadow-inner rounded-xl transition-all"
                                                >
                                                    {isPreparingEdit && editingContentPdf?.id === pdf.id ? (
                                                        <Loader2 size={16} className="animate-spin text-purple-400" />
                                                    ) : (
                                                        <Wand2 size={16} />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-silver-300 font-bold bg-dark-android p-3 rounded-xl border border-silver-dark/20 shadow-inner">
                                            <Folder size={16} className="text-silver-500" />
                                            <span className="truncate flex-1">{folderName}</span>
                                            <button
                                                onClick={() => openLocationPopup(pdf)}
                                                className="text-silver-400 hover:text-white transition-colors"
                                            >
                                                <Info size={16} />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between text-[11px] font-bold text-silver-500 px-1 uppercase tracking-wider">
                                            <span>{pdf.sizeFormatted}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center gap-1"><Eye size={12} /> {pdf.viewCount}</span>
                                                <span className="flex items-center gap-1 text-silver-400"><Download size={12} /> {pdf.downloadCount}</span>
                                                <span>{new Date(pdf.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-0 md:p-4">
                    <div className="bg-dark-surface shadow-android-card border-none md:border md:border-silver-dark/20 md:rounded-3xl w-full h-full md:h-auto md:max-w-2xl md:max-h-[90vh] flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-30 z-20" />
                        <div className="flex-shrink-0 bg-dark-android p-6 border-b border-silver-dark/20 flex items-center justify-between z-10 sticky top-0">
                            <h2 className="text-xl font-display font-bold text-white drop-shadow-md">Upload New PDF</h2>
                            <button onClick={() => setIsUploadModalOpen(false)} className="p-2 text-silver-400 hover:text-white bg-dark-surface hover:bg-silver-dark/20 rounded-xl transition-all active:scale-95 shadow-inner">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-dark-surface">
                            {/* Hierarchy Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-silver-600 uppercase tracking-widest block ml-2">College</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-dark-android border border-silver-800 rounded-xl py-3 px-4 outline-none focus:border-silver-500 text-white font-bold text-xs uppercase tracking-widest shadow-inner-metallic appearance-none"
                                            value={selectedCollege}
                                            onChange={(e) => setSelectedCollege(e.target.value)}
                                        >
                                            <option value="">Select College</option>
                                            {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-silver-500"><svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 12l-5-5 1.5-1.5L10 9l3.5-3.5L15 7l-5 5z" clipRule="evenodd" /></svg></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-silver-600 uppercase tracking-widest block ml-2">Branch</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-dark-android border border-silver-800 rounded-xl py-3 px-4 outline-none focus:border-silver-500 text-white font-bold text-xs uppercase tracking-widest shadow-inner-metallic appearance-none disabled:opacity-50"
                                            value={selectedBranch}
                                            onChange={(e) => setSelectedBranch(e.target.value)}
                                            disabled={!selectedCollege}
                                        >
                                            <option value="">Select Branch</option>
                                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-silver-500"><svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 12l-5-5 1.5-1.5L10 9l3.5-3.5L15 7l-5 5z" clipRule="evenodd" /></svg></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-silver-600 uppercase tracking-widest block ml-2">Year</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-dark-android border border-silver-800 rounded-xl py-3 px-4 outline-none focus:border-silver-500 text-white font-bold text-xs uppercase tracking-widest shadow-inner-metallic appearance-none disabled:opacity-50"
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(e.target.value)}
                                            disabled={!selectedBranch}
                                        >
                                            <option value="">Select Year</option>
                                            {years.map(y => <option key={y.id} value={y.id}>{y.displayName}</option>)}
                                        </select>
                                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-silver-500"><svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 12l-5-5 1.5-1.5L10 9l3.5-3.5L15 7l-5 5z" clipRule="evenodd" /></svg></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-silver-600 uppercase tracking-widest block ml-2">Semester</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-dark-android border border-silver-800 rounded-xl py-3 px-4 outline-none focus:border-silver-500 text-white font-bold text-xs uppercase tracking-widest shadow-inner-metallic appearance-none disabled:opacity-50"
                                            value={selectedSemester}
                                            onChange={(e) => setSelectedSemester(e.target.value)}
                                            disabled={!selectedYear}
                                        >
                                            <option value="">Select Semester</option>
                                            {semesters.map(s => <option key={s.id} value={s.id}>{s.displayName}</option>)}
                                        </select>
                                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-silver-500"><svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 12l-5-5 1.5-1.5L10 9l3.5-3.5L15 7l-5 5z" clipRule="evenodd" /></svg></div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 relative z-0">
                                <label className="text-[10px] font-bold text-silver-600 uppercase tracking-widest block ml-2">Subject</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-dark-android border border-silver-800 rounded-xl py-3 px-4 outline-none focus:border-silver-500 text-white font-bold text-xs uppercase tracking-widest shadow-inner-metallic appearance-none disabled:opacity-50"
                                        value={selectedSubject}
                                        onChange={(e) => setSelectedSubject(e.target.value)}
                                        disabled={!selectedSemester}
                                    >
                                        <option value="">Select Subject</option>
                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                                    </select>
                                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-silver-500"><svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 12l-5-5 1.5-1.5L10 9l3.5-3.5L15 7l-5 5z" clipRule="evenodd" /></svg></div>
                                </div>
                            </div>

                            {/* Folder Selection & Management */}
                            {selectedSubject && (
                                <div className="space-y-3 p-5 bg-dark-android rounded-2xl border border-silver-dark/20 shadow-inner-metallic relative z-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <label className="text-sm font-bold text-white flex items-center gap-2 drop-shadow-md">
                                            <Folder size={18} className="text-silver-400" />
                                            Target Folder
                                        </label>
                                        {!isCreatingFolder && !isRenamingFolder && (
                                            <button
                                                onClick={() => setIsCreatingFolder(true)}
                                                className="text-[10px] font-bold tracking-widest uppercase text-silver-400 hover:text-white flex items-center gap-1.5 self-start sm:self-auto transition-colors"
                                            >
                                                <Plus size={14} /> New Folder
                                            </button>
                                        )}
                                    </div>

                                    {isCreatingFolder ? (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newFolderName}
                                                onChange={(e) => setNewFolderName(e.target.value)}
                                                placeholder="Folder Name (e.g. Unit 1)"
                                                className="flex-1 bg-dark-surface border border-silver-dark/30 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-inner outline-none focus:border-silver-400 transition-colors"
                                            />
                                            <button
                                                onClick={handleCreateFolder}
                                                className="px-5 py-2.5 bg-silver-gradient text-dark-android rounded-xl text-xs font-bold uppercase tracking-widest shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 transition-all"
                                            >
                                                Create
                                            </button>
                                            <button
                                                onClick={() => setIsCreatingFolder(false)}
                                                className="px-5 py-2.5 bg-dark-surface border border-silver-dark/30 text-silver-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-inner"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : isRenamingFolder ? (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={renameFolderName}
                                                onChange={(e) => setRenameFolderName(e.target.value)}
                                                placeholder="Rename folder..."
                                                className="flex-1 bg-dark-surface border border-silver-dark/30 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-inner outline-none focus:border-silver-400 transition-colors"
                                            />
                                            <button
                                                onClick={handleRenameFolder}
                                                className="px-5 py-2.5 bg-silver-gradient text-dark-android rounded-xl text-xs font-bold uppercase tracking-widest shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 transition-all"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setIsRenamingFolder(false)}
                                                className="px-5 py-2.5 bg-dark-surface border border-silver-dark/30 text-silver-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-inner"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 relative">
                                            <select
                                                className="flex-1 bg-dark-surface border border-silver-dark/30 rounded-xl px-4 py-3 text-white font-bold text-sm shadow-inner outline-none focus:border-silver-500 appearance-none transition-colors disabled:opacity-50"
                                                value={selectedFolder}
                                                onChange={(e) => setSelectedFolder(e.target.value)}
                                            >
                                                <option value="">Select a Folder</option>
                                                {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                            </select>
                                            <div className="absolute inset-y-0 right-14 pr-2 flex items-center pointer-events-none text-silver-500"><svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 12l-5-5 1.5-1.5L10 9l3.5-3.5L15 7l-5 5z" clipRule="evenodd" /></svg></div>
                                            {selectedFolder && (
                                                <div className="flex gap-2 shrink-0">
                                                    <button
                                                        onClick={() => {
                                                            setIsRenamingFolder(true);
                                                            const f = folders.find(fo => fo.id === selectedFolder);
                                                            if (f) setRenameFolderName(f.name);
                                                        }}
                                                        className="w-11 h-11 flex items-center justify-center bg-dark-surface border border-silver-dark/20 text-silver-400 hover:text-white rounded-xl hover:bg-silver-dark/10 transition-colors shadow-inner"
                                                        title="Rename Folder"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={handleDeleteFolder}
                                                        className="w-11 h-11 flex items-center justify-center bg-dark-surface border border-red-500/20 text-silver-400 hover:text-red-400 rounded-xl hover:bg-red-500/10 transition-colors shadow-inner"
                                                        title="Delete Folder"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* File Details */}
                            <div className="space-y-6 pt-6 border-t border-silver-dark/20">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div
                                        className="flex-1 border-2 border-dashed border-silver-dark/30 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-silver-500 hover:bg-silver-dark/5 transition-all group bg-dark-android shadow-inner-metallic"
                                        onClick={() => document.getElementById('file-upload')?.click()}
                                    >
                                        <input
                                            type="file"
                                            id="file-upload"
                                            className="hidden"
                                            accept=".pdf"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        />
                                        <div className="w-20 h-20 bg-dark-surface border border-silver-dark/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-android-card">
                                            <Upload className="text-silver-400 group-hover:text-silver-200" size={36} />
                                        </div>
                                        <p className="text-white font-bold text-lg mb-2 drop-shadow-md">
                                            {file ? file.name : 'Choose PDF to upload'}
                                        </p>
                                        <p className="text-xs font-bold text-silver-600 uppercase tracking-widest">Max file size 50MB</p>
                                    </div>

                                    <button
                                        onClick={() => setShowPDFCreator(true)}
                                        className="flex flex-row md:flex-col items-center justify-center p-6 md:px-8 border border-silver-dark/20 rounded-2xl bg-dark-surface shadow-android-card hover:border-silver-500 hover:bg-silver-dark/10 transition-all group gap-4 w-full md:w-auto"
                                        title="Create PDF from Images"
                                    >
                                        <div className="w-12 h-12 md:w-16 md:h-16 bg-dark-android border border-silver-dark/20 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner-metallic">
                                            <Scan className="text-silver-400 group-hover:text-silver-200" size={24} />
                                        </div>
                                        <span className="text-sm md:text-xs font-bold text-silver-400 group-hover:text-white text-center w-auto md:w-28 uppercase tracking-widest leading-relaxed">
                                            Create from Images
                                        </span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-silver-600 uppercase tracking-widest block ml-2">Document Title</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g. Data Structures Notes Unit 1"
                                            className="w-full bg-dark-android border border-silver-800 rounded-xl py-3 px-4 outline-none focus:border-silver-500 text-white font-bold shadow-inner-metallic placeholder-silver-600 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-silver-600 uppercase tracking-widest block ml-2">Description <span className="text-silver-600/50">(Optional)</span></label>
                                        <input
                                            type="text"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Brief detail about the content"
                                            className="w-full bg-dark-android border border-silver-800 rounded-xl py-3 px-4 outline-none focus:border-silver-500 text-white font-bold shadow-inner-metallic placeholder-silver-600 transition-all"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-3 pt-4 col-span-full">
                                        <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                            <div className={`w-5 h-5 rounded border ${notifyUsers ? 'bg-silver-gradient border-silver-light' : 'bg-dark-android border-silver-dark/40'} flex items-center justify-center shadow-inner transition-colors`}>
                                                {notifyUsers && <Check size={14} className="text-dark-android" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                id="notifyUsers"
                                                checked={notifyUsers}
                                                onChange={(e) => setNotifyUsers(e.target.checked)}
                                                className="hidden"
                                            />
                                            <span className="text-sm font-bold text-silver-400 group-hover:text-white transition-colors">Notify users via email</span>
                                        </label>

                                        {notifyUsers && (
                                            <div className="ml-8 p-4 bg-dark-android rounded-xl border border-silver-dark/20 shadow-inner-metallic animate-in slide-in-from-top-2">
                                                <label className="flex items-center gap-3 cursor-pointer group mb-3 w-fit">
                                                    <div className={`w-5 h-5 rounded border ${isBacklog ? 'bg-yellow-500 border-yellow-400' : 'bg-dark-surface border-silver-dark/40'} flex items-center justify-center shadow-inner transition-colors`}>
                                                        {isBacklog && <Check size={14} className="text-dark-android" />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        id="isBacklog"
                                                        checked={isBacklog}
                                                        onChange={(e) => setIsBacklog(e.target.checked)}
                                                        className="hidden"
                                                    />
                                                    <span className="text-sm font-bold text-white group-hover:text-yellow-100 transition-colors drop-shadow-md">Prefer Backlog / Important Update?</span>
                                                </label>
                                                <p className="text-[11px] text-silver-500 font-bold leading-relaxed max-w-lg">
                                                    <span className="text-yellow-500 drop-shadow-md">Checked:</span> Broadcasts to <b>ALL</b> users (Important for exams).
                                                    <br />
                                                    <span className="text-blue-400 drop-shadow-md">Unchecked:</span> Sends email <b>ONLY</b> to users in this Semester/Year.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-shrink-0 p-6 border-t border-silver-dark/20 flex justify-end gap-3 bg-dark-android sticky bottom-0 z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                            <button
                                onClick={() => setIsUploadModalOpen(false)}
                                className="px-6 py-3 text-[10px] font-bold text-silver-500 uppercase tracking-widest hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={uploading || !file || !selectedFolder || !title}
                                className="bg-silver-gradient text-dark-android font-bold uppercase tracking-widest text-[10px] px-8 py-3 rounded-xl shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 border border-silver-light transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0 disabled:hover:shadow-3d"
                            >
                                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                Upload PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Modal */}
            {editingPdf && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                    <div className="bg-dark-surface shadow-android-card border border-silver-dark/20 rounded-3xl w-full max-w-md relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-30 z-20" />
                        <div className="p-6 border-b border-silver-dark/20 flex items-center justify-between bg-dark-android">
                            <h2 className="text-xl font-display font-bold text-white drop-shadow-md">Edit PDF Title</h2>
                            <button onClick={() => setEditingPdf(null)} className="p-2 text-silver-400 hover:text-white bg-dark-surface hover:bg-silver-dark/20 rounded-xl transition-all active:scale-95 shadow-inner">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 bg-dark-surface">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-silver-600 uppercase tracking-widest block ml-2">Document Title</label>
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full bg-dark-android border border-silver-800 rounded-xl py-3 px-4 outline-none focus:border-silver-500 text-white font-bold shadow-inner-metallic placeholder-silver-600 transition-all"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-silver-dark/20 flex justify-end gap-3 bg-dark-android">
                            <button
                                onClick={() => setEditingPdf(null)}
                                className="px-6 py-3 text-[10px] font-bold text-silver-500 uppercase tracking-widest hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                disabled={updating || !editTitle}
                                className="bg-silver-gradient text-dark-android font-bold uppercase tracking-widest text-[10px] px-8 py-3 rounded-xl shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 border border-silver-light transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0 disabled:hover:shadow-3d"
                            >
                                {updating ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Location Details Popup */}
            {locationPopupPdf && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-all">
                    <div className="bg-dark-surface shadow-android-card border border-silver-dark/20 rounded-3xl w-full max-w-lg relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-30 z-20" />
                        <div className="p-6 border-b border-silver-dark/20 flex items-center justify-between bg-dark-android relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-dark-surface border border-silver-dark/20 shadow-inner flex items-center justify-center text-silver-400 group">
                                    <Folder size={24} className="drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-display font-bold text-white drop-shadow-md">Location Details</h2>
                                    <p className="text-[10px] font-bold text-silver-500 uppercase tracking-widest mt-0.5">Full path hierarchy</p>
                                </div>
                            </div>
                            <button onClick={() => setLocationPopupPdf(null)} className="p-2 text-silver-400 hover:text-white bg-dark-surface hover:bg-silver-dark/20 rounded-xl transition-all active:scale-95 shadow-inner">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 bg-dark-surface relative z-10">
                            {/* Hierarchy Visualizer */}
                            <div className="relative pl-6 space-y-8 border-l-2 border-silver-dark/20 ml-2">
                                {/* College */}
                                <div className="relative">
                                    <span className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-dark-android border-2 border-silver-500 shadow-[0_0_10px_rgba(156,163,175,0.5)]"></span>
                                    <div className="text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 ml-2">College</div>
                                    <div className="text-white font-bold bg-dark-android p-3 rounded-xl border border-silver-dark/20 shadow-inner-metallic text-sm">
                                        {locationPopupPdf.folder?.subject?.semester?.year?.branch?.college?.name}
                                    </div>
                                </div>

                                {/* Branch & Year */}
                                <div className="relative">
                                    <span className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-dark-android border-2 border-silver-500 shadow-[0_0_10px_rgba(156,163,175,0.5)]"></span>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 ml-2">Branch</div>
                                            <div className="text-white font-bold bg-dark-android p-3 rounded-xl border border-silver-dark/20 shadow-inner-metallic text-sm truncate">
                                                {locationPopupPdf.folder?.subject?.semester?.year?.branch?.name}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 ml-2">Year</div>
                                            <div className="text-white font-bold bg-dark-android p-3 rounded-xl border border-silver-dark/20 shadow-inner-metallic text-sm truncate">
                                                {locationPopupPdf.folder?.subject?.semester?.year?.displayName}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Semester & Subject */}
                                <div className="relative">
                                    <span className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-dark-android border-2 border-silver-500 shadow-[0_0_10px_rgba(156,163,175,0.5)]"></span>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 ml-2">Semester</div>
                                            <div className="text-white font-bold bg-dark-android p-3 rounded-xl border border-silver-dark/20 shadow-inner-metallic text-sm truncate">
                                                {locationPopupPdf.folder?.subject?.semester?.displayName}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 ml-2">Subject</div>
                                            <div className="text-white font-bold bg-dark-android p-3 rounded-xl border border-silver-dark/20 shadow-inner-metallic text-sm truncate">
                                                {locationPopupPdf.folder?.subject?.name}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Target Folder (Editable) */}
                                <div className="relative">
                                    <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-dark-android shadow-[0_0_15px_rgba(255,255,255,0.8)]"></span>
                                    <div className="text-[10px] font-bold text-white uppercase tracking-widest mb-2 ml-2 drop-shadow-md">Current Folder</div>

                                    {isRenamingLocationFolder ? (
                                        <div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <input
                                                type="text"
                                                value={newLocationFolderName}
                                                onChange={(e) => setNewLocationFolderName(e.target.value)}
                                                className="flex-1 bg-dark-android border border-silver-500/50 rounded-xl px-4 py-3 text-white font-bold text-sm shadow-inner outline-none focus:border-silver-300 transition-colors"
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleRenameLocationFolder}
                                                className="px-4 py-3 bg-silver-gradient text-dark-android font-bold rounded-xl shadow-3d hover:-translate-y-0.5 hover:shadow-3d-hover transition-all flex items-center justify-center shrink-0"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                onClick={() => setIsRenamingLocationFolder(false)}
                                                className="px-4 py-3 bg-dark-android border border-silver-dark/30 text-silver-400 hover:text-white rounded-xl shadow-inner transition-colors flex items-center justify-center shrink-0"
                                            >
                                                <XIcon size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 group">
                                            <div className="flex-1 text-dark-android font-bold text-lg bg-silver-gradient border border-white/20 p-4 rounded-xl flex items-center gap-3 shadow-inner">
                                                <div className="p-1.5 bg-dark-android/10 rounded-lg"><Folder size={20} className="text-dark-android" /></div>
                                                {locationPopupPdf.folder?.name}
                                            </div>
                                            <button
                                                onClick={() => setIsRenamingLocationFolder(true)}
                                                className="p-4 bg-dark-android border border-silver-dark/20 text-silver-400 hover:text-white hover:border-silver-dark/50 rounded-xl shadow-inner transition-all opacity-0 group-hover:opacity-100 hover:scale-105"
                                            >
                                                <Edit2 size={20} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-silver-dark/20 bg-dark-android flex justify-end relative z-10">
                            <button
                                onClick={() => setLocationPopupPdf(null)}
                                className="px-8 py-3 bg-silver-gradient text-dark-android font-bold uppercase tracking-widest text-[10px] rounded-xl shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 border border-silver-light transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* PDF Creator Studio */}
            {/* 1. For New Uploads */}
            <PDFCreatorModal
                isOpen={showPDFCreator}
                onClose={() => setShowPDFCreator(false)}
                onComplete={(file) => {
                    setFile(file);
                    if (!title) setTitle(file.name.replace('.pdf', ''));
                    // Open upload modal next
                    setIsUploadModalOpen(true);
                }}
            />

            {/* 2. For Editing Existing Content */}
            <PDFCreatorModal
                isOpen={!!editingContentPdf}
                onClose={() => {
                    setEditingContentPdf(null);
                    setInitialEditFile(undefined);
                }}
                initialFile={initialEditFile}
                onComplete={handleContentUpdate}
            />

        </div>
    );
}
