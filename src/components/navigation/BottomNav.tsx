'use client';

// ==================================
// Bottom Navigation Component
// ==================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Headphones, Gift, User, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/subjects', icon: BookOpen, label: 'Subjects' },
    { href: '/podcasts', icon: Headphones, label: 'LeGeZtCast' },
    { href: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
    const pathname = usePathname();

    const handleNavClick = () => {
        // Only vibrate if supported and user hasn't disabled it
        if (
            typeof window !== 'undefined' &&
            'vibrate' in navigator &&
            navigator.vibrate
        ) {
            try {
                navigator.vibrate(50);
            } catch (error) {
                // Silently fail if vibration is not allowed
                console.debug('Vibration not available');
            }
        }
    };

    return (
        <motion.nav
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="bottom-nav md:hidden pb-safe" role="navigation" aria-label="Main navigation">
            <div className="flex justify-around items-center max-w-lg mx-auto h-full">
                {navItems.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href ||
                        (href !== '/' && pathname.startsWith(href));

                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={handleNavClick}
                            className={clsx(
                                'bottom-nav-item relative',
                                isActive && 'active',
                            )}
                            aria-label={label}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <motion.div
                                whileTap={{ scale: 0.8 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                className="flex flex-col items-center"
                            >
                                <div className="relative">
                                    {isActive && (
                                        <motion.div
                                            layoutId="bottom-nav-indicator"
                                            className="absolute -inset-2 bg-primary-500/15 rounded-xl"
                                            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                                        />
                                    )}
                                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" aria-hidden="true" />
                                </div>
                                <span className="text-[10px] font-medium mt-1">{label}</span>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
        </motion.nav>
    );
}
