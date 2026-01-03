'use client';

// ==================================
// PDF Viewer Page
// ==================================

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Share2,
    Download,
    Heart
} from 'lucide-react';
import { pdfApi, userApi } from '@/lib/api';
import { toast } from 'sonner';
import { NativePDFViewer } from './components/NativePDFViewer';

interface PdfData {
    url: string;
    title: string;
    pageCount: number | null;
    isBookmarked?: boolean;
}

export default function PdfViewerPage() {
    const params = useParams();
    const router = useRouter();
    const pdfId = params.id as string;

    const [pdfData, setPdfData] = useState<PdfData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isBookmarked, setIsBookmarked] = useState(false);

    const [needsLogin, setNeedsLogin] = useState(false);

    useEffect(() => {
        const fetchPdf = async () => {
            try {
                // Fetch both view URL and metadata
                const [viewRes, metaRes] = await Promise.all([
                    pdfApi.getViewUrl(pdfId),
                    pdfApi.get(pdfId)
                ]);

                setPdfData({
                    ...viewRes.data.data,
                    isBookmarked: metaRes.data.data.isBookmarked
                });
                setIsBookmarked(metaRes.data.data.isBookmarked);
            } catch (error: any) {
                console.error('Failed to load PDF:', error);
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    setNeedsLogin(true);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPdf();
    }, [pdfId]);

    const handleToggleBookmark = async () => {
        try {
            await userApi.toggleBookmark(pdfId);
            setIsBookmarked(!isBookmarked);
            toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
        } catch (error) {
            toast.error('Failed to update bookmark');
        }
    };


    const handleDownload = async () => {
        try {
            const response = await pdfApi.getDownloadUrl(pdfId);
            const { url, fileName } = response.data.data;

            // Open download URL
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Failed to download:', error);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: pdfData?.title || 'PDF',
                    url: window.location.href,
                });
            } catch (error) {
                // User cancelled
            }
        } else {
            // Fallback - copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-300">
                <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (needsLogin) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-dark-300 p-6 text-center">
                <div className="w-20 h-20 bg-dark-200 rounded-full flex items-center justify-center mb-6 shadow-xl border border-dark-border">
                    <span className="text-4xl">🔒</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Login Required</h2>
                <p className="text-gray-400 mb-8 max-w-md">
                    You have to login to see this content. Use the button below to sign in.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-2.5 rounded-xl border border-dark-border hover:bg-white/5 text-gray-300 font-medium transition-colors"
                    >
                        Go Home
                    </button>
                    <button
                        onClick={() => router.push(`/login?redirect=/pdfs/${pdfId}`)}
                        className="px-8 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all hover:scale-105 active:scale-95"
                    >
                        Login to View
                    </button>
                </div>
            </div>
        );
    }

    if (!pdfData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-dark-300 p-5">
                <p className="text-gray-400 mb-4">Failed to load PDF</p>
                <button onClick={() => router.back()} className="btn-primary">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
            {/* Compact Top Bar */}
            <header className="flex-shrink-0 h-14 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 px-4 flex items-center justify-between z-50">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="font-medium truncate text-sm md:text-base">
                        {pdfData.title}
                    </h1>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={handleToggleBookmark}
                        className={`p-2 rounded-lg transition-colors ${isBookmarked ? 'text-red-400 bg-red-500/20' : 'hover:bg-gray-700 text-gray-400'}`}
                        title={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
                    >
                        <Heart size={20} fill={isBookmarked ? "currentColor" : "none"} />
                    </button>
                    <button
                        onClick={handleShare}
                        className="p-2 rounded-lg hover:bg-gray-700 text-gray-400"
                        title="Share"
                    >
                        <Share2 size={20} />
                    </button>
                    <button
                        onClick={handleDownload}
                        className="p-2 rounded-lg hover:bg-gray-700 text-amber-400"
                        title="Download"
                    >
                        <Download size={20} />
                    </button>
                </div>
            </header>

            {/* PDF Content - Full Height */}
            <div className="flex-1 relative bg-gray-800 overflow-hidden">
                <NativePDFViewer url={pdfData.url} />
            </div>
        </div>
    );
}
