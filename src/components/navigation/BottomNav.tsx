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
        <nav className="bottom-nav md:hidden">
            <div className="flex justify-around items-center max-w-lg mx-auto">
                {navItems.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href ||
                        (href !== '/' && pathname.startsWith(href));

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={clsx(
                                'bottom-nav-item',
                                isActive && 'active'
                            )}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-xs font-medium">{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
