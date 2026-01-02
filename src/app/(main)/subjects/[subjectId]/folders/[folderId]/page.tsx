'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { FileText, ArrowLeft, Loader2, Download, Eye, Calendar, HardDrive } from 'lucide-react';
import { toast } from 'sonner';

interface Folder {
    id: string;
    name: string;
    path: string;
}

interface PDF {
    id: string;
    title: string;
    fileName: string;
    sizeFormatted: string;
    description: string | null;
    createdAt: string;
}

export default function FolderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [folder, setFolder] = useState<Folder | null>(null);
    const [pdfs, setPdfs] = useState<PDF[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!params.folderId) return;

                // Fetch Folder Details
                const folderRes = await api.get(`/pdfs/folders/${params.folderId}`);
                setFolder(folderRes.data.data);

                // Fetch PDFs in this folder
                const pdfsRes = await api.get(`/pdfs?folderId=${params.folderId}`);
                setPdfs(pdfsRes.data.data);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load folder content');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [params.folderId]);

    const handleView = (pdf: PDF) => {
        // Navigate to in-app PDF viewer
        router.push(`/pdfs/${pdf.id}`);
    };

    const handleDownload = async (pdf: PDF) => {
        try {
            const res = await api.get(`/pdfs/${pdf.id}/download`);
            const link = document.createElement('a');
            link.href = res.data.data.url;
            link.setAttribute('download', res.data.data.fileName); // browser hint
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Failed to download PDF');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 text-white flex justify-center">
                <Loader2 className="animate-spin text-primary-500" size={40} />
            </div>
        );
    }

    if (!folder) {
        return (
            <div className="min-h-screen pt-24 px-6 text-white text-center">
                <div className="max-w-md mx-auto bg-dark-200 border border-dark-border rounded-2xl p-8">
                    <h1 className="text-2xl font-bold mb-2">Folder Not Found</h1>
                    <button onClick={() => router.back()} className="btn-secondary w-full py-3 rounded-xl mt-4">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 md:pt-28 px-6 md:px-12 text-white pb-24">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} className="mr-2" /> Back
                    </button>
                    <h1 className="text-3xl font-bold mb-2">
                        <span className="gradient-text">{folder.name}</span>
                    </h1>
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                        <HardDrive size={14} />
                        {pdfs.length} files
                    </p>
                </div>

                {/* PDF List */}
                <div className="space-y-4">
                    {pdfs.length > 0 ? (
                        pdfs.map((pdf) => (
                            <div
                                key={pdf.id}
                                className="bg-dark-200 border border-dark-border hover:border-primary-500/50 rounded-2xl p-5 transition-all duration-300 group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-white mb-1 group-hover:text-primary-400 transition-colors">
                                                {pdf.title}
                                            </h3>
                                            <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                                                {pdf.description || pdf.fileName}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <HardDrive size={12} /> {pdf.sizeFormatted}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} /> {new Date(pdf.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={() => handleView(pdf)}
                                            className="p-3 bg-dark-300 hover:bg-primary-500/20 hover:text-primary-400 rounded-xl transition-colors"
                                            title="View in browser"
                                        >
                                            <Eye size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDownload(pdf)}
                                            className="p-3 bg-dark-300 hover:bg-primary-500/20 hover:text-primary-400 rounded-xl transition-colors"
                                            title="Download PDF"
                                        >
                                            <Download size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-dark-200/50 rounded-3xl border border-dark-border border-dashed">
                            <FileText size={48} className="mx-auto text-gray-600 mb-4" />
                            <h3 className="text-xl font-bold text-gray-400">No Files Yet</h3>
                            <p className="text-gray-500">This folder is empty.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
