// ==================================
// Content Store (College/Branch/Year/Semester Selection)
// ==================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Selection {
    college: { id: string; name?: string; displayName?: string } | null;
    branch: { id: string; name?: string; displayName?: string } | null;
    year: { id: string; name?: string; displayName?: string } | null;
    semester: { id: string; name?: string; displayName?: string } | null;
}


interface ContentState {
    selection: Selection;
    currentStep: number; // 1-4

    // Actions
    setCollege: (college: Selection['college']) => void;
    setBranch: (branch: Selection['branch']) => void;
    setYear: (year: Selection['year']) => void;
    setSemester: (semester: Selection['semester']) => void;
    resetSelection: () => void;
    setStep: (step: number) => void;
}

const initialSelection: Selection = {
    college: null,
    branch: null,
    year: null,
    semester: null,
};

export const useContentStore = create<ContentState>()(
    persist(
        (set) => ({
            selection: initialSelection,
            currentStep: 1,

            setCollege: (college) =>
                set((state) => ({
                    selection: { ...state.selection, college, branch: null, year: null, semester: null },
                    currentStep: college ? 2 : 1,
                })),

            setBranch: (branch) =>
                set((state) => ({
                    selection: { ...state.selection, branch, year: null, semester: null },
                    currentStep: branch ? 3 : 2,
                })),

            setYear: (year) =>
                set((state) => ({
                    selection: { ...state.selection, year, semester: null },
                    currentStep: year ? 4 : 3,
                })),

            setSemester: (semester) =>
                set((state) => ({
                    selection: { ...state.selection, semester },
                    currentStep: semester ? 5 : 4,
                })),

            resetSelection: () =>
                set({ selection: initialSelection, currentStep: 1 }),

            setStep: (step) =>
                set({ currentStep: step }),
        }),
        {
            name: 'legezt-content',
        }
    )
);
