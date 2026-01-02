'use client';

// ==================================
// PDFs Page
// ==================================

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Search, Filter, Folder } from 'lucide-react';
import Link from 'next/link';
import BottomNav from '@/components/navigation/BottomNav';
import PdfCard from '@/components/pdf/PdfCard';
import { pdfApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { QuoteLoader } from '@/components/ui/QuoteLoader';

interface Pdf {
    id: string;
    title: string;
    description?: string;
    sizeFormatted: string;
    downloadCount: number;
    viewCount: number;
}

interface FolderType {
    id: string;
    name: string;
    _count: { children: number; pdfs: number };
}

export default function PdfsPage() {
    const searchParams = useSearchParams();
    const semesterId = searchParams.get('semester');
    const folderId = searchParams.get('folder');

    const [searchQuery, setSearchQuery] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['pdfs', { semesterId, folderId }],
        queryFn: async () => {
            const [pdfsRes, foldersRes] = await Promise.all([
                pdfApi.list({ folderId: folderId || undefined }),
                pdfApi.getFolders({ subjectId: folderId ? undefined : semesterId || undefined, parentId: folderId || undefined }),
            ]);
            return {
                pdfs: pdfsRes.data.data,
                folders: foldersRes.data.data
            };
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const pdfs = data?.pdfs || [];
    const folders = data?.folders || [];

    const filteredPdfs = searchQuery
        ? pdfs.filter((pdf: Pdf) =>
            pdf.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : pdfs;

    return (
        <main className="min-h-screen pb-24 md:pb-12">
            {/* Mobile Header (Hidden on Desktop) */}
            <header className="md:hidden sticky top-0 z-40 glass px-5 py-4">
                <div className="flex items-center gap-4 max-w-lg mx-auto">
                    <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-dark-100">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-lg font-semibold flex-1">PDFs</h1>
                </div>
            </header>

            <div className="max-w-lg md:max-w-7xl mx-auto px-5 md:px-6 md:pt-8">
                {/* Desktop Title & Controls */}
                <div className="hidden md:flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">PDF Library</h1>
                        <p className="text-gray-400 mt-1">Browse notes, papers, and books</p>
                    </div>

                    {/* Desktop Search Bar */}
                    <div className="relative w-96">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search PDFs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input pl-11 pr-4 bg-dark-100 border-dark-border focus:bg-dark-200"
                        />
                    </div>
                </div>

                {/* Mobile Search (Hidden on Desktop) */}
                <section className="md:hidden py-4">
                    <div className="relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search PDFs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input pl-11 pr-12"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-dark-100">
                            <Filter size={18} className="text-gray-400" />
                        </button>
                    </div>
                </section>

                {/* Folders */}
                {folders.length > 0 && (
                    <section className="pb-6 md:pb-10">
                        <h2 className="text-sm font-medium text-gray-400 mb-3 md:mb-4">Folders</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                            {folders.map((folder: FolderType) => (
                                <Link
                                    key={folder.id}
                                    href={`/pdfs?folder=${folder.id}`}
                                    className="card-hover p-4 flex items-center gap-3 bg-dark-100/50"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                                        <Folder size={18} className="text-yellow-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium truncate">{folder.name}</p>
                                        <p className="text-xs text-gray-400">
                                            {folder._count.pdfs} files
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* PDF List */}
                <section>
                    {folders.length > 0 && pdfs.length > 0 && (
                        <h2 className="text-sm font-medium text-gray-400 mb-3">Files</h2>
                    )}

                    {isLoading ? (
                        <QuoteLoader />
                    ) : filteredPdfs.length === 0 ? (
                        <div className="text-center py-12 md:py-24 bg-dark-100/30 rounded-3xl border border-dashed border-dark-border">
                            <Folder size={48} className="mx-auto text-dark-border mb-4" />
                            <p className="text-gray-400">No PDFs found in this location</p>
                        </div>
                    ) : (
                        <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
                            {filteredPdfs.map((pdf: Pdf) => (
                                <div key={pdf.id} className="h-full">
                                    <PdfCard {...pdf} />
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Native Ad */}

            </div>

            <BottomNav />
        </main>
    );
}

