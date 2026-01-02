'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BookOpen, AlertCircle, Loader2, ArrowRight, ArrowLeft, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

interface Subject {
    id: string;
    name: string;
    code: string;
    description?: string;
}

export default function SubjectsPage() {
    const { user, isAuthenticated } = useAuthStore();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await api.get('/content/mine/subjects');
                setSubjects(res.data.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load subjects');
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchSubjects();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 text-white flex justify-center">
                <Loader2 className="animate-spin text-primary-500" size={40} />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen pt-24 px-6 text-white text-center">
                <div className="max-w-md mx-auto bg-dark-200 border border-dark-border rounded-2xl p-8">
                    <BookOpen size={48} className="mx-auto text-primary-500 mb-4" />
                    <h1 className="text-2xl font-bold mb-2">My Subjects</h1>
                    <p className="text-gray-400 mb-6">Please login to view subjects relevant to your semester.</p>
                    <Link href="/login" className="btn-primary w-full py-3 rounded-xl block">
                        Login Now
                    </Link>
                </div>
            </div>
        );
    }

    // Case: User logged in but no subjects
    if (subjects.length === 0 && !error) {
        const isGodMode = user?.email === 'mrlegezt@gmail.com';
        const needsOnboarding = (!user?.collegeName || !user?.semesterName) && !isGodMode;

        if (needsOnboarding) {
            return (
                <div className="min-h-screen pt-24 px-6 text-white text-center">
                    <div className="max-w-md mx-auto bg-dark-200 border border-dark-border rounded-2xl p-8">
                        <AlertCircle size={48} className="mx-auto text-yellow-500 mb-4" />
                        <h1 className="text-2xl font-bold mb-2">Complete Your Profile</h1>
                        <p className="text-gray-400 mb-6">
                            Please select your College, Branch, and Semester to see the relevant subjects for your course.
                        </p>
                        <Link href="/profile/settings" className="btn-primary w-full py-3 rounded-xl block">
                            Select Details
                        </Link>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen pt-24 px-6 text-white text-center">
                <div className="max-w-md mx-auto bg-dark-200 border border-dark-border rounded-2xl p-8">
                    <BookOpen size={48} className="mx-auto text-primary-500 mb-4" />
                    <h1 className="text-2xl font-bold mb-2">No Subjects Yet</h1>
                    <p className="text-gray-400 mb-6">
                        We haven&apos;t added subjects for <span className="text-white font-medium">{user?.semesterName || 'this semester'}</span> yet. Check back soon!
                    </p>
                    {user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' ? (
                        <Link href="/admin/dashboard" className="btn-primary w-full py-3 rounded-xl block">
                            Add Subjects in Admin
                        </Link>
                    ) : (
                        <Link href="/" className="text-primary-400 hover:underline">
                            Return to Explore
                        </Link>
                    )}
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen pt-24 md:pt-28 px-6 md:px-12 text-white pb-24">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 relative">
                    {/* Mobile Back Button */}
                    <div className="md:hidden -ml-2 mb-4">
                        <Link href="/" className="p-2 inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft size={20} />
                            <span className="text-sm font-medium">Back</span>
                        </Link>
                    </div>

                    {user?.collegeName ? (
                        <div className="flex items-center gap-6 mb-2 animate-fade-in text-left">
                            {user.collegeLogo && (
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/5 border border-white/10 p-2 flex items-center justify-center shrink-0 shadow-xl shadow-black/20 overflow-hidden relative">
                                    <img
                                        src={user.collegeLogo}
                                        alt={user.collegeName}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                        }}
                                    />
                                    {/* Fallback Icon (Hidden by default, shown on error) */}
                                    <div className="hidden absolute inset-0 flex items-center justify-center text-gray-500">
                                        <Building2 size={32} />
                                    </div>
                                </div>
                            )}
                            <div>
                                <h1 className="text-2xl md:text-4xl font-bold leading-tight">
                                    <span className="gradient-text">{user.collegeName}</span>
                                </h1>
                                <p className="text-gray-400 mt-2 flex items-center gap-2 text-sm md:text-base">
                                    <span className="inline-block w-2 h-2 rounded-full bg-primary-500 shrink-0"></span>
                                    <span className="truncate max-w-[200px] md:max-w-none">
                                        {user.branchName} • {user.semesterName}
                                    </span>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-3xl font-bold mb-2">
                                <span className="gradient-text">My Subjects</span>
                            </h1>
                            <p className="text-gray-400">
                                Based on your enrolled semester
                            </p>
                        </>
                    )}
                </header>

                {error ? (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl">
                        {error}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subjects.map((subject) => (
                            <Link
                                href={`/subjects/${subject.id}`}
                                key={subject.id}
                                className="group relative bg-dark-200 hover:bg-dark-300 border border-dark-border hover:border-primary-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary-900/10"
                            >
                                <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <BookOpen size={64} />
                                </div>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <BookOpen size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-1 group-hover:text-primary-400 transition-colors">
                                        {subject.name}
                                    </h3>
                                    <p className="text-sm font-mono text-gray-500 mb-4">{subject.code}</p>

                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
                                        View Resources <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
