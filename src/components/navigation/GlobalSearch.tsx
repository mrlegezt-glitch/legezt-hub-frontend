'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, Music, GraduationCap, ArrowRight, Loader2, PlayCircle } from 'lucide-react';
import { contentApi } from '@/lib/api';
import { tmdb } from '@/lib/tmdb';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function GlobalSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{
        pdfs: any[];
        podcasts: any[];
        courses: any[];
        media?: any[];
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
                const [res, mediaRes] = await Promise.all([
                    contentApi.search(query).catch(() => ({ data: { data: { pdfs: [], podcasts: [], courses: [] } } })),
                    tmdb.searchMulti(query).catch(() => ({ results: [] }))
                ]);

                // Only take top 4 media results to balance the modal
                const topMedia = (mediaRes.results || []).filter((m: any) => m.media_type === 'movie' || m.media_type === 'tv').slice(0, 4);

                setResults({
                    ...res.data.data,
                    media: topMedia
                });
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
                aria-label="Open search"
                aria-expanded={isOpen}
                aria-controls="search-dialog"
            >
                <Search size={20} />
                <span className="sr-only">Search for PDFs, podcasts, or courses</span>
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="search-dialog-title"
                >
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-dark-bg/80 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />

                    {/* Modal Content */}
                    <div
                        id="search-dialog"
                        className="relative w-full max-w-2xl bg-dark-200 border border-dark-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200"
                    >
                        <div className="p-4 border-b border-dark-border flex items-center gap-3">
                            <Search className="text-primary-500" size={20} aria-hidden="true" />
                            <label htmlFor="global-search-input" className="sr-only">
                                Search for PDFs, podcasts, or courses
                            </label>
                            <input
                                id="global-search-input"
                                ref={inputRef}
                                type="search"
                                placeholder="Search for PDFs, podcasts, or courses..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-lg"
                                aria-label="Search for PDFs, podcasts, or courses"
                                aria-autocomplete="list"
                                aria-controls="search-results"
                                role="combobox"
                                aria-expanded={!!results && (results.pdfs.length > 0 || results.podcasts.length > 0 || results.courses.length > 0)}
                            />
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/5 rounded-lg text-gray-500"
                                aria-label="Close search"
                            >
                                <X size={20} aria-hidden="true" />
                            </button>
                        </div>

                        <div
                            id="search-results"
                            className="max-h-[60vh] overflow-y-auto p-2"
                            role="listbox"
                            aria-live="polite"
                            aria-busy={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center py-10" role="status">
                                    <Loader2 className="animate-spin text-primary-500" size={32} aria-hidden="true" />
                                    <span className="sr-only">Loading search results...</span>
                                </div>
                            ) : !results && query.length > 0 && query.length < 2 ? (
                                <div className="py-10 text-center text-gray-500 text-sm">
                                    Keep typing to search...
                                </div>
                            ) : results && (results.pdfs.length > 0 || results.podcasts.length > 0 || results.courses.length > 0 || (results.media && results.media.length > 0)) ? (
                                <div className="space-y-6 p-2">
                                    {/* PDFs */}
                                    {results.pdfs.length > 0 && (
                                        <section aria-labelledby="documents-heading">
                                            <h3 id="documents-heading" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2">Documents</h3>
                                            <div className="space-y-1" role="group" aria-label="PDF documents">
                                                {results.pdfs.map((pdf, index) => (
                                                    <button
                                                        key={pdf.id}
                                                        onClick={() => closeAndNavigate(`/pdfs/${pdf.id}`)}
                                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 group transition-all text-left"
                                                        role="option"
                                                        aria-selected="false"
                                                        aria-label={`Open PDF: ${pdf.title}`}
                                                    >
                                                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500" aria-hidden="true">
                                                            <FileText size={20} />
                                                        </div>
                                                        <span className="flex-1 text-sm font-medium text-gray-300 group-hover:text-white truncate">
                                                            {pdf.title}
                                                        </span>
                                                        <ArrowRight size={14} className="text-gray-700 group-hover:text-primary-500 transition-colors" aria-hidden="true" />
                                                    </button>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Podcasts */}
                                    {results.podcasts.length > 0 && (
                                        <section aria-labelledby="podcasts-heading">
                                            <h3 id="podcasts-heading" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2">Podcasts</h3>
                                            <div className="space-y-1" role="group" aria-label="Podcast episodes">
                                                {results.podcasts.map(pod => (
                                                    <button
                                                        key={pod.id}
                                                        onClick={() => closeAndNavigate(`/podcasts/${pod.id}`)}
                                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 group transition-all text-left"
                                                        role="option"
                                                        aria-selected="false"
                                                        aria-label={`Open podcast: ${pod.title}`}
                                                    >
                                                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500" aria-hidden="true">
                                                            <Music size={20} />
                                                        </div>
                                                        <span className="flex-1 text-sm font-medium text-gray-300 group-hover:text-white truncate">
                                                            {pod.title}
                                                        </span>
                                                        <ArrowRight size={14} className="text-gray-700 group-hover:text-primary-500 transition-colors" aria-hidden="true" />
                                                    </button>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Courses */}
                                    {results.courses.length > 0 && (
                                        <section aria-labelledby="courses-heading">
                                            <h3 id="courses-heading" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2">Academy</h3>
                                            <div className="space-y-1" role="group" aria-label="Available courses">
                                                {results.courses.map(course => (
                                                    <button
                                                        key={course.id}
                                                        onClick={() => closeAndNavigate(`/offers`)}
                                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 group transition-all text-left"
                                                        role="option"
                                                        aria-selected="false"
                                                        aria-label={`View course: ${course.title}`}
                                                    >
                                                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500" aria-hidden="true">
                                                            <GraduationCap size={20} />
                                                        </div>
                                                        <span className="flex-1 text-sm font-medium text-gray-300 group-hover:text-white truncate">
                                                            {course.title}
                                                        </span>
                                                        <ArrowRight size={14} className="text-gray-700 group-hover:text-primary-500 transition-colors" aria-hidden="true" />
                                                    </button>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Movies & TV */}
                                    {results.media && results.media.length > 0 && (
                                        <section aria-labelledby="media-heading">
                                            <h3 id="media-heading" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2">Movies & Series</h3>
                                            <div className="space-y-1" role="group" aria-label="Media items">
                                                {results.media.map(item => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => closeAndNavigate(`/watch/${item.media_type || 'movie'}/${item.id}${item.media_type === 'tv' ? '/1/1' : ''}`)}
                                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 group transition-all text-left"
                                                        role="option"
                                                        aria-selected="false"
                                                        aria-label={`Watch: ${item.title || item.name}`}
                                                    >
                                                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 overflow-hidden relative shrink-0" aria-hidden="true">
                                                            {item.poster_path ? (
                                                                <img src={tmdb.getImageUrl(item.poster_path, 'w500')} alt="" className="w-full h-full object-cover opacity-80" />
                                                            ) : (
                                                                <PlayCircle size={20} />
                                                            )}
                                                        </div>
                                                        <span className="flex-1 text-sm font-medium text-gray-300 group-hover:text-white truncate">
                                                            {item.title || item.name}
                                                        </span>
                                                        <ArrowRight size={14} className="text-gray-700 group-hover:text-primary-500 transition-colors" aria-hidden="true" />
                                                    </button>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>
                            ) : query.length >= 2 ? (
                                <div className="py-20 text-center">
                                    <p className="text-gray-500 text-sm">No results found for &quot;{query}&quot;</p>
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
