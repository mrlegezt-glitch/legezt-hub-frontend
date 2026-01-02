'use client';

// ==================================
// LeGeZtCast - Hierarchical Navigation
// ==================================

import { useState, useEffect } from 'react';
import { ChevronRight, Folder, Music, BookOpen, Clock, Play, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import BottomNav from '@/components/navigation/BottomNav';
import { podcastApi } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Subject {
    id: string;
    name: string;
    code: string;
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
    thumbnailUrl?: string;
    versions: { language: string }[];
}

export default function PodcastsPage() {
    const [view, setView] = useState<'subjects' | 'folders' | 'content'>('subjects');
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [folders, setFolders] = useState<PodcastFolder[]>([]);
    const [podcasts, setPodcasts] = useState<Podcast[]>([]);

    // Navigation state
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [breadcrumbs, setBreadcrumbs] = useState<{ id: string; name: string; type: 'subject' | 'folder' }[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial Fetch: Subjects
    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const res = await podcastApi.getSubjects();
            setSubjects(res.data.data);
            setView('subjects');
            setBreadcrumbs([]);
        } catch (error) {
            console.error('Failed to fetch subjects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubjectClick = async (subject: Subject) => {
        setLoading(true);
        try {
            const res = await podcastApi.getFolders(subject.id);
            setFolders(res.data.data);
            setSelectedSubject(subject);
            setBreadcrumbs([{ id: subject.id, name: subject.name, type: 'subject' }]);
            setView('folders');
        } catch (error) {
            console.error('Failed to fetch folders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFolderClick = async (folder: PodcastFolder) => {
        setLoading(true);
        try {
            const res = await podcastApi.getFolderChildren(folder.id);
            const { subfolders, podcasts } = res.data.data;
            setFolders(subfolders);
            setPodcasts(podcasts);

            // Update breadcrumbs - only add if not already there or child of last
            setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name, type: 'folder' }]);
            setView('content');
        } catch (error) {
            console.error('Failed to fetch folder children:', error);
        } finally {
            setLoading(false);
        }
    };

    const navigateToBreadcrumb = async (index: number) => {
        const item = breadcrumbs[index];
        const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
        setBreadcrumbs(newBreadcrumbs);

        if (item.type === 'subject') {
            handleSubjectClick(selectedSubject!);
        } else {
            setLoading(true);
            try {
                const res = await podcastApi.getFolderChildren(item.id);
                const { subfolders, podcasts } = res.data.data;
                setFolders(subfolders);
                setPodcasts(podcasts);
                setView('content');
            } catch (error) {
                console.error('Navigation error:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <main className="min-h-screen pb-32 bg-dark-400">
            <div className="max-w-7xl mx-auto px-5 md:px-10 pt-32">
                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center">
                                <Music size={20} />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight">LeGeZt<span className="text-primary-400">Cast</span></h1>
                        </div>
                        <p className="text-gray-400">Audio summaries & synchronized visual concepts</p>
                    </div>

                    {/* Breadcrumbs */}
                    {breadcrumbs.length > 0 && (
                        <nav className="flex items-center gap-2 text-sm text-gray-500 overflow-x-auto whitespace-nowrap pb-2 md:pb-0">
                            <button onClick={fetchSubjects} className="hover:text-white transition-colors">All Subjects</button>
                            {breadcrumbs.map((crumb, i) => (
                                <div key={crumb.id} className="flex items-center gap-2">
                                    <ChevronRight size={14} />
                                    <button
                                        onClick={() => navigateToBreadcrumb(i)}
                                        className={`hover:text-white transition-colors ${i === breadcrumbs.length - 1 ? 'text-white font-bold' : ''}`}
                                    >
                                        {crumb.name}
                                    </button>
                                </div>
                            ))}
                        </nav>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton h-32 rounded-3xl" />)}
                        </motion.div>
                    ) : (
                        <motion.div
                            key={view + (breadcrumbs[breadcrumbs.length - 1]?.id || 'root')}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {/* View: SUBJECTS */}
                            {view === 'subjects' && subjects.map(subject => (
                                <button
                                    key={subject.id}
                                    onClick={() => handleSubjectClick(subject)}
                                    className="card group p-6 flex items-center gap-6 hover:border-primary-500/50 transition-all text-left"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <BookOpen size={28} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-lg truncate mb-1">{subject.name}</h3>
                                        <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">{subject.code}</p>
                                    </div>
                                    <ChevronRight className="text-gray-700 group-hover:text-primary-400 transition-colors" />
                                </button>
                            ))}

                            {/* View: FOLDERS / CONTENT */}
                            {(view === 'folders' || view === 'content') && (
                                <>
                                    {folders.map(folder => (
                                        <button
                                            key={folder.id}
                                            onClick={() => handleFolderClick(folder)}
                                            className="card group p-6 flex items-center gap-6 hover:border-emerald-500/50 transition-all text-left"
                                        >
                                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                <Folder size={28} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-black text-lg truncate mb-1">{folder.name}</h3>
                                                <p className="text-gray-500 text-sm font-medium">
                                                    {folder._count.podcasts} Podcasts • {folder._count.children} Folders
                                                </p>
                                            </div>
                                        </button>
                                    ))}

                                    {podcasts.map(podcast => (
                                        <Link
                                            key={podcast.id}
                                            href={`/podcasts/${podcast.id}`}
                                            className="card group p-6 flex items-center gap-6 hover:border-primary-500/50 transition-all text-left"
                                        >
                                            <div className="w-16 h-16 rounded-2xl overflow-hidden relative shrink-0 group-hover:scale-110 transition-transform bg-primary-500/20 text-primary-400 flex items-center justify-center">
                                                {podcast.thumbnailUrl ? (
                                                    <img src={podcast.thumbnailUrl} alt={podcast.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Play size={24} fill="currentColor" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-black text-lg truncate mb-1">{podcast.title}</h3>
                                                <div className="flex gap-2">
                                                    {podcast.versions.map(v => (
                                                        <span key={v.language} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-gray-400">
                                                            {v.language}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}

                                    {folders.length === 0 && podcasts.length === 0 && (
                                        <div className="col-span-full py-20 text-center">
                                            <div className="w-20 h-20 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">📭</div>
                                            <h2 className="text-xl font-bold mb-2">Empty Folder</h2>
                                            <p className="text-gray-500">No podcasts or folders found here yet.</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <BottomNav />
        </main>
    );
}
