'use client';

import { Heart, Github, Linkedin, Mail } from 'lucide-react';
import Link from 'next/link';

import { usePathname } from 'next/navigation';

export default function Footer() {
    const pathname = usePathname();

    if (
        pathname?.startsWith('/admin') ||
        pathname?.startsWith('/pdfs/') ||
        pathname?.startsWith('/labs/legezttantra')
    ) return null;

    return (
        <footer className="border-t border-white/5 bg-dark-bg/50 backdrop-blur-xl mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <span className="text-2xl font-bold gradient-text">LeGeZt</span>
                        </Link>
                        <p className="text-gray-400 max-w-sm mb-6">
                            Your comprehensive academic hub for notes, podcasts, and premium courses.
                            Built for students, by students.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                                <Github size={20} />
                            </a>
                            <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                                <Linkedin size={20} />
                            </a>
                            <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Platform</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li><Link href="/pdfs" className="hover:text-primary-400 transition-colors">PDF Library</Link></li>
                            <li><Link href="/podcasts" className="hover:text-primary-400 transition-colors">Podcasts</Link></li>
                            <li><Link href="/offers" className="hover:text-primary-400 transition-colors">Courses</Link></li>
                            <li><Link href="/login" className="hover:text-primary-400 transition-colors">Login / Sign Up</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li><Link href="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-primary-400 transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-primary-400 transition-colors">Cookie Policy</Link></li>
                            <li><Link href="#" className="hover:text-primary-400 transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} LeGeZt Hub. All rights reserved.
                    </p>

                    <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                        <span>Developed with</span>
                        <Heart size={14} className="text-red-500 fill-red-500 animate-pulse" />
                        <span>by</span>
                        <span className="font-medium text-white">Mohd Jibraan</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
