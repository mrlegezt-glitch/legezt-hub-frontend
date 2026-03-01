'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface LeGeZtHeaderProps {
    className?: string;
}

export default function LeGeZtHeader({ className = '' }: LeGeZtHeaderProps) {
    const router = useRouter();
    const { user } = useAuthStore();

    return (
        <header
            className={`h-16 flex items-center justify-between px-6 fixed w-full top-0 z-[999] ${className}`}
            style={{ backgroundColor: '#0a0f1e', borderBottom: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
        >
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-full transition-colors mr-2"
                    title="Go Back"
                >
                    <ArrowLeft size={20} />
                </button>

                {/* Logo Area - Using Image as per screenshot reference if available, or styled text matching brand */}
                <Link href="/labs/legezttantra" className="flex items-center gap-2">
                    {/* If logo image exists use it, else fallback to text */}
                    <img
                        src="/assets/legezttantra/header_logo_v2.png"
                        alt="LeGeZt Tantra"
                        className="h-10 object-contain drop-shadow-sm"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                    />
                    <span className="text-xl font-bold text-white tracking-wider hidden uppercase">LeGeZt <span className="text-orange-500">Tantra</span></span>
                </Link>

                <Link href="/labs/legezttantra" className="hidden md:flex ml-6 text-slate-300 hover:text-white text-sm items-center gap-1 font-medium hover:text-orange-400 transition-colors">
                    <Home size={16} /> Home
                </Link>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-300">
                <span className="hidden md:inline">{user?.name || user?.email || 'Guest'}</span>
                <span className="hidden md:inline text-slate-600">•</span>
                <button className="hover:text-white transition-colors">Support</button>
            </div>
        </header>
    );
}
