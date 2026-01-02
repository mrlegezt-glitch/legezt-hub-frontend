'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import BottomNav from '@/components/navigation/BottomNav';
import StepSelector from '@/components/selectors/StepSelector';
import { useContentStore } from '@/stores/contentStore';
import { userApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

export default function SettingsPage() {
    const router = useRouter();
    const { selection } = useContentStore();
    const { user, updateUser } = useAuthStore();
    const [submitting, setSubmitting] = useState(false);

    const handleSave = async () => {
        if (!selection.college || !selection.branch || !selection.year || !selection.semester) {
            toast.error('Please complete all selection steps');
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

            const response = await userApi.updateSettings(payload);

            if (response.data.success) {
                // Update local auth store with new user data
                const updatedUser = response.data.data;

                // Format if necessary (backend returns raw prisma object + includes)
                // authStore.updateUser expects the User interface from authStore.ts
                updateUser({
                    ...user!,
                    collegeName: updatedUser.college?.name,
                    branchName: updatedUser.branch?.name,
                    yearName: updatedUser.year?.displayName,
                    semesterName: updatedUser.semester?.displayName,
                    isOnboardingComplete: true
                });

                toast.success('Academic profile updated');
                router.push('/profile');
            }

        } catch (error) {
            console.error('Update failed:', error);
            toast.error('Failed to update settings');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen pb-24">
            <header className="sticky top-0 z-40 glass px-5 py-4">
                <div className="flex items-center justify-between max-w-lg mx-auto">
                    <div className="flex items-center gap-4">
                        <Link href="/profile" className="p-2 -ml-2 rounded-full hover:bg-dark-100">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-lg font-semibold">Academic Settings</h1>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={submitting}
                        className="text-primary-500 font-medium text-sm disabled:opacity-50 hover:text-primary-400 transition-colors"
                    >
                        {submitting ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </header>

            <div className="max-w-lg mx-auto px-5 py-8">
                <div className="mb-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center mx-auto mb-4">
                        <GraduationCap size={32} />
                    </div>
                    <h2 className="text-xl font-bold">Update Your College</h2>
                    <p className="text-gray-400 text-sm">This helps us show you relevant notes and podcasts.</p>
                </div>

                <div className="card p-6 bg-[#FDFBF7] border border-orange-100/50 shadow-xl shadow-orange-500/5 rounded-3xl relative overflow-hidden">
                    {/* Decorative Background Element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>

                    <StepSelector theme="light" />

                    <div className="mt-10 relative z-10">
                        <button
                            onClick={handleSave}
                            disabled={submitting}
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-orange-500/25 transition-all active:scale-[0.98]"
                        >
                            {submitting ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <Save size={20} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs text-gray-500 px-10">
                    Changes here will affect which subjects and folders appear on your main screen.
                </p>
            </div>

            <BottomNav />
        </main>
    );
}
