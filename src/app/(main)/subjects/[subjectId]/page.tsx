'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Folder, FileText, ChevronRight, Loader2, ArrowLeft, Download, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

interface Resource {
    id: string;
    title: string;
    type: 'NOTES' | 'PYQ' | 'SYLLABUS';
    fileUrl: string;
}

interface SubjectFolder {
    id: string;
    name: string;
    _count?: {
        pdfs: number;
    };
    resources: Resource[];
}

interface SubjectDetail {
    id: string;
    name: string;
    code: string;
    folders: SubjectFolder[];
}

export default function SubjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [subject, setSubject] = useState<SubjectDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSubject = async () => {
            try {
                // Ensure we have a subject ID
                if (!params.subjectId) return;

                const res = await api.get(`/content/subjects/${params.subjectId}`);
                setSubject(res.data.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load subject details');
            } finally {
                setLoading(false);
            }
        };

        fetchSubject();
    }, [params.subjectId]);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 text-white flex justify-center">
                <Loader2 className="animate-spin text-primary-500" size={40} />
            </div>
        );
    }

    if (error || !subject) {
        return (
            <div className="min-h-screen pt-24 px-6 text-white text-center">
                <div className="max-w-md mx-auto bg-dark-200 border border-dark-border rounded-2xl p-8">
                    <h1 className="text-2xl font-bold mb-2">Subject Not Found</h1>
                    <p className="text-gray-400 mb-6">
                        We couldn&apos;t load the details for this subject.
                    </p>
                    <button onClick={() => router.back()} className="btn-secondary w-full py-3 rounded-xl">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const isGodMode = user?.email === 'mrlegezt@gmail.com';

    return (
        <div className="min-h-screen pt-24 px-6 md:px-12 text-white pb-24">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors text-sm"
                        >
                            <ArrowLeft size={18} className="mr-2" /> Back to Subjects
                        </button>
                        <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tighter">
                            <span className="gradient-text">{subject!.name}</span>
                        </h1>
                        <p className="text-gray-500 font-mono text-sm tracking-widest uppercase">{subject!.code}</p>
                    </div>

                    {/* God Mode Manage Button */}
                    {isGodMode && (
                        <Link
                            href={`/admin/pdfs?subjectId=${subject!.id}`}
                            className="group relative px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition-all overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <Sparkles size={20} className="text-yellow-500" />
                            <span className="text-sm font-bold uppercase tracking-widest text-white">Manage Resources</span>
                        </Link>
                    )}
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {subject.folders && subject.folders.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {subject.folders.map((folder) => (
                                <Link
                                    key={folder.id}
                                    href={`/subjects/${subject.id}/folders/${folder.id}`} // Assuming nested navigation or just expansion
                                    className="group bg-dark-200 hover:bg-dark-300 border border-dark-border hover:border-primary-500/50 rounded-2xl p-6 transition-all duration-300"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Folder size={24} />
                                        </div>
                                        <ChevronRight className="text-gray-500 group-hover:text-white transition-colors" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-1">{folder.name}</h3>
                                    <p className="text-sm text-gray-500">{folder._count?.pdfs || 0} files</p>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-dark-200/50 rounded-3xl border border-dark-border border-dashed">
                            <FileText size={48} className="mx-auto text-gray-600 mb-4" />
                            <h3 className="text-xl font-bold text-gray-400">No Content Yet</h3>
                            <p className="text-gray-500">This subject doesn&apos;t have any uploaded materials.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
