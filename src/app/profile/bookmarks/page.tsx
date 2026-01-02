'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, FileText, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import BottomNav from '@/components/navigation/BottomNav';
import { userApi } from '@/lib/api';
import { toast } from 'sonner';

interface Bookmark {
    id: string;
    createdAt: string;
    pdf: {
        id: string;
        title: string;
        thumbnailUrl?: string;
        sizeBytes: number;
        folder: { name: string };
    };
}

export default function BookmarksPage() {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBookmarks = async () => {
        try {
            const res = await userApi.getBookmarks();
            setBookmarks(res.data.data);
        } catch (error) {
            console.error('Failed to fetch bookmarks', error);
            toast.error('Failed to load bookmarks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookmarks();
    }, []);

    const removeBookmark = async (pdfId: string) => {
        try {
            await userApi.toggleBookmark(pdfId);
            setBookmarks(prev => prev.filter(b => b.pdf.id !== pdfId));
            toast.success('Removed from bookmarks');
        } catch (error) {
            toast.error('Failed to remove bookmark');
        }
    };

    return (
        <main className="min-h-screen pb-24">
            <header className="sticky top-0 z-40 glass px-5 py-4">
                <div className="flex items-center gap-4 max-w-lg mx-auto">
                    <Link href="/profile" className="p-2 -ml-2 rounded-full hover:bg-dark-100">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-lg font-semibold">My Bookmarks</h1>
                </div>
            </header>

            <div className="max-w-lg mx-auto px-5 py-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-primary-500" size={32} />
                    </div>
                ) : bookmarks.length === 0 ? (
                    <div className="text-center py-20 bg-dark-100/50 rounded-3xl border border-dashed border-dark-border">
                        <div className="w-16 h-16 rounded-full bg-dark-200 flex items-center justify-center mx-auto mb-4 text-gray-500">
                            <FileText size={32} />
                        </div>
                        <h2 className="text-xl font-bold mb-2">No bookmarks yet</h2>
                        <p className="text-gray-400 mb-6">PDFs you save will appear here.</p>
                        <Link href="/subjects" className="btn-primary inline-flex">
                            Browse Subjects
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookmarks.map((bookmark) => (
                            <div key={bookmark.id} className="card p-4 flex items-center gap-4 group">
                                <Link href={`/pdfs/${bookmark.pdf.id}`} className="flex-1 flex items-center gap-4 min-w-0">
                                    <div className="w-14 h-14 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                        <FileText className="text-red-500" size={24} />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-medium text-white truncate">{bookmark.pdf.title}</h3>
                                        <p className="text-xs text-gray-400 mt-1 truncate">
                                            {bookmark.pdf.folder.name} • {(bookmark.pdf.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                                        </p>
                                    </div>
                                </Link>
                                <button
                                    onClick={() => removeBookmark(bookmark.pdf.id)}
                                    className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <BottomNav />
        </main>
    );
}
