'use client';

// ==================================
// Explore Page (Landing)
// ==================================

import Link from 'next/link';
import { ArrowRight, FileText, Headphones, BookOpen, Lock, Sparkles, History } from 'lucide-react';
import BottomNav from '@/components/navigation/BottomNav';
import { useAuthStore } from '@/stores/authStore';
import MeteorShower from '@/components/effects/MeteorShower';
import RecentlyViewed from '@/components/dashboard/RecentlyViewed';

export default function ExplorePage() {
    const { isAuthenticated, user } = useAuthStore();

    return (
        <main className="min-h-screen pb-24 md:pb-12 relative">
            {/* Meteor Shower Background */}
            <MeteorShower />

            {/* Mobile Header (Replaced by Global MobileHeader) */}


            {/* Hero Section */}
            <section className="relative pt-8 md:pt-32 px-5 md:px-0">
                <div className="max-w-4xl mx-auto text-center">
                    {isAuthenticated && user?.role === 'SUPER_ADMIN' ? (
                        <>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs md:text-sm font-medium mb-6 border border-purple-500/20">
                                <Sparkles size={14} />
                                System Privileges Active
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                                Welcome, <span className="gradient-text">Super Admin</span>
                            </h1>
                            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
                                Monitor platform activity, manage users, and control content distribution from your command center.
                            </p>
                            <div className="flex items-center justify-center gap-4">
                                <Link href="/admin/dashboard" className="btn-primary px-8 py-3 rounded-xl text-lg flex items-center gap-2 shadow-xl shadow-primary-600/20 hover:scale-105 transition-transform">
                                    Admin Dashboard <ArrowRight size={20} />
                                </Link>
                                <Link href="/subjects" className="px-8 py-3 rounded-xl text-lg font-medium bg-dark-100 hover:bg-dark-200 transition-colors border border-white/5">
                                    View Subjects
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 text-xs md:text-sm font-medium mb-6 border border-primary-500/20">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                                </span>
                                New Semantic Search Available
                            </div>

                            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                                Your Ultimate <br className="hidden md:block" />
                                <span className="gradient-text">Engineering Hub</span>
                            </h1>
                            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
                                Access university notes, listen to concept podcasts, and enroll in premium courses.
                                Curated for success.
                            </p>

                            <div className="flex items-center justify-center gap-4">
                                {isAuthenticated ? (
                                    <Link href="/subjects" className="btn-primary px-8 py-3 rounded-xl text-lg flex items-center gap-2">
                                        My Subjects <ArrowRight size={20} />
                                    </Link>
                                ) : (
                                    <Link href="/login" className="btn-primary px-8 py-3 rounded-xl text-lg flex items-center gap-2 shadow-xl shadow-primary-600/20 hover:scale-105 transition-transform">
                                        Get Started <ArrowRight size={20} />
                                    </Link>
                                )}
                                <Link href="/podcasts" className="px-8 py-3 rounded-xl text-lg font-medium bg-dark-100 hover:bg-dark-200 transition-colors border border-white/5">
                                    Browse
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Recently Viewed (Jump Back In) */}
            {isAuthenticated && (
                <section className="max-w-7xl mx-auto px-5 md:px-6 mt-8 relative z-20">
                    <RecentlyViewed />
                </section>
            )}

            {/* Features Grid - 2x2 */}
            <section className="max-w-7xl mx-auto px-5 md:px-6 py-8 md:py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Subjects Library */}
                    <Link href="/subjects" className="card md:p-8 p-6 group relative overflow-hidden flex flex-col">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-blue-400">
                                Library
                            </span>
                        </div>
                        <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden relative mb-6 border border-white/10 shadow-xl group-hover:border-blue-500/50 transition-all duration-500">
                            <img src="/assets/subjects_hero.png" alt="Subjects" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-black mb-3 tracking-tight">Your <span className="text-blue-400 italic">Subjects</span></h3>
                            <p className="text-gray-400 mb-6 text-sm leading-relaxed">Subject-wise organized notes, question papers, and syllabus material.</p>
                            <div className="text-blue-400 font-bold flex items-center gap-2 group-hover:translate-x-1 transition-transform mt-auto">
                                View Subjects <ArrowRight size={16} />
                            </div>
                        </div>
                    </Link>

                    {/* Backlogs & Archives */}
                    <Link href="/backlogs" className="card md:p-8 p-6 group relative overflow-hidden flex flex-col">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-black uppercase tracking-widest text-red-400">
                                Repository
                            </span>
                        </div>
                        <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden relative mb-6 border border-white/10 shadow-xl group-hover:border-red-500/50 transition-all duration-500">
                            <img src="/assets/archives_hero.png" alt="Archives" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-red-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-black mb-3 tracking-tight">Backlogs & <span className="text-red-400 italic">Archives</span></h3>
                            <p className="text-gray-400 mb-6 text-sm leading-relaxed">Access materials from any semester, organized and year-wise filtered.</p>
                            <div className="text-red-400 font-bold flex items-center gap-2 group-hover:translate-x-1 transition-transform mt-auto">
                                Browse Archives <ArrowRight size={16} />
                            </div>
                        </div>
                    </Link>

                    {/* Podcasts */}
                    <Link href="/podcasts" className="card md:p-8 p-6 group relative overflow-hidden flex flex-col">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-black uppercase tracking-widest text-green-400">
                                Audio Hub
                            </span>
                        </div>
                        <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden relative mb-6 border border-white/10 shadow-xl group-hover:border-green-500/50 transition-all duration-500">
                            <img src="/assets/podcasts_hero.png" alt="Podcasts" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-green-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-black mb-3 tracking-tight">LeGeZt<span className="text-green-400 italic">Cast</span></h3>
                            <p className="text-gray-400 mb-6 text-sm leading-relaxed">Listen to summaries and lectures on the go with our AI-powered audio hub.</p>
                            <div className="text-green-400 font-bold flex items-center gap-2 group-hover:translate-x-1 transition-transform mt-auto">
                                Listen Now <ArrowRight size={16} />
                            </div>
                        </div>
                    </Link>

                    {/* Courses */}
                    <Link href="/offers" className="card md:p-8 p-6 group relative overflow-hidden flex flex-col">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-black uppercase tracking-widest text-orange-400">
                                Certification
                            </span>
                        </div>
                        <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden relative mb-6 border border-white/10 shadow-xl group-hover:border-orange-500/50 transition-all duration-500">
                            <img src="/assets/courses_hero.png" alt="Courses" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-black mb-3 tracking-tight">Premium <span className="text-orange-400 italic">Courses</span></h3>
                            <p className="text-gray-400 mb-6 text-sm leading-relaxed">Structured learning paths and expert-led certifications to boost your career.</p>
                            <div className="text-orange-400 font-bold flex items-center gap-2 group-hover:translate-x-1 transition-transform mt-auto">
                                View Offers <ArrowRight size={16} />
                            </div>
                        </div>
                    </Link>

                    {/* Assignments & Tests */}
                    <Link href="/assessments" className="card md:p-8 p-6 group relative overflow-hidden flex flex-col">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-black uppercase tracking-widest text-purple-400">
                                Evaluation
                            </span>
                        </div>
                        <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden relative mb-6 border border-white/10 shadow-xl group-hover:border-purple-500/50 transition-all duration-500">
                            <img src="/assets/assessments_hero.png" alt="Assessments" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-black mb-3 tracking-tight">Assignments & <span className="text-purple-400 italic">Tests</span></h3>
                            <p className="text-gray-400 mb-6 text-sm leading-relaxed">Personalized academic tasks and surprise evaluations in a unified dashboard.</p>
                            <div className="text-purple-400 font-bold flex items-center gap-2 group-hover:translate-x-1 transition-transform mt-auto">
                                Explore Assessments <ArrowRight size={16} />
                            </div>
                        </div>
                    </Link>
                </div>
            </section>

            {/* Authenticated Preview Notice */}
            {!isAuthenticated && (
                <section className="max-w-4xl mx-auto px-5 text-center pb-12">
                    <div className="p-8 rounded-3xl bg-gradient-to-b from-dark-100 to-transparent border border-white/5">
                        <Lock className="mx-auto text-gray-500 mb-4" size={32} />
                        <h2 className="text-2xl font-bold mb-2">Member Exclusive Content</h2>
                        <p className="text-gray-400 mb-6">
                            Browse freely, but you&apos;ll need to login to open documents, play full podcasts, or enroll.
                        </p>
                        <Link href="/login" className="text-primary-400 hover:text-primary-300 font-semibold">
                            Login / Sign Up
                        </Link>
                    </div>
                </section>
            )}

            {/* Bottom Navigation (Hidden on Desktop) */}
            <BottomNav />
        </main>
    );
}
