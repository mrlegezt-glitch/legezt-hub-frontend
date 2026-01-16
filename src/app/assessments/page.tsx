'use client';

import { useState, useEffect } from 'react';
import { FileText, Calendar, Clock, ArrowRight, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { assessmentApi } from '@/lib/api';

export default function AssessmentsPage() {
    const [assessments, setAssessments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatDate = (dateString: string) => {
        try {
            return new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric'
            }).format(new Date(dateString));
        } catch (e) {
            return 'N/A';
        }
    };

    useEffect(() => {
        fetchAssessments();
    }, []);

    const fetchAssessments = async () => {
        try {
            const res = await assessmentApi.getMine();
            setAssessments(res.data.data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to load assessments');
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <main className="pt-24 md:pt-32 pb-12 px-6 max-w-7xl mx-auto">
                {/* Hero section */}
                <div className="relative rounded-[2.5rem] overflow-hidden mb-12 group">
                    <div className="absolute inset-0 bg-slate-900">
                        <img src="/assets/assessments_hero.png" alt="" className="w-full h-full object-cover opacity-40 scale-105 group-hover:scale-100 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
                    </div>

                    <div className="relative p-10 md:p-16 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="max-w-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-indigo-500/20 backdrop-blur-md">Academic Gateway</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
                                Assessments & <span className="text-indigo-400 italic">Tests</span>
                            </h1>
                            <p className="text-slate-400 text-lg font-medium leading-relaxed">
                                Access your handcrafted assignments and surprise evaluation materials designed to sharpen your skills.
                            </p>
                        </div>

                        <div className="hidden lg:block shrink-0">
                            <div className="w-48 h-48 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center p-6 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                <FileText className="text-indigo-400" size={80} strokeWidth={1} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters/Actions Placeholder */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Pending Submissions</h2>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Papers...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-100 p-8 rounded-2xl text-center max-w-md mx-auto">
                        <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
                        <p className="text-red-800 font-bold mb-2">Error Accessing Records</p>
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                ) : assessments.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-3xl">
                        <FileText className="text-slate-200 mx-auto mb-6" size={80} />
                        <h3 className="text-slate-800 font-bold text-xl">No pending assessments</h3>
                        <p className="text-slate-500 mt-2 max-w-sm mx-auto">Your instructors haven&apos;t posted any assignments or surprise tests for your section yet.</p>
                    </div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {assessments.map((item) => (
                            <motion.div key={item.id} variants={itemVariants} className="group cursor-pointer">
                                {/* A4 Paper Visual Container */}
                                <Link href={item.pdfUrl} target="_blank" className="relative block">
                                    {/* Paper Stack Shadow Effect */}
                                    <div className="absolute inset-0 bg-slate-200/50 translate-x-1.5 translate-y-1.5 rounded-sm -z-10 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-300"></div>
                                    <div className="absolute inset-0 bg-slate-300/30 translate-x-0.5 translate-y-0.5 rounded-sm -z-10 group-hover:translate-x-1.5 group-hover:translate-y-1.5 transition-transform duration-300"></div>

                                    {/* The "Paper" */}
                                    <div className="bg-white aspect-[1/1.414] border border-slate-200 shadow-sm rounded-sm p-6 flex flex-col relative overflow-hidden group-hover:border-indigo-300 group-hover:-translate-y-2 transition-all duration-300">
                                        {/* Paper Accent Lines (Simulating text) */}
                                        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                                            <div className="absolute top-0 right-0 border-[32px] border-transparent border-t-indigo-50 border-r-indigo-50 group-hover:border-t-indigo-100 group-hover:border-r-indigo-100 transition-colors"></div>
                                            {item.type === 'SURPRISE_TEST' && (
                                                <div className="absolute top-2 right-2 -rotate-45 font-black text-[8px] tracking-tighter text-indigo-500/40 uppercase">Top Secret</div>
                                            )}
                                        </div>

                                        {/* Header */}
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === 'SURPRISE_TEST' ? 'bg-orange-50 text-orange-500' : 'bg-indigo-50 text-indigo-500'}`}>
                                                <FileText size={16} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                {item.type.replace('_', ' ')}
                                            </span>
                                        </div>

                                        {/* Subject (Small badge style) */}
                                        <div className="mb-3">
                                            <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase tracking-wider">
                                                {item.subject?.code || 'GEN-01'}
                                            </span>
                                        </div>

                                        {/* Title (Handwritten look font or bold sans) */}
                                        <h3 className="text-lg font-bold text-slate-800 leading-tight mb-4 min-h-[3rem] line-clamp-2">
                                            {item.title}
                                        </h3>

                                        {/* Metadata */}
                                        <div className="mt-auto space-y-2 pt-4 border-t border-slate-100">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Calendar size={14} />
                                                <span className="text-[11px] font-bold uppercase tracking-tight">
                                                    Post: {formatDate(item.createdAt)}
                                                </span>
                                            </div>
                                            {item.submissionDate && (
                                                <div className="flex items-center gap-2 text-rose-500">
                                                    <Clock size={14} />
                                                    <span className="text-[11px] font-black uppercase tracking-tight">
                                                        Due: {formatDate(item.submissionDate)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Open Action Bar */}
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-transparent group-hover:bg-indigo-500 transition-all"></div>
                                    </div>

                                    {/* Card Label Below (External) */}
                                    <div className="mt-4 flex items-center justify-between px-1">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.title}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">{item.section ? `Section ${item.section}` : 'Full Class'}</span>
                                        </div>
                                        <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Visual Legend */}
                <div className="mt-20 flex flex-wrap gap-8 py-8 border-t border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded bg-indigo-500 shadow-sm"></div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Assignments</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded bg-orange-500 shadow-sm"></div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Surprise Tests</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
