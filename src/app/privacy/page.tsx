// ==================================
// Privacy Policy Page
// ==================================

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <main className="min-h-screen pb-24 md:pb-12">
            {/* Mobile Header (Hidden on Desktop) */}
            <header className="md:hidden sticky top-0 z-40 glass px-5 py-4">
                <div className="flex items-center gap-4 max-w-lg mx-auto">
                    <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-dark-100">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-lg font-semibold">Privacy Policy</h1>
                </div>
            </header>

            <div className="max-w-lg md:max-w-4xl mx-auto px-5 md:px-6 md:pt-12">
                {/* Desktop Title */}
                <div className="hidden md:block mb-8 text-center">
                    <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
                    <p className="text-gray-400">Your privacy is important to us. Read how we handle your data.</p>
                </div>

                {/* Content */}
                <article className="prose prose-invert prose-lg max-w-none bg-dark-100/50 p-6 md:p-10 rounded-3xl border border-white/5">
                    <p className="text-gray-400 text-sm mb-8 bg-dark-200 inline-block px-3 py-1 rounded-full">
                        Last Updated: December 2024
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Information We Collect</h2>
                    <p>When you use LeGeZt, we collect:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong className="text-primary-400">Google Profile</strong>: Name, email, and profile picture via OAuth</li>
                        <li><strong className="text-primary-400">Usage Data</strong>: Pages visited, PDFs viewed, session duration</li>
                        <li><strong className="text-primary-400">Device Info</strong>: Browser type, OS, screen size</li>
                    </ul>
                    <p className="mt-4">We do not collect or store sensitive personal data.</p>

                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. How We Use Your Information</h2>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Deliver personalized content</li>
                        <li>Improve user experience</li>
                        <li>Send notifications (new PDFs, support responses)</li>
                        <li>Ensure platform security</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Data Protection</h2>
                    <p>
                        All data is stored with industry-standard encryption. We do not share
                        your data with unauthorized third parties. Regular security audits are
                        performed to ensure data safety.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Third-Party Services</h2>
                    <p>We use trusted third-party services:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong className="text-primary-400">Google OAuth</strong> - Authentication</li>
                        <li><strong className="text-primary-400">Google AdSense</strong> - Website advertising</li>
                        <li><strong className="text-primary-400">Google AdMob</strong> - Mobile app advertising</li>
                        <li><strong className="text-primary-400">Google Analytics</strong> - Usage insights</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Cookies & Tracking</h2>
                    <p>
                        Cookies are used for authentication persistence and analytics.
                        We do not use malicious or invasive tracking.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Request your data anytime</li>
                        <li>Request data deletion</li>
                        <li>Contact us for privacy concerns at mrlegezt@gmail.com</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Children&apos;s Privacy</h2>
                    <p>LeGeZt is not intended for users under 13 years of age.</p>

                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Policy Updates</h2>
                    <p>
                        This policy may be updated. Changes will be reflected on this
                        page with the updated date.
                    </p>

                    <div className="my-8 border-t border-white/10" />

                    <h2 className="text-2xl font-bold text-white mb-4">Contact</h2>
                    <div className="bg-dark-200/50 p-6 rounded-2xl">
                        <p className="mb-2">
                            <span className="text-gray-400">Email:</span> <a href="mailto:mrlegezt@gmail.com" className="hover:text-primary-400 transition-colors">mrlegezt@gmail.com</a>
                        </p>
                        <p className="mb-2">
                            <span className="text-gray-400">Instagram:</span> <a href="https://instagram.com/legezt" target="_blank" rel="noopener" className="hover:text-primary-400 transition-colors">@legezt</a>
                        </p>
                        <p>
                            <span className="text-gray-400">Phone:</span> +91 9182481181
                        </p>
                    </div>

                    <p className="text-center text-gray-500 mt-8 text-sm">
                        Founded and managed by <strong className="text-white">Mohd Jibraan</strong>
                    </p>
                </article>
            </div>
        </main>
    );
}
