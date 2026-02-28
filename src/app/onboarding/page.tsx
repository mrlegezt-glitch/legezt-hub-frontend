'use client';

// ==================================
// Onboarding Page
// ==================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useContentStore } from '@/stores/contentStore';
import StepSelector from '@/components/selectors/StepSelector';
import api from '@/lib/api';

export default function OnboardingPage() {
    const router = useRouter();
    const { user, isAuthenticated, setAuth, accessToken, refreshToken } = useAuthStore();
    const { selection } = useContentStore();
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // If not logged in, redirect to login
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        // If already onboarded, redirect to dashboard
        if (user?.isOnboardingComplete) {
            router.push('/');
        }
    }, [isAuthenticated, user, router]);

    const handleSave = async () => {
        if (!selection.college || !selection.branch || !selection.year || !selection.semester) {
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                collegeId: selection.college.id,
                branchId: selection.branch.id,
                yearId: selection.year.id,
                semesterId: selection.semester.id
            };

            const response = await api.post('/user/onboarding', payload);

            if (response.data.success) {
                // Update local user state
                if (user) {
                    const updatedUser = { ...user, isOnboardingComplete: true };
                    const currentState = useAuthStore.getState();
                    setAuth(updatedUser, currentState.accessToken, currentState.refreshToken);
                }
                router.push('/');
            }
        } catch (error) {
            console.error('Onboarding failed:', error);
            alert('Failed to save details. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const isComplete = selection.semester !== null;

    if (!isAuthenticated) return null;

    return (
        <main className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold mb-2">Welcome to LeGeZt! 👋</h1>
                    <p className="text-gray-400">Let&apos;s personalize your experience. Tell us where you study.</p>
                </div>

                <div className="bg-dark-100/50 backdrop-blur-sm border border-dark-border rounded-3xl p-6 md:p-8">
                    <StepSelector />

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={!isComplete || submitting}
                            className={`btn-primary w-full md:w-auto px-8 py-3 rounded-xl font-semibold transition-all ${!isComplete || submitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                                }`}
                        >
                            {submitting ? 'Saving...' : 'Start Learning 🚀'}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
