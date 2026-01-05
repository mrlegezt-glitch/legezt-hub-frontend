'use client';

// ==================================
// Bottom Navigation Component
// ==================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Headphones, Gift, User, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/subjects', icon: BookOpen, label: 'Subjects' },
    { href: '/podcasts', icon: Headphones, label: 'LeGeZtCast' },
    { href: '/offers', icon: Gift, label: 'Offers' },
    { href: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="bottom-nav md:hidden pb-safe">
            <div className="flex justify-around items-center max-w-lg mx-auto h-full">
                {navItems.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href ||
                        (href !== '/' && pathname.startsWith(href));

                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => {
                                if (window.navigator?.vibrate) {
                                    window.navigator.vibrate(50);
                                }
                            }}
                            className={clsx(
                                'bottom-nav-item',
                                isActive && 'active',
                                'active:scale-90 transition-transform duration-200'
                            )}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium mt-1">{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
