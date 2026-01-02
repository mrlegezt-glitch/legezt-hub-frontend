'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, Music, GraduationCap, ArrowRight, Loader2 } from 'lucide-react';
import { contentApi } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function GlobalSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{
        pdfs: any[];
        podcasts: any[];
        courses: any[];
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    useEffect(() => {
        const handleSearch = async () => {
            if (query.length < 2) {
                setResults(null);
                return;
            }
            setLoading(true);
            try {
                const res = await contentApi.search(query);
                setResults(res.data.data);
            } catch (error) {
                console.error('Search error', error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(handleSearch, 300);
        return () => clearTimeout(timer);
    }, [query]);

    // Close on Esc
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const closeAndNavigate = (href: string) => {
        setIsOpen(false);
        setQuery('');
        router.push(href);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
            >
                <Search size={20} />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-dark-bg/80 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative w-full max-w-2xl bg-dark-200 border border-dark-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                        <div className="p-4 border-b border-dark-border flex items-center gap-3">
                            <Search className="text-primary-500" size={20} />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search for PDFs, podcasts, or courses..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-lg"
                            />
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/5 rounded-lg text-gray-500"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-2">
                            {loading ? (
                                <div className="flex items-center justify-center py-10">
                                    <Loader2 className="animate-spin text-primary-500" size={32} />
                                </div>
                            ) : !results && query.length > 0 && query.length < 2 ? (
                                <div className="py-10 text-center text-gray-500 text-sm">
                                    Keep typing to search...
                                </div>
                            ) : results && (results.pdfs.length > 0 || results.podcasts.length > 0 || results.courses.length > 0) ? (
                                <div className="space-y-6 p-2">
                                    {/* PDFs */}
                                    {results.pdfs.length > 0 && (
                                        <section>
                                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2">Documents</h3>
                                            <div className="space-y-1">
                                                {results.pdfs.map(pdf => (
                                                    <button
                                                        key={pdf.id}
                                                        onClick={() => closeAndNavigate(`/pdfs/${pdf.id}`)}
                                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 group transition-all text-left"
                                                    >
                                                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                            <FileText size={20} />
                                                        </div>
                                                        <span className="flex-1 text-sm font-medium text-gray-300 group-hover:text-white truncate">
                                                            {pdf.title}
                                                        </span>
                                                        <ArrowRight size={14} className="text-gray-700 group-hover:text-primary-500 transition-colors" />
                                                    </button>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Podcasts */}
                                    {results.podcasts.length > 0 && (
                                        <section>
                                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2">Podcasts</h3>
                                            <div className="space-y-1">
                                                {results.podcasts.map(pod => (
                                                    <button
                                                        key={pod.id}
                                                        onClick={() => closeAndNavigate(`/podcasts/${pod.id}`)}
                                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 group transition-all text-left"
                                                    >
                                                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                                                            <Music size={20} />
                                                        </div>
                                                        <span className="flex-1 text-sm font-medium text-gray-300 group-hover:text-white truncate">
                                                            {pod.title}
                                                        </span>
                                                        <ArrowRight size={14} className="text-gray-700 group-hover:text-primary-500 transition-colors" />
                                                    </button>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Courses */}
                                    {results.courses.length > 0 && (
                                        <section>
                                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2">Academy</h3>
                                            <div className="space-y-1">
                                                {results.courses.map(course => (
                                                    <button
                                                        key={course.id}
                                                        onClick={() => closeAndNavigate(`/offers`)}
                                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 group transition-all text-left"
                                                    >
                                                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                                                            <GraduationCap size={20} />
                                                        </div>
                                                        <span className="flex-1 text-sm font-medium text-gray-300 group-hover:text-white truncate">
                                                            {course.title}
                                                        </span>
                                                        <ArrowRight size={14} className="text-gray-700 group-hover:text-primary-500 transition-colors" />
                                                    </button>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>
                            ) : query.length >= 2 ? (
                                <div className="py-20 text-center">
                                    <p className="text-gray-500 text-sm">No results found for "{query}"</p>
                                </div>
                            ) : (
                                <div className="py-20 text-center">
                                    <p className="text-gray-600 text-xs">Recently searched tags: Mathematics, BTech, Physics</p>
                                </div>
                            )}
                        </div>

                        <div className="p-3 bg-dark-100/50 border-t border-dark-border flex justify-end">
                            <div className="flex items-center gap-4 text-[10px] text-gray-600">
                                <span className="flex items-center gap-1"><kbd className="bg-dark-200 px-1 rounded border border-dark-border">ESC</kbd> to close</span>
                                <span className="flex items-center gap-1"><kbd className="bg-dark-200 px-1 rounded border border-dark-border">↵</kbd> to select</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
