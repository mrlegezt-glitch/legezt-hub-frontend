'use client';

import Link from 'next/link';
import { ArrowRight, FileText, Headphones, BookOpen, Lock, Sparkles, ShieldCheck, PlayCircle, Users, Star, Zap } from 'lucide-react';
import BottomNav from '@/components/navigation/BottomNav';
import { useAuthStore } from '@/stores/authStore';
import RecentlyViewed from '@/components/dashboard/RecentlyViewed';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useRef } from 'react';
import BecomeAdminModal from '@/components/admin/BecomeAdminModal';

const fadeUp = {
    hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
    visible: (i: number) => ({
        opacity: 1, y: 0, filter: 'blur(0px)',
        transition: { delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    }),
};

const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.92 },
    visible: (i: number) => ({
        opacity: 1, y: 0, scale: 1,
        transition: { delay: 0.1 + i * 0.09, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    }),
};

const stats = [
    { label: 'Students', value: '2,400+', icon: Users },
    { label: 'Study Materials', value: '1,200+', icon: BookOpen },
    { label: 'Podcasts', value: '80+', icon: Headphones },
    { label: 'Satisfaction', value: '99%', icon: Star },
];

const features = [
    {
        href: '/subjects', label: 'Library', color: 'blue',
        title: 'Your', titleAccent: 'Subjects',
        desc: 'Subject-wise organized notes, question papers, and complete syllabus material.',
        img: '/assets/subjects_hero.png', cta: 'View Subjects',
        gradient: 'from-blue-600/30 via-blue-500/10 to-transparent',
        border: 'group-hover:border-blue-500/60', glow: 'group-hover:shadow-blue-500/20',
        badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    },
    {
        href: '/backlogs', label: 'Repository', color: 'red',
        title: 'Backlogs &', titleAccent: 'Archives',
        desc: 'Access materials from any semester, organized and year-wise filtered.',
        img: '/assets/archives_hero.png', cta: 'Browse Archives',
        gradient: 'from-red-600/30 via-red-500/10 to-transparent',
        border: 'group-hover:border-red-500/60', glow: 'group-hover:shadow-red-500/20',
        badge: 'bg-red-500/15 text-red-400 border-red-500/30',
    },
    {
        href: '/podcasts', label: 'Audio Hub', color: 'emerald',
        title: 'LeGeZt', titleAccent: 'Cast',
        desc: 'Listen to summaries and lectures on the go with our AI-powered audio hub.',
        img: '/assets/podcasts_hero.png', cta: 'Listen Now',
        gradient: 'from-emerald-600/30 via-emerald-500/10 to-transparent',
        border: 'group-hover:border-emerald-500/60', glow: 'group-hover:shadow-emerald-500/20',
        badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    },
    {
        href: '/offers', label: 'Certification', color: 'orange',
        title: 'Premium', titleAccent: 'Courses',
        desc: 'Structured learning paths and expert-led certifications to boost your career.',
        img: '/assets/courses_hero.png', cta: 'View Offers',
        gradient: 'from-orange-600/30 via-orange-500/10 to-transparent',
        border: 'group-hover:border-orange-500/60', glow: 'group-hover:shadow-orange-500/20',
        badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    },
];

export default function HomePage() {
    const { isAuthenticated, user } = useAuthStore();
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const heroRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

    return (
        <>
            {/* ============================
                HERO SECTION
            ============================ */}
            <section ref={heroRef} className="relative min-h-[92vh] flex items-center justify-center overflow-hidden" aria-labelledby="hero-heading">

                {/* Parallax Hero Background Image */}
                <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
                    <img
                        src="/assets/hero_bg.png"
                        alt=""
                        aria-hidden="true"
                        className="w-full h-full object-cover object-center"
                    />
                    {/* Multi-layer dark overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0d0d18]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-950/40 via-transparent to-purple-950/40" />
                </motion.div>

                {/* Animated ambient orbs */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <motion.div
                        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.05, 1] }}
                        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[100px]"
                    />
                    <motion.div
                        animate={{ x: [0, -30, 0], y: [0, 20, 0], scale: [1, 1.08, 1] }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
                        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[100px]"
                    />
                    <motion.div
                        animate={{ x: [0, 20, 0], y: [0, 30, 0] }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
                        className="absolute top-1/3 right-1/3 w-[300px] h-[300px] rounded-full bg-cyan-600/8 blur-[80px]"
                    />
                </div>

                {/* Floating 3D grid lines */}
                <div className="absolute inset-0 z-0 opacity-[0.04]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(100,180,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(100,180,255,0.5) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />

                {/* Hero Content */}
                <motion.div style={{ opacity: heroOpacity }} className="relative z-10 max-w-5xl mx-auto px-5 text-center">

                    {isAuthenticated && user?.role === 'SUPER_ADMIN' ? (
                        <>
                            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 text-purple-300 text-xs font-semibold mb-8 border border-purple-500/30 backdrop-blur-sm">
                                <Sparkles size={13} />
                                System Privileges Active
                            </motion.div>
                            <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1} id="hero-heading"
                                className="text-5xl md:text-7xl font-black mb-6 leading-[1.05] tracking-tight text-white">
                                Welcome, <span className="gradient-text animate-gradient-shift">Super Admin</span>
                            </motion.h1>
                            <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
                                className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                                Monitor platform activity, manage users, and control content distribution from your command center.
                            </motion.p>
                            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="flex items-center justify-center gap-4 flex-wrap">
                                <Link href="/admin/dashboard" className="group btn-primary px-8 py-3.5 rounded-2xl text-base flex items-center gap-2 shadow-2xl shadow-primary-600/30 hover:scale-105 transition-all">
                                    Admin Dashboard <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link href="/subjects" className="px-8 py-3.5 rounded-2xl text-base font-semibold bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all">
                                    View Subjects
                                </Link>
                            </motion.div>
                        </>
                    ) : (
                        <>
                            {/* Animated badge */}
                            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
                                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary-500/15 text-primary-300 text-xs font-semibold mb-8 border border-primary-500/25 backdrop-blur-sm">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-400"></span>
                                </span>
                                New Semantic Search Available
                            </motion.div>

                            {/* Hero Title */}
                            <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1} id="hero-heading"
                                className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-[1.02] tracking-tight text-white">
                                Your Ultimate<br />
                                <span className="gradient-text animate-gradient-shift bg-[length:200%_auto]">Engineering Hub</span>
                            </motion.h1>

                            <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
                                className="text-gray-300/90 text-xl md:text-2xl max-w-2xl mx-auto mb-12 leading-relaxed font-light">
                                Notes, podcasts, and courses — all in one place.<br className="hidden md:block" />
                                <span className="text-gray-400 text-lg">Curated for engineering excellence.</span>
                            </motion.p>

                            {/* CTA Buttons */}
                            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
                                className="flex items-center justify-center gap-4 flex-wrap">
                                {isAuthenticated ? (
                                    <Link href="/subjects" className="group btn-primary px-8 py-4 rounded-2xl text-lg flex items-center gap-2 shadow-2xl shadow-primary-600/30 hover:scale-105 transition-all animate-subtle-bounce">
                                        My Subjects <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                ) : (
                                    <Link href="/login" className="group btn-primary px-8 py-4 rounded-2xl text-lg flex items-center gap-2 shadow-2xl shadow-primary-600/30 hover:scale-105 transition-all animate-subtle-bounce">
                                        Get Started Free <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                )}
                                <Link href="/explore" className="px-8 py-4 rounded-2xl text-lg font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-sm transition-all flex items-center gap-2">
                                    <PlayCircle size={20} /> Watch Content
                                </Link>
                            </motion.div>
                        </>
                    )}
                </motion.div>

                {/* Scroll down arrow */}
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/40"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M12 5v14M19 12l-7 7-7-7" />
                    </svg>
                </motion.div>
            </section>

            {/* ============================
                STATS BAR
            ============================ */}
            <section className="relative z-10 bg-white/[0.03] border-y border-white/5 py-5 md:py-7">
                <div className="max-w-5xl mx-auto px-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:divide-x divide-white/10">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08, duration: 0.5 }}
                                className="text-center md:px-6"
                            >
                                <stat.icon size={20} className="mx-auto text-primary-400 mb-2 opacity-70" />
                                <div className="text-2xl md:text-3xl font-black text-white">{stat.value}</div>
                                <div className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-0.5">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================
                RECENTLY VIEWED
            ============================ */}
            {isAuthenticated && (
                <section className="max-w-7xl mx-auto px-5 md:px-6 mt-12 relative z-20">
                    <RecentlyViewed />
                </section>
            )}

            {/* ============================
                BECOME ADMIN BANNER
            ============================ */}
            {isAuthenticated && user?.role === 'USER' && (
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-5xl mx-auto px-5 mt-10 mb-4">
                    <div className="relative overflow-hidden rounded-3xl border border-primary-500/20 bg-gradient-to-r from-primary-900/30 via-purple-900/20 to-transparent p-7 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        {/* Background blur */}
                        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-primary-600/20 blur-3xl" />
                        <div className="absolute -left-5 -bottom-5 w-32 h-32 rounded-full bg-purple-600/20 blur-3xl" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck size={22} className="text-primary-400" />
                                <h2 className="text-xl md:text-2xl font-bold text-white">Want to become an Admin?</h2>
                            </div>
                            <p className="text-gray-400 text-sm max-w-md">
                                Help your peers by managing PDFs, podcasts, and study materials. Apply now to get access.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsAdminModalOpen(true)}
                            className="relative z-10 shrink-0 px-7 py-3 bg-primary-500 text-white font-bold rounded-2xl hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                            Apply Now <Zap size={16} />
                        </button>
                    </div>
                </motion.section>
            )}

            <BecomeAdminModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} user={user} />

            {/* ============================
                FEATURES GRID
            ============================ */}
            <section className="max-w-7xl mx-auto px-5 md:px-6 py-14 md:py-20 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <span className="inline-block px-4 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold uppercase tracking-widest mb-4">Everything You Need</span>
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">One Platform. <span className="gradient-text">Infinite Knowledge.</span></h2>
                    <p className="text-gray-400 mt-4 text-base md:text-lg max-w-xl mx-auto">All your study tools, resources, and content — beautifully organized in one place.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {features.map((feat, i) => (
                        <motion.div key={feat.href} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} custom={i}>
                            <Link
                                href={feat.href}
                                className={`group relative flex flex-col rounded-3xl border border-white/8 bg-white/[0.03] overflow-hidden transition-all duration-500 hover:border-white/20 hover:shadow-2xl ${feat.glow} ${feat.border} hover:-translate-y-1.5`}
                            >
                                {/* Card image */}
                                <div className="relative w-full aspect-[16/10] overflow-hidden">
                                    <img
                                        src={feat.img}
                                        alt={feat.title + ' ' + feat.titleAccent}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    {/* Gradient overlay */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${feat.gradient} opacity-60 group-hover:opacity-90 transition-opacity`} />
                                    {/* Badge */}
                                    <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${feat.badge} backdrop-blur-sm`}>
                                        {feat.label}
                                    </span>
                                </div>

                                {/* Card body */}
                                <div className="p-6 flex flex-col flex-1">
                                    <h3 className="text-xl font-black mb-2 tracking-tight text-white">
                                        {feat.title} <span className={`text-${feat.color}-400 italic`}>{feat.titleAccent}</span>
                                    </h3>
                                    <p className="text-gray-400 text-sm leading-relaxed flex-1 mb-5">{feat.desc}</p>
                                    <div className={`text-${feat.color}-400 font-bold flex items-center gap-2 text-sm group-hover:translate-x-2 transition-transform duration-300`}>
                                        {feat.cta} <ArrowRight size={15} />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ============================
                CTA / LOGIN NOTICE
            ============================ */}
            {!isAuthenticated && (
                <motion.section
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto px-5 pb-20">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900/40 via-blue-900/20 to-purple-900/40 border border-white/10 p-10 text-center">
                        <div className="absolute inset-0 opacity-20">
                            <img src="/assets/mesh_bg.png" alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-primary-500/20 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl" />

                        <div className="relative z-10">
                            <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}>
                                <Lock className="mx-auto text-gray-400 mb-5" size={36} />
                            </motion.div>
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Member Exclusive Content</h2>
                            <p className="text-gray-400 mb-8 max-w-md mx-auto">
                                Browse freely, but you'll need an account to open documents, play full podcasts, or enroll.
                            </p>
                            <Link href="/login" className="btn-primary px-10 py-4 rounded-2xl text-base font-bold shadow-2xl shadow-primary-600/30 hover:scale-105 transition-all inline-flex items-center gap-2">
                                Join for Free <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </motion.section>
            )}

            <BottomNav />
        </>
    );
}
