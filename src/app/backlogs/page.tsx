'use client';

import { useState, useEffect } from 'react';
import { contentApi } from '@/lib/api';
import BacklogFilters from '@/components/backlog/BacklogFilters';
import SubjectCard from '@/components/backlog/SubjectCard';
import BottomNav from '@/components/navigation/BottomNav';
import { BookOpen, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BacklogPage() {
    const router = useRouter();
    const [yearId, setYearId] = useState<string | undefined>();
    const [semesterId, setSemesterId] = useState<string | undefined>();
    const [type, setType] = useState<'theory' | 'lab' | undefined>();
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [subjects, setSubjects] = useState<any[]>([]);

    // Fetch Subjects
    useEffect(() => {
        const fetchSubjects = async () => {
            setLoading(true);
            try {
                const res = await contentApi.getSubjectsList({
                    yearId,
                    semesterId,
                    search: search || undefined
                });
                setSubjects(res.data.data);
            } catch (error) {
                console.error('Failed to fetch subjects:', error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchSubjects, 300);
        return () => clearTimeout(timer);
    }, [yearId, semesterId, search]);

    return (
        <main className="min-h-screen pb-24 md:pb-12">
            {/* Mobile Header (Replaced by Global MobileHeader) */}

            <div className="max-w-7xl mx-auto px-5 md:px-6 pt-6 md:pt-28">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <div className="hidden md:flex items-center gap-2 text-gray-400 mb-2">
                            <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            <span>/</span>
                            <span className="text-white">Backlogs</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
                            Backlog Resources
                        </h1>
                        <p className="text-gray-400 mt-2">
                            Find study material for any semester, filtered precisely for your needs.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-72">
                        <input
                            type="text"
                            placeholder="Search subjects..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white dark:bg-dark-100 border border-gray-300 dark:border-dark-border rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-primary-500 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600 text-gray-800 dark:text-white"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    </div>
                </div>

                {/* Filters */}
                <BacklogFilters
                    yearId={yearId}
                    semesterId={semesterId}
                    type={type}
                    onYearChange={setYearId}
                    onSemesterChange={setSemesterId}
                    onTypeChange={setType}
                />

                {/* View: Subject Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-40 bg-dark-100 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : subjects.length === 0 ? (
                    <div className="text-center py-20 bg-dark-100/30 rounded-3xl border border-dashed border-dark-border">
                        <BookOpen size={48} className="mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-medium text-gray-300">No subjects found</h3>
                        <p className="text-gray-500 mt-2">Try selecting a different year or semester.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {subjects.map((subject) => (
                            <SubjectCard
                                key={subject.id}
                                {...subject}
                                onClick={() => router.push(`/backlogs/${subject.id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <BottomNav />
        </main>
    );
}

