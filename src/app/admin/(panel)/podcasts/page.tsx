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
                    <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center gap-2 drop-shadow-md">
                        {activeSubject ? (
                            <>
                                <button onClick={() => { setActiveSubject(null); setView('subjects'); }} className="hover:bg-dark-surface p-2 rounded-xl border border-transparent hover:border-silver-dark/20 text-silver-400 hover:text-white transition-all shadow-inner">
                                    <ArrowLeft size={20} />
                                </button>
                                {activeSubject.name}
                                {activeFolder && <span className="text-silver-500 font-bold text-xl drop-shadow-sm">/ {activeFolder.name}</span>}
                            </>
                        ) : 'Podcast Management'}
                    </h1>
                    <p className="text-silver-400">Organize and manage academic audio content</p>
                </div>

                <div className="flex items-center gap-3">
                    {view === 'folders' && (
                        <>
                            <button
                                onClick={() => setShowCreateFolder(true)}
                                className="bg-dark-android hover:bg-silver-dark/10 text-silver-300 font-bold flex items-center gap-2 px-4 py-2.5 rounded-xl border border-silver-dark/20 shadow-inner hover:text-white transition-all"
                            >
                                <Folder size={18} />
                                New Folder
                            </button>
                            {activeFolder && (
                                <Link
                                    href={`/admin/podcasts/create?folderId=${activeFolder.id}`}
                                    className="bg-silver-gradient text-dark-android font-bold flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 border border-silver-light transition-all overflow-hidden relative group"
                                >
                                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/10 rounded-t-xl" />
                                    <Plus size={18} className="relative z-10" />
                                    <span className="relative z-10">Upload Podcast</span>
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
                    {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-dark-surface border border-silver-dark/10 shadow-android-card h-32 rounded-3xl" />)}
                </div>
            ) : view === 'subjects' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map(subject => (
                        <button
                            key={subject.id}
                            onClick={() => enterSubject(subject)}
                            className="p-6 rounded-3xl bg-dark-surface shadow-android-card border border-silver-dark/10 relative overflow-hidden flex items-center gap-4 hover:border-silver-metallic/40 text-left group transition-all"
                        >
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-30" />
                            <div className="w-14 h-14 rounded-2xl bg-dark-android border border-silver-dark/20 shadow-inner flex items-center justify-center text-silver-300 group-hover:bg-silver-metallic/10 group-hover:text-white transition-all">
                                <BookOpen size={24} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="font-display font-bold text-lg text-white drop-shadow-md">{subject.name}</h3>
                                <p className="text-sm font-bold text-silver-500">{subject.code} • {subject._count?.podcastFolders || 0} Folders</p>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Folders */}
                    {folders.length > 0 && (
                        <section>
                            <h3 className="text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-4 ml-2">Folders</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {folders.map(folder => (
                                    <button
                                        key={folder.id}
                                        onClick={() => enterFolder(folder)}
                                        className="p-5 rounded-2xl bg-dark-surface shadow-android-card border border-silver-dark/10 relative overflow-hidden flex items-center gap-3 hover:border-silver-metallic/40 text-left group transition-all"
                                    >
                                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-20" />
                                        <Folder size={20} className="text-silver-400 group-hover:text-silver-200 transition-colors" fill="currentColor" fillOpacity={0.2} />
                                        <span className="font-bold text-silver-200 truncate flex-1">{folder.name}</span>
                                        <span className="text-xs font-bold text-silver-300 bg-dark-android border border-silver-dark/20 shadow-inner px-2 py-0.5 rounded-lg">{folder._count.podcasts}</span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Podcasts */}
                    <section>
                        <h3 className="text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-4 ml-2">Podcasts</h3>
                        {podcasts.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-silver-dark/20 rounded-3xl bg-dark-android shadow-inner-metallic">
                                <Music className="mx-auto text-silver-600 mb-3 drop-shadow-sm" size={32} />
                                <p className="text-silver-400 font-medium">No podcasts in this folder yet.</p>
                                <button
                                    onClick={() => activeFolder && router.push(`/admin/podcasts/create?folderId=${activeFolder.id}`)}
                                    className="text-silver-100 bg-silver-metallic/10 hover:bg-silver-metallic/20 px-4 py-2 rounded-xl text-sm font-bold mt-4 transition-all shadow-inner border border-silver-dark/30"
                                >
                                    + Upload One
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {podcasts.map(podcast => (
                                    <div key={podcast.id} className="p-4 rounded-2xl bg-dark-surface shadow-android-card border border-silver-dark/10 relative overflow-hidden flex items-center gap-6 group hover:border-silver-metallic/40 transition-all">
                                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-20" />
                                        <div className="w-12 h-12 rounded-xl bg-dark-android border border-silver-dark/20 shadow-inner flex items-center justify-center text-silver-400 shrink-0 group-hover:bg-silver-metallic/10 group-hover:text-white transition-all">
                                            <Music size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0 relative z-10">
                                            <h4 className="font-bold text-white truncate drop-shadow-md">{podcast.title}</h4>
                                            <div className="flex gap-2 mt-1">
                                                {podcast.versions.map(v => (
                                                    <span key={v.language} className="text-[10px] uppercase font-bold bg-dark-android px-2 py-0.5 rounded-md text-silver-400 border border-silver-dark/20 shadow-inner tracking-wider">
                                                        {v.language}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
                                            <button className="p-2 hover:bg-dark-android rounded-xl border border-transparent hover:border-silver-dark/20 shadow-inner text-silver-400 hover:text-white transition-all">
                                                <FileAudio size={18} />
                                            </button>
                                            <button className="p-2 hover:bg-dark-android rounded-xl border border-transparent hover:border-silver-dark/20 shadow-inner text-silver-400 hover:text-white transition-all">
                                                <ImageIcon size={18} />
                                            </button>
                                            <button onClick={(e) => handleDeletePodcast(podcast.id, e)} className="p-2 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20 shadow-inner text-silver-400 hover:text-red-400 transition-all">
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleCreateFolder} className="w-full max-w-md p-8 rounded-3xl bg-dark-surface shadow-android-card border border-silver-dark/20 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-30" />
                        <h2 className="text-xl font-display font-bold text-white mb-6 drop-shadow-md relative z-10">Create New Folder</h2>
                        <input
                            autoFocus
                            placeholder="Folder Name (e.g., Unit 1)"
                            value={newFolderName}
                            onChange={e => setNewFolderName(e.target.value)}
                            className="w-full bg-dark-android border border-silver-800 rounded-xl px-4 py-4 outline-none focus:border-silver-500 text-white font-bold mb-8 shadow-inner-metallic placeholder-silver-600 transition-all relative z-10"
                        />
                        <div className="flex justify-end gap-3 relative z-10">
                            <button type="button" onClick={() => setShowCreateFolder(false)} className="px-6 py-2.5 text-silver-400 hover:text-white font-bold transition-colors">Cancel</button>
                            <button type="submit" disabled={!newFolderName.trim()} className="px-6 py-2.5 bg-silver-gradient text-dark-android rounded-xl font-bold shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 border border-silver-light transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                Create Folder
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
