'use client';

import { useState, useEffect } from 'react';
import { contentApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { ChevronDown } from 'lucide-react';

interface BacklogFiltersProps {
    yearId: string | undefined;
    semesterId: string | undefined;
    type: 'theory' | 'lab' | undefined;
    onYearChange: (id: string | undefined) => void;
    onSemesterChange: (id: string | undefined) => void;
    onTypeChange: (type: 'theory' | 'lab' | undefined) => void;
}

export default function BacklogFilters({
    yearId,
    semesterId,
    type,
    onYearChange,
    onSemesterChange,
    onTypeChange
}: BacklogFiltersProps) {
    const { user } = useAuthStore();
    const [years, setYears] = useState<any[]>([]);
    const [semesters, setSemesters] = useState<any[]>([]);
    const [loadingYears, setLoadingYears] = useState(false);
    const [loadingSemesters, setLoadingSemesters] = useState(false);

    // Fetch Years (when branch is available)
    useEffect(() => {
        if (!user?.branchId) return;

        const fetchYears = async () => {
            setLoadingYears(true);
            try {
                const res = await contentApi.getYears(user.branchId!);
                setYears(res.data.data);
            } catch (error) {
                console.error('Failed to fetch years:', error);
            } finally {
                setLoadingYears(false);
            }
        };

        fetchYears();
    }, [user?.branchId]);

    // Fetch Semesters (when year is selected)
    useEffect(() => {
        if (!yearId) {
            setSemesters([]);
            onSemesterChange(undefined);
            return;
        }

        const fetchSemesters = async () => {
            setLoadingSemesters(true);
            try {
                const res = await contentApi.getSemesters(yearId);
                setSemesters(res.data.data);
            } catch (error) {
                console.error('Failed to fetch semesters:', error);
            } finally {
                setLoadingSemesters(false);
            }
        };

        fetchSemesters();
    }, [yearId]);

    return (
        <div className="bg-white/80 dark:bg-dark-100/50 backdrop-blur-lg border border-gray-200 dark:border-white/5 rounded-2xl p-4 md:p-6 mb-8 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="text-primary-400">⚡</span> Filter Backlogs
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Year Select */}
                <div className="relative">
                    <select
                        value={yearId || ''}
                        onChange={(e) => onYearChange(e.target.value || undefined)}
                        className="w-full appearance-none bg-white dark:bg-dark-200 text-gray-800 dark:text-white border border-gray-300 dark:border-dark-border rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-primary-500 transition-colors"
                        disabled={loadingYears}
                    >
                        <option value="" className="bg-white dark:bg-dark-200 text-gray-800 dark:text-white">All Years</option>
                        {years.map((y) => (
                            <option key={y.id} value={y.id} className="bg-white dark:bg-dark-200 text-gray-800 dark:text-white">
                                {y.displayName}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>

                {/* Semester Select */}
                <div className="relative">
                    <select
                        value={semesterId || ''}
                        onChange={(e) => onSemesterChange(e.target.value || undefined)}
                        className="w-full appearance-none bg-white dark:bg-dark-200 text-gray-800 dark:text-white border border-gray-300 dark:border-dark-border rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!yearId || loadingSemesters}
                    >
                        <option value="" className="bg-white dark:bg-dark-200 text-gray-800 dark:text-white">All Semesters</option>
                        {semesters.map((s) => (
                            <option key={s.id} value={s.id} className="bg-white dark:bg-dark-200 text-gray-800 dark:text-white">
                                {s.displayName}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>

                {/* Type Toggle */}
                <div className="flex bg-gray-100 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl p-1">
                    <button
                        onClick={() => onTypeChange(undefined)}
                        className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${!type ? 'bg-white dark:bg-dark-100 text-gray-800 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => onTypeChange('theory')}
                        className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${type === 'theory' ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'}`}
                    >
                        Theory
                    </button>
                    <button
                        onClick={() => onTypeChange('lab')}
                        className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${type === 'lab' ? 'bg-pink-500 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'}`}
                    >
                        Lab
                    </button>
                </div>
            </div>
        </div>
    );
}
