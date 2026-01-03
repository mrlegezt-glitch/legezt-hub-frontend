import type { Metadata, Viewport } from 'next';
import './globals.css';
import DesktopNav from '@/components/navigation/DesktopNav';
import MobileHeader from '@/components/navigation/MobileHeader';
import SideMenu from '@/components/navigation/SideMenu';
import Footer from '@/components/layout/Footer';
import ThemeProvider from '@/components/providers/ThemeProvider';

export const metadata: Metadata = {
    title: 'LeGeZt - Your Study Hub',
    description: 'Access PDFs, podcasts, and courses for your academic journey',
    keywords: ['education', 'PDFs', 'podcasts', 'courses', 'study', 'notes'],
    authors: [{ name: 'Mohd Jibraan' }],
    creator: 'Mohd Jibraan',
    openGraph: {
        title: 'LeGeZt - Your Study Hub',
        description: 'Access PDFs, podcasts, and courses for your academic journey',
        url: 'https://www.legezt.app',
        siteName: 'LeGeZt',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'LeGeZt - Your Study Hub',
        description: 'Access PDFs, podcasts, and courses for your academic journey',
    },
    icons: {
        icon: '/favicon.png',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#0a0a12',
};

import { Toaster } from 'sonner';

import AuthInitializer from '@/components/auth/AuthInitializer';
import { SocketProvider } from '@/lib/socket-context';
import { UserActivityTracker } from '@/components/UserActivityTracker';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning className="dark">
            <body className="antialiased">
                <ThemeProvider>
                    <SocketProvider>
                        <AuthInitializer />
                        <UserActivityTracker />
                        <SideMenu />
                        <DesktopNav />
                        <MobileHeader />
                        {children}
                        <Footer />
                    </SocketProvider>
                    <Toaster position="top-right" theme="dark" />
                </ThemeProvider>
            </body>
        </html>
    );
}

