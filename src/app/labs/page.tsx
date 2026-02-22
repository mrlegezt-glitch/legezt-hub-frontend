'use client';

// ==================================
// Labs Landing Page
// ==================================

import Link from 'next/link';
import { ArrowRight, FlaskConical, Code, BookOpen, TestTube, FileText } from 'lucide-react';
import BottomNav from '@/components/navigation/BottomNav';

export default function LabsPage() {
    return (
        <main className="min-h-screen pb-24 md:pb-12">
            {/* Header */}
            <section className="pt-8 md:pt-32 px-5 md:px-0">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs md:text-sm font-medium mb-6 border border-purple-500/20">
                        <FlaskConical size={14} />
                        Practical Learning
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        Labs & <span className="gradient-text">Practicals</span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
                        Access lab manuals, practical materials, and code exercises for your engineering curriculum.
                    </p>
                </div>
            </section>

            {/* Two Main Cards */}
            <section className="max-w-5xl mx-auto px-5 md:px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Materials Card */}
                    <Link href="/labs/records" className="group">
                        <div className="card md:p-8 p-6 h-full relative overflow-hidden hover:border-purple-500/50 transition-all">

                            <div className="absolute -right-8 -top-8 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-700" />

                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-purple-500/20">
                                <BookOpen className="text-purple-400 group-hover:text-purple-300 transition-colors" size={32} />
                            </div>

                            <h3 className="text-2xl font-bold mb-3">Lab Records</h3>
                            <p className="text-gray-400 mb-8 leading-relaxed">
                                Access digital PDF lab records, manuals, and study guides optimized for your semester and computing branch.
                            </p>
                            <div className="flex flex-wrap gap-2 mb-6">
                                <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs">Chemistry</span>
                                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs">Non-Technical</span>
                            </div>
                            <span className="text-purple-400 font-medium flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                                Browse Materials <ArrowRight size={18} />
                            </span>
                        </div>
                    </Link>

                    {/* LeGeZt Tantra Card */}
                    <Link href="/labs/legezttantra" className="group">
                        <div className="card md:p-8 p-6 h-full relative overflow-hidden hover:border-amber-500/50 transition-all">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Code size={120} />
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6">
                                <Code size={28} />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">LeGeZt Tantra</h3>
                            <p className="text-gray-400 mb-6">
                                Programming exercises with pre-written code, manual PDFs, and test cases.
                            </p>
                            <div className="flex flex-wrap gap-2 mb-6">
                                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs">Java</span>
                                <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs">Python</span>
                                <span className="px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 text-xs">C/C++</span>
                            </div>
                            <span className="text-amber-400 font-medium flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                                Open LeGeZt Lab <ArrowRight size={18} />
                            </span>
                        </div>
                    </Link>
                </div>
            </section>

            {/* Quick Info */}
            <section className="max-w-4xl mx-auto px-5 text-center">
                <div className="p-6 rounded-2xl bg-dark-100/50 border border-dark-border">
                    <FileText className="mx-auto text-gray-500 mb-3" size={24} />
                    <p className="text-gray-400 text-sm">
                        All practical materials are organized experiment-wise. Select a subject to get started.
                    </p>
                </div>
            </section>

            <BottomNav />
        </main>
    );
}
