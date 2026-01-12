'use client';

// ==================================
// Bottom Navigation Component
// ==================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Headphones, Gift, User, BookOpen, Calendar } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/syllabus', icon: Calendar, label: 'Syllabus' },
    { href: '/subjects', icon: BookOpen, label: 'Subjects' },
    { href: '/podcasts', icon: Headphones, label: 'LeGeZtCast' },
    { href: '/offers', icon: Gift, label: 'Offers' },
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
        <nav className="bottom-nav md:hidden pb-safe" role="navigation" aria-label="Main navigation">
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
                                'bottom-nav-item',
                                isActive && 'active',
                                'active:scale-90 transition-transform duration-200'
                            )}
                            aria-label={label}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
                            <span className="text-[10px] font-medium mt-1">{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
