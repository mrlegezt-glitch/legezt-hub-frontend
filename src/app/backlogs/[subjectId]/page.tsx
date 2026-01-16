'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { pdfApi, contentApi } from '@/lib/api';
import PdfCard from '@/components/pdf/PdfCard';
import BottomNav from '@/components/navigation/BottomNav';
import { ArrowLeft, BookOpen, Search } from 'lucide-react';
import Link from 'next/link';

export default function SubjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const subjectId = params.subjectId as string;

    const [subject, setSubject] = useState<any | null>(null);
    const [pdfs, setPdfs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [type, setType] = useState<'theory' | 'lab' | undefined>();

    // Fetch Subject Details & PDFs
    useEffect(() => {
        if (!subjectId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Parallel fetch
                const [subjectRes, pdfsRes] = await Promise.all([
                    contentApi.getSubject(subjectId),
                    pdfApi.list({
                        subjectId,
                        type,
                        search: search || undefined
                    })
                ]);

                setSubject(subjectRes.data.data);
                setPdfs(pdfsRes.data.data);
            } catch (error) {
                console.error('Failed to fetch subject data:', error);
                // Redirect if subject not found? Or show error?
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchData, 300);
        return () => clearTimeout(timer);
    }, [subjectId, type, search]);

    return (
        <main className="min-h-screen pb-24 md:pb-12">
            <div className="max-w-7xl mx-auto px-5 md:px-6 pt-6 md:pt-28">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <div className="hidden md:flex items-center gap-2 text-gray-400 mb-2">
                            <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            <span>/</span>
                            <Link href="/backlogs" className="hover:text-white transition-colors">Backlogs</Link>
                            {subject && (
                                <>
                                    <span>/</span>
                                    <span className="text-white line-clamp-1">{subject.name}</span>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <Link
                                href="/backlogs"
                                className="md:hidden -ml-2 p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                            >
                                <ArrowLeft size={24} />
                            </Link>

                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
                                {subject ? subject.name : 'Loading...'}
                            </h1>
                        </div>

                        <p className="text-gray-400 mt-2">
                            {subject
                                ? `Viewing materials for ${subject.code}`
                                : '...'
                            }
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-72">
                        <input
                            type="text"
                            placeholder="Search materials..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-dark-100 border border-dark-border rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-primary-500 transition-colors placeholder:text-gray-600"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setType(undefined)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${!type ? 'bg-primary-600 text-white' : 'bg-dark-200 text-gray-400 hover:text-white'}`}
                    >
                        All Materials
                    </button>
                    <button
                        onClick={() => setType('theory')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${type === 'theory' ? 'bg-primary-600 text-white' : 'bg-dark-200 text-gray-400 hover:text-white'}`}
                    >
                        Theory Only
                    </button>
                    <button
                        onClick={() => setType('lab')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${type === 'lab' ? 'bg-primary-600 text-white' : 'bg-dark-200 text-gray-400 hover:text-white'}`}
                    >
                        Lab Manuals
                    </button>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 bg-dark-100 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : pdfs.length === 0 ? (
                    <div className="text-center py-20 bg-dark-100/30 rounded-3xl border border-dashed border-dark-border animate-in zoom-in-95">
                        <div className="w-16 h-16 bg-dark-200 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                            <BookOpen size={32} />
                        </div>
                        <h3 className="text-xl font-medium text-gray-300">No materials uploaded yet</h3>
                        <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                            We&apos;re currently updating content for {subject?.name}. Check back soon!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {pdfs.map((pdf) => (
                            <PdfCard key={pdf.id} {...pdf} />
                        ))}
                    </div>
                )}
            </div>

            <BottomNav />
        </main>
    );
}
