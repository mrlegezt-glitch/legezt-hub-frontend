'use client';

import { useState, useEffect } from 'react';
import { api, pdfApi } from '@/lib/api';
import {
    FileText, Upload, Plus, Folder, Loader2, X, ChevronRight,
    School, BookOpen, Layers, Calendar, Edit2, Trash2, Check, X as XIcon, Info, Scan
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
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">PDF Management</h1>
                    <p className="text-gray-400">Manage and upload study resources</p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Upload size={18} />
                    Upload PDF
                </button>
            </div>

            {/* Recent Uploads Table */}
            <div className="bg-dark-200 border border-dark-border rounded-xl overflow-hidden shadow-lg">
                <div className="px-6 py-4 border-b border-dark-border">
                    <h3 className="font-bold text-white">Recent Uploads</h3>
                </div>
                {loading ? (
                    <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary-500" /></div>
                ) : pdfs.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No PDFs found. Upload one to get started.</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-dark-300 text-gray-400 text-sm">
                            <tr>
                                <th className="px-6 py-3 font-medium">Title</th>
                                <th className="px-6 py-3 font-medium">Location</th>
                                <th className="px-6 py-3 font-medium">Size</th>
                                <th className="px-6 py-3 font-medium">Downloads</th>
                                <th className="px-6 py-3 font-medium">Date</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                            {pdfs.map((pdf) => {
                                const folderName = pdf.folder?.name || 'Unknown';

                                return (
                                    <tr key={pdf.id} className="hover:bg-dark-300/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0">
                                                    <FileText size={16} />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{pdf.title}</div>
                                                    <div className="text-xs text-gray-500 truncate max-w-[200px]">{pdf.fileName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2 text-white font-medium">
                                                    <Folder size={14} className="text-yellow-500" />
                                                    {folderName}
                                                </div>
                                                <button
                                                    onClick={() => openLocationPopup(pdf)}
                                                    className="p-1 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-md transition-all"
                                                >
                                                    <Info size={14} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">{pdf.sizeFormatted}</td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">{pdf.downloadCount}</td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">
                                            {new Date(pdf.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(pdf)}
                                                    className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-500/10 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(pdf.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-dark-200 border border-dark-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
                        <div className="sticky top-0 bg-dark-200 p-6 border-b border-dark-border flex items-center justify-between z-10">
                            <h2 className="text-xl font-bold text-white">Upload New PDF</h2>
                            <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Hierarchy Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-400">College</label>
                                    <select
                                        className="w-full bg-dark-300 border border-dark-border rounded-lg px-3 py-2 text-white outline-none focus:border-primary-500"
                                        value={selectedCollege}
                                        onChange={(e) => setSelectedCollege(e.target.value)}
                                    >
                                        <option value="">Select College</option>
                                        {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-400">Branch</label>
                                    <select
                                        className="w-full bg-dark-300 border border-dark-border rounded-lg px-3 py-2 text-white outline-none focus:border-primary-500"
                                        value={selectedBranch}
                                        onChange={(e) => setSelectedBranch(e.target.value)}
                                        disabled={!selectedCollege}
                                    >
                                        <option value="">Select Branch</option>
                                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-400">Year</label>
                                    <select
                                        className="w-full bg-dark-300 border border-dark-border rounded-lg px-3 py-2 text-white outline-none focus:border-primary-500"
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        disabled={!selectedBranch}
                                    >
                                        <option value="">Select Year</option>
                                        {years.map(y => <option key={y.id} value={y.id}>{y.displayName}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-400">Semester</label>
                                    <select
                                        className="w-full bg-dark-300 border border-dark-border rounded-lg px-3 py-2 text-white outline-none focus:border-primary-500"
                                        value={selectedSemester}
                                        onChange={(e) => setSelectedSemester(e.target.value)}
                                        disabled={!selectedYear}
                                    >
                                        <option value="">Select Semester</option>
                                        {semesters.map(s => <option key={s.id} value={s.id}>{s.displayName}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-400">Subject</label>
                                <select
                                    className="w-full bg-dark-300 border border-dark-border rounded-lg px-3 py-2 text-white outline-none focus:border-primary-500"
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    disabled={!selectedSemester}
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                                </select>
                            </div>

                            {/* Folder Selection & Management */}
                            {selectedSubject && (
                                <div className="space-y-2 p-4 bg-dark-300/50 rounded-lg border border-dark-border">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-white flex items-center gap-2">
                                            <Folder size={16} className="text-yellow-500" />
                                            Target Folder
                                        </label>
                                        {!isCreatingFolder && !isRenamingFolder && (
                                            <button
                                                onClick={() => setIsCreatingFolder(true)}
                                                className="text-xs text-primary-400 hover:text-white flex items-center gap-1"
                                            >
                                                <Plus size={12} /> New Folder
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
                                                className="flex-1 bg-dark-100 border border-dark-border rounded px-3 py-1.5 text-sm outline-none focus:border-primary-500"
                                            />
                                            <button
                                                onClick={handleCreateFolder}
                                                className="px-3 py-1.5 bg-primary-600 rounded text-xs font-medium hover:bg-primary-500"
                                            >
                                                Create
                                            </button>
                                            <button
                                                onClick={() => setIsCreatingFolder(false)}
                                                className="px-3 py-1.5 bg-dark-100 rounded text-xs font-medium hover:bg-dark-50"
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
                                                className="flex-1 bg-dark-100 border border-dark-border rounded px-3 py-1.5 text-sm outline-none focus:border-primary-500"
                                            />
                                            <button
                                                onClick={handleRenameFolder}
                                                className="px-3 py-1.5 bg-green-600 rounded text-xs font-medium hover:bg-green-500"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setIsRenamingFolder(false)}
                                                className="px-3 py-1.5 bg-dark-100 rounded text-xs font-medium hover:bg-dark-50"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <select
                                                className="flex-1 bg-dark-100 border border-dark-border rounded px-3 py-2 text-white outline-none focus:border-primary-500"
                                                value={selectedFolder}
                                                onChange={(e) => setSelectedFolder(e.target.value)}
                                            >
                                                <option value="">Select a Folder</option>
                                                {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                            </select>
                                            {selectedFolder && (
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => {
                                                            setIsRenamingFolder(true);
                                                            const f = folders.find(fo => fo.id === selectedFolder);
                                                            if (f) setRenameFolderName(f.name);
                                                        }}
                                                        className="px-3 py-2 bg-blue-500/10 text-blue-500 rounded hover:bg-blue-500/20 transition-colors"
                                                        title="Rename Folder"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={handleDeleteFolder}
                                                        className="px-3 py-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors"
                                                        title="Delete Folder"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* File Details */}
                            <div className="space-y-4 pt-4 border-t border-dark-border">
                                <div className="flex gap-4">
                                    <div
                                        className="flex-1 border-2 border-dashed border-dark-border rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary-500 hover:bg-dark-200/50 transition-all group"
                                        onClick={() => document.getElementById('file-upload')?.click()}
                                    >
                                        <input
                                            type="file"
                                            id="file-upload"
                                            className="hidden"
                                            accept=".pdf"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        />
                                        <div className="w-16 h-16 bg-dark-300 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Upload className="text-gray-400 group-hover:text-primary-500" size={32} />
                                        </div>
                                        <p className="text-gray-300 font-medium mb-1">
                                            {file ? file.name : 'Click to upload PDF'}
                                        </p>
                                        <p className="text-xs text-gray-500">Max file size 50MB</p>
                                    </div>

                                    <button
                                        onClick={() => setShowPDFCreator(true)}
                                        className="flex flex-col items-center justify-center px-6 border-2 border-dashed border-dark-border rounded-xl hover:border-primary-500 hover:bg-dark-200/50 transition-all group gap-2"
                                        title="Create PDF from Images"
                                    >
                                        <div className="w-12 h-12 bg-dark-300 rounded-full flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                                            <Scan className="text-gray-400 group-hover:text-primary-500" size={24} />
                                        </div>
                                        <span className="text-xs font-medium text-gray-400 group-hover:text-primary-400 text-center w-20">
                                            Create from Images
                                        </span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-400">Document Title</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g. Data Structures Notes Unit 1"
                                            className="w-full bg-dark-300 border border-dark-border rounded-lg px-3 py-2 text-white outline-none focus:border-primary-500"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-400">Description (Optional)</label>
                                        <input
                                            type="text"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Brief detail about the content"
                                            className="w-full bg-dark-300 border border-dark-border rounded-lg px-3 py-2 text-white outline-none focus:border-primary-500"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 pt-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="notifyUsers"
                                                checked={notifyUsers}
                                                onChange={(e) => setNotifyUsers(e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-600 bg-dark-300 text-primary-600 focus:ring-primary-500"
                                            />
                                            <label htmlFor="notifyUsers" className="text-sm text-gray-300 cursor-pointer select-none">
                                                Notify users via email
                                            </label>
                                        </div>

                                        {notifyUsers && (
                                            <div className="ml-6 p-3 bg-dark-300/50 rounded-lg border border-dark-border animate-in slide-in-from-top-2">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <input
                                                        type="checkbox"
                                                        id="isBacklog"
                                                        checked={isBacklog}
                                                        onChange={(e) => setIsBacklog(e.target.checked)}
                                                        className="w-4 h-4 rounded border-gray-600 bg-dark-300 text-yellow-500 focus:ring-yellow-500"
                                                    />
                                                    <label htmlFor="isBacklog" className="text-sm font-medium text-white cursor-pointer select-none">
                                                        Prefer Backlog / Important Update?
                                                    </label>
                                                </div>
                                                <p className="text-xs text-gray-400 leading-relaxed">
                                                    <span className="text-yellow-500 font-bold">Checked:</span> Broadcasts to <b>ALL</b> users (Important for exams).
                                                    <br />
                                                    <span className="text-blue-400 font-bold">Unchecked:</span> Sends email <b>ONLY</b> to users in this Semester/Year.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-dark-border flex justify-end gap-3 bg-dark-300/30">
                            <button
                                onClick={() => setIsUploadModalOpen(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={uploading || !file || !selectedFolder || !title}
                                className="btn-primary px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                Upload PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Modal */}
            {editingPdf && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-dark-200 border border-dark-border rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <div className="p-6 border-b border-dark-border flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Edit PDF</h2>
                            <button onClick={() => setEditingPdf(null)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-400">Document Title</label>
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full bg-dark-300 border border-dark-border rounded-lg px-3 py-2 text-white outline-none focus:border-primary-500"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-dark-border flex justify-end gap-3 bg-dark-300/30">
                            <button
                                onClick={() => setEditingPdf(null)}
                                className="px-4 py-2 text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                disabled={updating || !editTitle}
                                className="btn-primary px-6 py-2 rounded-lg flex items-center gap-2"
                            >
                                {updating ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Location Details Popup */}
            {locationPopupPdf && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all">
                    <div className="bg-dark-200 border border-dark-border rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-dark-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                    <Folder size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Location Details</h2>
                                    <p className="text-xs text-gray-400">Full path hierarchy</p>
                                </div>
                            </div>
                            <button onClick={() => setLocationPopupPdf(null)} className="text-gray-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Hierarchy Visualizer */}
                            <div className="relative pl-4 space-y-6 border-l-2 border-dark-300 ml-2">
                                {/* College */}
                                <div className="relative">
                                    <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-dark-300 border-2 border-dark-200"></span>
                                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">College</div>
                                    <div className="text-white font-medium bg-dark-300/50 p-2 rounded-lg border border-dark-border/50">
                                        {locationPopupPdf.folder?.subject?.semester?.year?.branch?.college?.name}
                                    </div>
                                </div>

                                {/* Branch & Year */}
                                <div className="relative">
                                    <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-dark-300 border-2 border-dark-200"></span>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Branch</div>
                                            <div className="text-white font-medium bg-dark-300/50 p-2 rounded-lg border border-dark-border/50">
                                                {locationPopupPdf.folder?.subject?.semester?.year?.branch?.name}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Year</div>
                                            <div className="text-white font-medium bg-dark-300/50 p-2 rounded-lg border border-dark-border/50">
                                                {locationPopupPdf.folder?.subject?.semester?.year?.displayName}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Semester & Subject */}
                                <div className="relative">
                                    <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-dark-300 border-2 border-dark-200"></span>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Semester</div>
                                            <div className="text-white font-medium bg-dark-300/50 p-2 rounded-lg border border-dark-border/50">
                                                {locationPopupPdf.folder?.subject?.semester?.displayName}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Subject</div>
                                            <div className="text-white font-medium bg-dark-300/50 p-2 rounded-lg border border-dark-border/50">
                                                {locationPopupPdf.folder?.subject?.name}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Target Folder (Editable) */}
                                <div className="relative">
                                    <span className="absolute -left-[22px] top-1 w-4 h-4 rounded-full bg-primary-500 border-2 border-dark-200 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
                                    <div className="text-xs font-semibold text-primary-400 uppercase tracking-wider mb-1">Current Folder</div>

                                    {isRenamingLocationFolder ? (
                                        <div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <input
                                                type="text"
                                                value={newLocationFolderName}
                                                onChange={(e) => setNewLocationFolderName(e.target.value)}
                                                className="flex-1 bg-dark-100 border border-primary-500/50 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-primary-500/20"
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleRenameLocationFolder}
                                                className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                onClick={() => setIsRenamingLocationFolder(false)}
                                                className="px-3 py-2 bg-dark-300 hover:bg-dark-400 text-gray-400 hover:text-white rounded-lg transition-colors"
                                            >
                                                <XIcon size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 group">
                                            <div className="flex-1 text-white font-bold text-lg bg-primary-500/10 border border-primary-500/20 p-3 rounded-lg flex items-center gap-2">
                                                <Folder size={20} className="text-primary-500" />
                                                {locationPopupPdf.folder?.name}
                                            </div>
                                            <button
                                                onClick={() => setIsRenamingLocationFolder(true)}
                                                className="p-3 text-gray-500 hover:text-primary-500 hover:bg-primary-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Edit2 size={20} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-dark-border bg-dark-300/30 flex justify-end">
                            <button
                                onClick={() => setLocationPopupPdf(null)}
                                className="px-6 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* PDF Creator Studio */}
            <PDFCreatorModal
                isOpen={showPDFCreator}
                onClose={() => setShowPDFCreator(false)}
                onComplete={(file) => {
                    setFile(file);
                    // Optionally set title from filename if empty
                    if (!title) setTitle(file.name.replace('.pdf', ''));
                }}
            />
        </div>
    );
}
