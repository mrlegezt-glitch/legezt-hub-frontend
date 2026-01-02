'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { School, ArrowRight, Plus, Trash2, CheckCircle, UploadCloud, ChevronRight, BookOpen } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

// Type Definitions matching our backend logic
interface Subject { name: string; code: string; }
interface Semester { semesterNumber: number; displayName: string; subjects: Subject[]; }
interface Year { yearNumber: number; displayName: string; semesters: Semester[]; }
interface Branch { name: string; code: string; years: Year[]; }

export default function CreateCollegePage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [error, setError] = useState('');

    // Form State
    const [collegeInfo, setCollegeInfo] = useState({ name: '', code: '', logo: '' });
    const [branches, setBranches] = useState<Branch[]>([]);

    // Step 1: Basic Info
    const isStep1Valid = collegeInfo.name && collegeInfo.code;

    // Helper to add a branch
    const addBranch = () => {
        setBranches([...branches, { name: '', code: '', years: [] }]);
    };

    // Helper to update branch
    const updateBranch = (index: number, field: 'name' | 'code', value: string) => {
        const newBranches = [...branches];
        newBranches[index] = { ...newBranches[index], [field]: value };
        setBranches(newBranches);
    };

    // Helper to initialize default years (1-4) for a branch
    const initYearsForBranch = (branchIndex: number) => {
        const newBranches = [...branches];
        if (newBranches[branchIndex].years.length === 0) {
            newBranches[branchIndex].years = Array.from({ length: 4 }, (_, i) => ({
                yearNumber: i + 1,
                displayName: `${i + 1}${getOrdinal(i + 1)} Year`,
                semesters: Array.from({ length: 2 }, (_, j) => ({
                    semesterNumber: (i * 2) + j + 1,
                    displayName: `Semester ${(i * 2) + j + 1}`,
                    subjects: []
                }))
            }));
        }
        setBranches(newBranches);
    };

    // Helper to add subject to a specific semester
    const addSubject = (branchIdx: number, yearIdx: number, semIdx: number) => {
        const newBranches = [...branches];
        newBranches[branchIdx].years[yearIdx].semesters[semIdx].subjects.push({ name: '', code: '' });
        setBranches(newBranches);
    };

    // Helper to update subject
    const updateSubject = (branchIdx: number, yearIdx: number, semIdx: number, subIdx: number, field: 'name' | 'code', value: string) => {
        const newBranches = [...branches];
        newBranches[branchIdx].years[yearIdx].semesters[semIdx].subjects[subIdx][field as keyof Subject] = value;
        setBranches(newBranches);
    };

    const handleSubmit = async () => {
        if (loading) return;
        setLoading(true);
        setError('');

        try {
            await api.post('/admin/colleges/create-structure', {
                ...collegeInfo,
                branches
            });
            router.push('/admin/colleges'); // Redirect to list
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to create college structure');
        } finally {
            setLoading(false);
        }
    };

    function getOrdinal(n: number) {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    }

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-12 pb-24">
            <h1 className="text-3xl font-bold text-white mb-2">Create New College Hierarchy</h1>
            <p className="text-gray-400 mb-8">Follow the steps to configure the college, branches, and curriculum structure.</p>

            {/* Stepper */}
            <div className="flex items-center gap-4 mb-12 overflow-x-auto pb-4">
                {[1, 2, 3].map((step) => (
                    <div key={step} className={`flex items-center gap-2 px-4 py-2 rounded-full border ${currentStep === step ? 'bg-primary-600 border-primary-500 text-white' : currentStep > step ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-dark-100 border-dark-border text-gray-500'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep === step ? 'bg-white text-primary-600' : currentStep > step ? 'bg-green-500 text-black' : 'bg-dark-300'}`}>
                            {currentStep > step ? <CheckCircle size={14} /> : step}
                        </div>
                        <span className="whitespace-nowrap text-sm font-medium">
                            {step === 1 ? 'College Info' : step === 2 ? 'Branches & Years' : 'Review & Submit'}
                        </span>
                    </div>
                ))}
            </div>

            {/* Step 1: College Info */}
            {currentStep === 1 && (
                <div className="space-y-6 max-w-2xl bg-dark-200 p-8 rounded-2xl border border-dark-border">
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">College Name <span className="text-red-400">*</span></label>
                        <input
                            type="text"
                            className="w-full bg-dark-100 border border-dark-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                            placeholder="e.g. Demo Institute of Technology"
                            value={collegeInfo.name}
                            onChange={(e) => setCollegeInfo({ ...collegeInfo, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">College Code (Unique) <span className="text-red-400">*</span></label>
                        <input
                            type="text"
                            className="w-full bg-dark-100 border border-dark-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 font-mono"
                            placeholder="DIT001"
                            value={collegeInfo.code}
                            onChange={(e) => setCollegeInfo({ ...collegeInfo, code: e.target.value.toUpperCase() })}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Logo URL (Optional)</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="w-full bg-dark-100 border border-dark-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                                placeholder="https://..."
                                value={collegeInfo.logo}
                                onChange={(e) => setCollegeInfo({ ...collegeInfo, logo: e.target.value })}
                            />
                            {/* In future iterate: Add Image Upload Component here */}
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button
                            disabled={!isStep1Valid}
                            onClick={() => setCurrentStep(2)}
                            className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next: Add Branches <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Hierarchy Builder */}
            {currentStep === 2 && (
                <div className="space-y-8">
                    {branches.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-dark-border rounded-2xl">
                            <School size={48} className="mx-auto text-gray-600 mb-4" />
                            <h3 className="text-xl font-bold text-gray-300">No Branches Added Yet</h3>
                            <button onClick={addBranch} className="mt-4 btn-primary px-6 py-2 rounded-lg inline-flex items-center gap-2">
                                <Plus size={18} /> Add First Branch
                            </button>
                        </div>
                    )}

                    {branches.map((branch, fieldIdx) => (
                        <div key={fieldIdx} className="bg-dark-200 border border-dark-border rounded-2xl overflow-hidden">
                            {/* Branch Header */}
                            <div className="p-6 bg-dark-300 border-b border-dark-border flex items-start justify-between">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 mr-4">
                                    <input
                                        type="text"
                                        placeholder="Branch Name (e.g. Computer Science)"
                                        className="bg-dark-100 border border-dark-border rounded-lg px-3 py-2 text-white text-sm"
                                        value={branch.name}
                                        onChange={(e) => updateBranch(fieldIdx, 'name', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Code (e.g. CSE)"
                                        className="bg-dark-100 border border-dark-border rounded-lg px-3 py-2 text-white text-sm font-mono"
                                        value={branch.code}
                                        onChange={(e) => updateBranch(fieldIdx, 'code', e.target.value.toUpperCase())}
                                    />
                                </div>
                                <button onClick={() => {
                                    const newBranches = branches.filter((_, i) => i !== fieldIdx);
                                    setBranches(newBranches);
                                }} className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg">
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            {/* Years & Semesters */}
                            <div className="p-6">
                                {branch.years.length === 0 ? (
                                    <button
                                        onClick={() => initYearsForBranch(fieldIdx)}
                                        className="w-full py-8 border-2 border-dashed border-dark-border rounded-xl text-gray-500 hover:border-primary-500/50 hover:text-primary-400 hover:bg-primary-500/5 transition-all"
                                    >
                                        + Generate Default Structure (4 Years, 8 Semesters)
                                    </button>
                                ) : (
                                    <div className="space-y-6">
                                        {branch.years.map((year, yearIdx) => (
                                            <div key={yearIdx} className="pl-4 border-l-2 border-dark-border">
                                                <h4 className="font-bold text-gray-300 mb-4 flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                    {year.displayName}
                                                </h4>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {year.semesters.map((sem, semIdx) => (
                                                        <div key={semIdx} className="bg-dark-100 p-4 rounded-xl border border-dark-border">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className="text-sm font-medium text-gray-400">{sem.displayName}</span>
                                                                <button onClick={() => addSubject(fieldIdx, yearIdx, semIdx)} className="text-xs text-primary-400 hover:underline flex items-center gap-1">
                                                                    <Plus size={12} /> Add Subject
                                                                </button>
                                                            </div>

                                                            {/* Subjects List */}
                                                            <div className="space-y-2">
                                                                {sem.subjects.map((sub, subIdx) => (
                                                                    <div key={subIdx} className="flex gap-2">
                                                                        <input
                                                                            placeholder="Subject Name"
                                                                            className="flex-1 bg-dark-300 border-none rounded px-2 py-1 text-xs text-white"
                                                                            value={sub.name}
                                                                            onChange={(e) => updateSubject(fieldIdx, yearIdx, semIdx, subIdx, 'name', e.target.value)}
                                                                        />
                                                                        <input
                                                                            placeholder="Code"
                                                                            className="w-20 bg-dark-300 border-none rounded px-2 py-1 text-xs text-white font-mono"
                                                                            value={sub.code}
                                                                            onChange={(e) => updateSubject(fieldIdx, yearIdx, semIdx, subIdx, 'code', e.target.value)}
                                                                        />
                                                                    </div>
                                                                ))}
                                                                {sem.subjects.length === 0 && (
                                                                    <p className="text-xs text-gray-600 italic">No subjects added</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {branches.length > 0 && (
                        <div className="flex justify-between pt-8 border-t border-dark-border">
                            <button onClick={addBranch} className="text-gray-400 hover:text-white flex items-center gap-2 px-4 py-2 hover:bg-dark-200 rounded-lg">
                                <Plus size={18} /> Add Another Branch
                            </button>
                            <div className="flex gap-4">
                                <button onClick={() => setCurrentStep(1)} className="px-6 py-2 text-gray-400 hover:text-white">Back</button>
                                <button onClick={() => setCurrentStep(3)} className="btn-primary px-8 py-2 rounded-xl">Review Structure</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
                <div className="bg-dark-200 p-8 rounded-2xl border border-dark-border">
                    <h2 className="text-2xl font-bold mb-6">Review Configuration</h2>

                    <div className="mb-8 p-4 bg-dark-300 rounded-xl">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center text-2xl">🏛️</div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{collegeInfo.name}</h3>
                                <p className="text-gray-400 font-mono">{collegeInfo.code}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <h4 className="text-gray-400 uppercase text-xs font-bold tracking-wider">Branch Structure Preview</h4>
                        {branches.map((b, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border border-dark-border rounded-lg bg-dark-100">
                                <div>
                                    <span className="font-bold text-white">{b.name}</span>
                                    <span className="ml-2 text-xs bg-dark-300 px-2 py-1 rounded text-gray-400">{b.code}</span>
                                </div>
                                <div className="text-sm text-gray-400">
                                    {b.years.length} Years • {b.years.reduce((acc, y) => acc + y.semesters.length, 0)} Semesters
                                </div>
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-4 justify-end">
                        <button onClick={() => setCurrentStep(2)} className="px-6 py-3 text-gray-400 hover:text-white">Back to Edit</button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || branches.length === 0}
                            className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Confirm & Create Hierarchy'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
