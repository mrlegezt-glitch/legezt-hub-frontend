'use client';

import { useState, useEffect } from 'react';
import {
    Folder,
    Plus,
    Search,
    Music,
    Trash2,
    Loader2,
    ChevronRight,
    ArrowLeft,
    BookOpen,
    MoreVertical,
    FileAudio,
    Image as ImageIcon
} from 'lucide-react';
import { podcastApi } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Subject {
    id: string;
    name: string;
    code: string;
    _count?: { podcastFolders: number };
}

interface PodcastFolder {
    id: string;
    name: string;
    path: string;
    _count: { podcasts: number; children: number };
}

interface Podcast {
    id: string;
    title: string;
    description?: string;
    createdAt: string;
    versions: { language: string }[];
}

export default function AdminPodcastsPage() {
    const router = useRouter();
    const [view, setView] = useState<'subjects' | 'folders'>('subjects');
    const [loading, setLoading] = useState(true);

    // Data
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [folders, setFolders] = useState<PodcastFolder[]>([]);
    const [podcasts, setPodcasts] = useState<Podcast[]>([]);

    // Navigation Context
    const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
    const [activeFolder, setActiveFolder] = useState<PodcastFolder | null>(null);
    const [breadcrumbs, setBreadcrumbs] = useState<{ id: string; name: string }[]>([]);

    // Modal State
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const res = await podcastApi.getSubjects();
            setSubjects(res.data.data);
            setView('subjects');
        } catch (error) {
            toast.error('Failed to load subjects');
        } finally {
            setLoading(false);
        }
    };

    const enterSubject = async (subject: Subject) => {
        setLoading(true);
        try {
            const res = await podcastApi.getFolders(subject.id);
            setFolders(res.data.data);
            setActiveSubject(subject);
            setActiveFolder(null);
            setBreadcrumbs([{ id: subject.id, name: subject.name }]);
            setView('folders');
        } catch (error) {
            toast.error('Failed to load folders');
        } finally {
            setLoading(false);
        }
    };

    const enterFolder = async (folder: PodcastFolder) => {
        setLoading(true);
        try {
            const res = await podcastApi.getFolderChildren(folder.id);
            setFolders(res.data.data.subfolders);
            setPodcasts(res.data.data.podcasts);
            setActiveFolder(folder);

            // Add to breadcrumbs if moving deeper
            if (!breadcrumbs.find(b => b.id === folder.id)) {
                setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }]);
            }
        } catch (error) {
            toast.error('Failed to load contents');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeSubject) return;

        try {
            await podcastApi.createFolder({
                name: newFolderName,
                subjectId: activeSubject.id,
                parentId: activeFolder?.id
            });
            toast.success('Folder created');
            setShowCreateFolder(false);
            setNewFolderName('');

            // Refresh current view
            if (activeFolder) {
                enterFolder(activeFolder);
            } else {
                enterSubject(activeSubject);
            }
        } catch (error) {
            toast.error('Failed to create folder');
        }
    };

    const handleDeletePodcast = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this podcast?')) return;
        try {
            await podcastApi.deletePodcast(id);
            toast.success('Podcast deleted successfully');
            setPodcasts(podcasts.filter(p => p.id !== id));
        } catch (error) {
            toast.error('Failed to delete podcast');
        }
    };

    const handleBreadcrumbClick = (index: number) => {
        // Implementation simplified for now: just reset to subject if clicking first item
        if (index === 0 && activeSubject) {
            enterSubject(activeSubject);
        } else if (index === breadcrumbs.length - 1) {
            // Do nothing, already here
        } else {
            // Logic to find folder by ID from breadcrumb list would go here
            // For simplicity, let's just allow going back to Root Subject
            enterSubject(activeSubject!);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                        {activeSubject ? (
                            <>
                                <button onClick={() => { setActiveSubject(null); setView('subjects'); }} className="hover:bg-dark-200 p-1 rounded-lg transition-colors">
                                    <ArrowLeft size={24} />
                                </button>
                                {activeSubject.name}
                                {activeFolder && <span className="text-gray-500 font-normal text-xl">/ {activeFolder.name}</span>}
                            </>
                        ) : 'Podcast Management'}
                    </h1>
                    <p className="text-gray-400">Organize and manage academic audio content</p>
                </div>

                <div className="flex items-center gap-3">
                    {view === 'folders' && (
                        <>
                            <button
                                onClick={() => setShowCreateFolder(true)}
                                className="btn bg-dark-200 hover:bg-dark-100 text-white flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border border-dark-border"
                            >
                                <Folder size={18} />
                                New Folder
                            </button>
                            {activeFolder && (
                                <Link
                                    href={`/admin/podcasts/create?folderId=${activeFolder.id}`}
                                    className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all hover:scale-105"
                                >
                                    <Plus size={18} />
                                    Upload Podcast
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Breadcrumbs */}
            {activeSubject && (
                <div className="flex items-center gap-2 mb-6 text-sm text-gray-400 overflow-x-auto pb-2">
                    <button onClick={() => { setActiveSubject(null); setView('subjects'); }} className="hover:text-white">Subjects</button>
                    {breadcrumbs.map((crumb, i) => (
                        <div key={crumb.id} className="flex items-center gap-2">
                            <ChevronRight size={14} />
                            <button onClick={() => handleBreadcrumbClick(i)} className={`hover:text-white ${i === breadcrumbs.length - 1 ? 'text-white font-bold' : ''}`}>
                                {crumb.name}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Content Area */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
                </div>
            ) : view === 'subjects' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map(subject => (
                        <button
                            key={subject.id}
                            onClick={() => enterSubject(subject)}
                            className="card p-6 flex items-center gap-4 hover:border-primary-500/50 text-left group transition-all"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{subject.name}</h3>
                                <p className="text-sm text-gray-500">{subject.code} • {subject._count?.podcastFolders || 0} Folders</p>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Folders */}
                    {folders.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Folders</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {folders.map(folder => (
                                    <button
                                        key={folder.id}
                                        onClick={() => enterFolder(folder)}
                                        className="card p-4 flex items-center gap-3 hover:border-emerald-500/50 text-left group transition-all"
                                    >
                                        <Folder size={20} className="text-emerald-500" fill="currentColor" fillOpacity={0.2} />
                                        <span className="font-medium truncate flex-1">{folder.name}</span>
                                        <span className="text-xs text-gray-500 bg-dark-300 px-2 py-0.5 rounded-full">{folder._count.podcasts}</span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Podcasts */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Podcasts</h3>
                        {podcasts.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-dark-border rounded-2xl bg-dark-100/30">
                                <Music className="mx-auto text-gray-600 mb-3" size={32} />
                                <p className="text-gray-400">No podcasts in this folder yet.</p>
                                <button
                                    onClick={() => activeFolder && router.push(`/admin/podcasts/create?folderId=${activeFolder.id}`)}
                                    className="text-primary-400 hover:text-primary-300 text-sm font-bold mt-2"
                                >
                                    + Upload One
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {podcasts.map(podcast => (
                                    <div key={podcast.id} className="card p-4 flex items-center gap-6 group hover:border-primary-500/30 transition-all">
                                        <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                                            <Music size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold truncate">{podcast.title}</h4>
                                            <div className="flex gap-2 mt-1">
                                                {podcast.versions.map(v => (
                                                    <span key={v.language} className="text-[10px] uppercase bg-dark-300 px-1.5 py-0.5 rounded text-gray-400 border border-dark-border">
                                                        {v.language}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-dark-200 rounded-lg text-gray-400 hover:text-white transition-colors">
                                                <FileAudio size={18} />
                                            </button>
                                            <button className="p-2 hover:bg-dark-200 rounded-lg text-gray-400 hover:text-white transition-colors">
                                                <ImageIcon size={18} />
                                            </button>
                                            <button onClick={(e) => handleDeletePodcast(podcast.id, e)} className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            )}

            {/* Create Folder Modal */}
            {showCreateFolder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleCreateFolder} className="card w-full max-w-md p-6 bg-dark-100 border-primary-500/20 shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Create New Folder</h2>
                        <input
                            autoFocus
                            placeholder="Folder Name (e.g., Unit 1)"
                            value={newFolderName}
                            onChange={e => setNewFolderName(e.target.value)}
                            className="w-full bg-dark-200 border border-dark-border rounded-xl px-4 py-3 outline-none focus:border-primary-500 mb-6"
                        />
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShowCreateFolder(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                            <button type="submit" disabled={!newFolderName.trim()} className="btn-primary px-6 py-2 rounded-xl">Create Folder</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
