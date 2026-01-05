'use client';

// ==================================
// Step Selector Component (College → Branch → Year → Semester)
// ==================================

import { useState, useEffect } from 'react';
import { ChevronRight, Check, Lock, Building2, GitBranch, Calendar, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';
import BottomSheet from '../ui/BottomSheet';
import { useContentStore } from '@/stores/contentStore';
import { contentApi } from '@/lib/api';
import Skeleton from '../ui/Skeleton';

interface StepData {
    step: number;
    title: string;
    icon: React.ElementType;
    key: 'college' | 'branch' | 'year' | 'semester';
    fetchFn: (parentId?: string) => Promise<any>;
    parentKey?: 'college' | 'branch' | 'year';
}

const steps: StepData[] = [
    { step: 1, title: 'Select College', icon: Building2, key: 'college', fetchFn: () => contentApi.getColleges() },
    { step: 2, title: 'Select Branch', icon: GitBranch, key: 'branch', fetchFn: (id) => contentApi.getBranches(id!), parentKey: 'college' },
    { step: 3, title: 'Select Year', icon: Calendar, key: 'year', fetchFn: (id) => contentApi.getYears(id!), parentKey: 'branch' },
    { step: 4, title: 'Select Semester', icon: BookOpen, key: 'semester', fetchFn: (id) => contentApi.getSemesters(id!), parentKey: 'year' },
];

export default function StepSelector({ theme = 'dark' }: { theme?: 'light' | 'dark' }) {
    const { selection, currentStep, setCollege, setBranch, setYear, setSemester } = useContentStore();
    const [activeSheet, setActiveSheet] = useState<number | null>(null);
    const [options, setOptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const setters = {
        college: setCollege,
        branch: setBranch,
        year: setYear,
        semester: setSemester,
    };

    // Styling constants based on theme
    const styles = theme === 'light' ? {
        cardBg: 'bg-white border border-gray-100 shadow-sm hover:border-orange-200',
        activeDataBg: 'bg-orange-50 text-orange-600',
        inactiveDataBg: 'bg-gray-50 text-gray-400',
        completedDataBg: 'bg-green-50 text-green-600',
        textPrimary: 'text-gray-800',
        textSecondary: 'text-gray-500',
        iconDefault: 'text-gray-400',
        iconActive: 'text-orange-500',
        sheetBg: 'bg-white text-gray-900',
        sheetItemHover: 'hover:bg-gray-50',
    } : {
        cardBg: 'bg-dark-200 border border-transparent',
        activeDataBg: 'bg-primary-500/20 text-primary-400',
        inactiveDataBg: 'bg-dark-300 text-gray-500',
        completedDataBg: 'bg-green-500/20 text-green-500',
        textPrimary: 'text-white',
        textSecondary: 'text-gray-400',
        iconDefault: 'text-gray-400',
        iconActive: 'text-primary-500',
        sheetBg: 'bg-dark-200 text-white',
        sheetItemHover: 'hover:bg-dark-200',
    };

    // Fetch options when sheet opens
    useEffect(() => {
        if (activeSheet !== null) {
            const step = steps[activeSheet - 1];
            const parentId = step.parentKey ? selection[step.parentKey]?.id : undefined;

            setLoading(true);
            step.fetchFn(parentId)
                .then(res => setOptions(res.data.data))
                .catch((err) => {
                    console.error('Failed to fetch options for ' + step.title, err);
                    setOptions([]);
                })
                .finally(() => setLoading(false));
        }
    }, [activeSheet, selection]);

    const handleSelect = (item: any) => {
        if (activeSheet === null) return;

        const step = steps[activeSheet - 1];
        const value = {
            id: item.id,
            name: item.name || item.displayName,
            ...(item.displayName && { displayName: item.displayName }),
        };

        setters[step.key](value);
        setActiveSheet(null);
    };

    const openSheet = (stepNum: number) => {
        if (stepNum <= currentStep) {
            setActiveSheet(stepNum);
        }
    };

    return (
        <div className="space-y-3">
            {steps.map(({ step, title, icon: Icon, key }) => {
                const isCompleted = selection[key] !== null;
                const isLocked = step > currentStep;
                const isActive = step === currentStep;

                return (
                    <button
                        key={step}
                        onClick={() => openSheet(step)}
                        disabled={isLocked}
                        className={clsx(
                            'step-card w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group',
                            styles.cardBg,
                            isLocked && 'opacity-60 cursor-not-allowed grayscale'
                        )}
                    >
                        <div className={clsx(
                            'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                            isCompleted ? styles.completedDataBg : isActive ? styles.activeDataBg : styles.inactiveDataBg
                        )}>
                            {isLocked ? (
                                <Lock size={20} className={styles.iconDefault} />
                            ) : isCompleted ? (
                                <Check size={20} />
                            ) : (
                                <Icon size={20} className={isActive ? styles.iconActive : styles.iconDefault} />
                            )}
                        </div>

                        <div className="flex-1">
                            <p className={clsx("text-xs font-semibold uppercase tracking-wider mb-0.5", styles.textSecondary)}>Step {step}</p>
                            <p className={clsx("font-bold text-lg", styles.textPrimary)}>
                                {selection[key]?.name || selection[key]?.displayName || title}
                            </p>
                        </div>

                        {!isLocked && (
                            <ChevronRight size={20} className={clsx("transition-transform group-hover:translate-x-1", styles.textSecondary)} />
                        )}
                    </button>
                );
            })}

            {/* Bottom Sheet for Selection */}
            <BottomSheet
                isOpen={activeSheet !== null}
                onClose={() => setActiveSheet(null)}
                title={activeSheet ? steps[activeSheet - 1].title : ''}
            >
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} className="h-20 w-full rounded-xl" style={{ backgroundColor: theme === 'dark' ? '#2d2d2d' : '#f3f4f6' }} />
                        ))}
                    </div>
                ) : options.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">No options available</p>
                ) : (
                    <div className="space-y-2">
                        {options.map((item: any) => (
                            <button
                                key={item.id}
                                onClick={() => handleSelect(item)}
                                className={clsx(
                                    "w-full flex items-center gap-4 p-4 rounded-xl transition-colors text-left",
                                    theme === 'light'
                                        ? 'bg-gray-50 hover:bg-orange-50 text-gray-900 border border-transparent hover:border-orange-200'
                                        : 'bg-dark-100 hover:bg-dark-200 text-white'
                                )}
                            >
                                {item.logo && (
                                    <img src={item.logo} alt="" className="w-10 h-10 rounded-lg object-contain bg-white p-1 shadow-sm" />
                                )}
                                <div className="text-left flex-1 min-w-0">
                                    <p className="font-medium whitespace-normal break-words leading-snug">{item.name || item.displayName}</p>
                                    {item.code && <p className={clsx("text-sm mt-0.5", theme === 'light' ? 'text-gray-500' : 'text-gray-400')}>{item.code}</p>}
                                </div>
                                <ChevronRight size={18} className="text-gray-400" />
                            </button>
                        ))}
                    </div>
                )}
            </BottomSheet>
        </div>
    );
}
