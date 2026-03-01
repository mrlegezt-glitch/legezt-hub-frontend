'use client';

import { Heart, Github, Linkedin, Mail } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { usePathname } from 'next/navigation';

const footerFadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    }),
};

export default function Footer() {
    const pathname = usePathname();

    if (
        pathname?.startsWith('/admin') ||
        pathname?.startsWith('/pdfs/') ||
        pathname?.startsWith('/labs/legezttantra') ||
        pathname?.startsWith('/podcasts/')
    ) return null;

    return (
        <footer className="border-t border-slate-200 bg-white/60 backdrop-blur-xl mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <motion.div
                        variants={footerFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
                        className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <span className="text-2xl font-bold gradient-text">LeGeZt</span>
                        </Link>
                        <p className="text-slate-500 max-w-sm mb-6">
                            Your comprehensive academic hub for notes, podcasts, and premium courses.
                            Built for students, by students.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="#"
                                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-all text-slate-500 hover:text-slate-900 magnetic-hover"
                                aria-label="Visit our GitHub"
                            >
                                <Github size={20} aria-hidden="true" />
                            </a>
                            <a
                                href="#"
                                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-all text-slate-500 hover:text-slate-900 magnetic-hover"
                                aria-label="Connect on LinkedIn"
                            >
                                <Linkedin size={20} aria-hidden="true" />
                            </a>
                            <a
                                href="#"
                                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-all text-slate-500 hover:text-slate-900 magnetic-hover"
                                aria-label="Contact us via Email"
                            >
                                <Mail size={20} aria-hidden="true" />
                            </a>
                        </div>
                    </motion.div>

                    <motion.div variants={footerFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}>
                        <h3 className="font-semibold text-slate-900 mb-4">Platform</h3>
                        <ul className="space-y-2 text-slate-500">
                            <li><Link href="/pdfs" className="hover:text-primary-600 transition-colors underline-slide">PDF Library</Link></li>
                            <li><Link href="/podcasts" className="hover:text-primary-600 transition-colors underline-slide">Podcasts</Link></li>
                            <li><Link href="/offers" className="hover:text-primary-600 transition-colors underline-slide">Courses</Link></li>
                            <li><Link href="/login" className="hover:text-primary-600 transition-colors underline-slide">Login / Sign Up</Link></li>
                        </ul>
                    </motion.div>

                    <motion.div variants={footerFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}>
                        <h3 className="font-semibold text-slate-900 mb-4">Legal</h3>
                        <ul className="space-y-2 text-slate-500">
                            <li><Link href="/privacy" className="hover:text-primary-600 transition-colors underline-slide">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-primary-600 transition-colors underline-slide">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-primary-600 transition-colors underline-slide">Cookie Policy</Link></li>
                            <li><Link href="#" className="hover:text-primary-600 transition-colors underline-slide">Contact Us</Link></li>
                        </ul>
                    </motion.div>
                </div>

                <motion.div
                    variants={footerFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3}
                    className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                    <p className="text-slate-400 text-sm">
                        © {new Date().getFullYear()} LeGeZt Hub. All rights reserved.
                    </p>

                    <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
                        <span>Developed with</span>
                        <Heart size={14} className="text-red-500 fill-red-500 animate-heartbeat" />
                        <span>by</span>
                        <span className="font-medium text-slate-900">Mohd Jibraan</span>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
}
