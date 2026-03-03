'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { School, ArrowRight, Plus, Trash2, CheckCircle, UploadCloud, ChevronRight, BookOpen, Loader2 } from 'lucide-react';
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
            <h1 className="text-3xl font-display font-bold text-white mb-2 drop-shadow-md">Create New College Hierarchy</h1>
            <p className="text-silver-400 mb-8 font-medium">Follow the steps to configure the college, branches, and curriculum structure.</p>

            {/* Stepper */}
            <div className="flex items-center gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide">
                {[1, 2, 3].map((step) => (
                    <div key={step} className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all shadow-inner ${currentStep === step ? 'bg-silver-gradient border-silver-light text-dark-android shadow-3d' : currentStep > step ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-dark-android border-silver-dark/20 text-silver-500'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-inner ${currentStep === step ? 'bg-dark-android text-silver-300' : currentStep > step ? 'bg-green-500 text-black' : 'bg-dark-surface border border-silver-dark/10'}`}>
                            {currentStep > step ? <CheckCircle size={14} /> : step}
                        </div>
                        <span className="whitespace-nowrap text-sm font-bold">
                            {step === 1 ? 'College Info' : step === 2 ? 'Branches & Years' : 'Review & Submit'}
                        </span>
                    </div>
                ))}
            </div>

            {/* Step 1: College Info */}
            {currentStep === 1 && (
                <div className="space-y-6 max-w-2xl bg-dark-surface shadow-android-card p-8 rounded-3xl border border-silver-dark/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-30 z-20" />
                    <div className="relative z-10">
                        <label className="text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 block ml-2">College Name <span className="text-red-400">*</span></label>
                        <input
                            type="text"
                            className="w-full bg-dark-android border border-silver-800 rounded-xl py-3 px-4 outline-none focus:border-silver-500 text-white font-bold shadow-inner-metallic placeholder-silver-600 transition-all"
                            placeholder="e.g. Demo Institute of Technology"
                            value={collegeInfo.name}
                            onChange={(e) => setCollegeInfo({ ...collegeInfo, name: e.target.value })}
                        />
                    </div>
                    <div className="relative z-10">
                        <label className="text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 block ml-2">College Code (Unique) <span className="text-red-400">*</span></label>
                        <input
                            type="text"
                            className="w-full bg-dark-android border border-silver-800 rounded-xl py-3 px-4 outline-none focus:border-silver-500 text-white font-bold shadow-inner-metallic placeholder-silver-600 transition-all font-mono tracking-wider"
                            placeholder="DIT001"
                            value={collegeInfo.code}
                            onChange={(e) => setCollegeInfo({ ...collegeInfo, code: e.target.value.toUpperCase() })}
                        />
                    </div>
                    <div className="relative z-10">
                        <label className="text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 block ml-2">Logo URL (Optional)</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="w-full bg-dark-android border border-silver-800 rounded-xl py-3 px-4 outline-none focus:border-silver-500 text-white font-bold shadow-inner-metallic placeholder-silver-600 transition-all"
                                placeholder="https://..."
                                value={collegeInfo.logo}
                                onChange={(e) => setCollegeInfo({ ...collegeInfo, logo: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="pt-6 flex justify-end relative z-10">
                        <button
                            disabled={!isStep1Valid}
                            onClick={() => setCurrentStep(2)}
                            className="bg-silver-gradient text-dark-android font-bold px-6 py-3 rounded-xl shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 border border-silver-light transition-all flex items-center gap-2 disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
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
                        <div className="text-center py-12 border border-dashed border-silver-dark/20 rounded-3xl bg-dark-android shadow-inner-metallic">
                            <School size={48} className="mx-auto text-silver-600 mb-4 drop-shadow-md" />
                            <h3 className="text-xl font-display font-bold text-silver-300 drop-shadow-md">No Branches Added Yet</h3>
                            <button onClick={addBranch} className="mt-6 bg-silver-gradient text-dark-android font-bold px-6 py-2.5 rounded-xl shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 border border-silver-light transition-all inline-flex items-center gap-2">
                                <Plus size={18} /> Add First Branch
                            </button>
                        </div>
                    )}

                    {branches.map((branch, fieldIdx) => (
                        <div key={fieldIdx} className="bg-dark-surface shadow-android-card border border-silver-dark/10 rounded-3xl overflow-hidden relative">
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-30 z-20" />
                            {/* Branch Header */}
                            <div className="p-6 bg-dark-android border-b border-silver-dark/10 flex items-start justify-between relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 mr-4">
                                    <input
                                        type="text"
                                        placeholder="Branch Name (e.g. Computer Science)"
                                        className="bg-dark-surface shadow-inner-metallic border border-silver-800 rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:border-silver-500 transition-all placeholder-silver-600 text-sm"
                                        value={branch.name}
                                        onChange={(e) => updateBranch(fieldIdx, 'name', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Code (e.g. CSE)"
                                        className="bg-dark-surface shadow-inner-metallic border border-silver-800 rounded-xl px-4 py-2.5 text-white font-bold font-mono tracking-wider outline-none focus:border-silver-500 transition-all placeholder-silver-600 text-sm"
                                        value={branch.code}
                                        onChange={(e) => updateBranch(fieldIdx, 'code', e.target.value.toUpperCase())}
                                    />
                                </div>
                                <button onClick={() => {
                                    const newBranches = branches.filter((_, i) => i !== fieldIdx);
                                    setBranches(newBranches);
                                }} className="text-silver-500 hover:text-red-400 bg-dark-surface shadow-inner hover:bg-red-500/10 p-2.5 rounded-xl border border-transparent hover:border-red-500/20 transition-all">
                                    <Trash2 size={20} />
                                </button>
                            </div>

                            {/* Years & Semesters */}
                            <div className="p-6 relative z-10">
                                {branch.years.length === 0 ? (
                                    <button
                                        onClick={() => initYearsForBranch(fieldIdx)}
                                        className="w-full py-8 border border-dashed border-silver-dark/20 rounded-2xl text-silver-500 font-bold hover:border-primary-500/50 hover:text-silver-300 hover:bg-dark-android shadow-inner-metallic transition-all bg-dark-android/50"
                                    >
                                        + Generate Default Structure (4 Years, 8 Semesters)
                                    </button>
                                ) : (
                                    <div className="space-y-6">
                                        {branch.years.map((year, yearIdx) => (
                                            <div key={yearIdx} className="pl-6 border-l-2 border-silver-dark/20 relative">
                                                <div className="absolute w-3 h-3 rounded-full bg-silver-metallic left-[-7px] top-1 shadow-glow" />
                                                <h4 className="font-display font-bold text-silver-300 mb-4 text-lg drop-shadow-md">
                                                    {year.displayName}
                                                </h4>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {year.semesters.map((sem, semIdx) => (
                                                        <div key={semIdx} className="bg-dark-android p-5 rounded-2xl border border-silver-dark/10 shadow-inner">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <span className="text-sm font-bold text-silver-400 uppercase tracking-widest">{sem.displayName}</span>
                                                                <button onClick={() => addSubject(fieldIdx, yearIdx, semIdx)} className="text-[10px] font-bold text-silver-300 bg-dark-surface shadow-android-card border border-silver-dark/20 px-2 py-1 rounded hover:bg-silver-metallic/20 transition-colors flex items-center gap-1 uppercase tracking-wider">
                                                                    <Plus size={12} /> Subject
                                                                </button>
                                                            </div>

                                                            {/* Subjects List */}
                                                            <div className="space-y-3">
                                                                {sem.subjects.map((sub, subIdx) => (
                                                                    <div key={subIdx} className="flex gap-2">
                                                                        <input
                                                                            placeholder="Subject Name"
                                                                            className="flex-1 bg-dark-surface shadow-inner-metallic border border-silver-800 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-silver-500 transition-all placeholder-silver-600"
                                                                            value={sub.name}
                                                                            onChange={(e) => updateSubject(fieldIdx, yearIdx, semIdx, subIdx, 'name', e.target.value)}
                                                                        />
                                                                        <input
                                                                            placeholder="Code"
                                                                            className="w-24 bg-dark-surface shadow-inner-metallic border border-silver-800 rounded-lg px-3 py-2 text-xs font-bold text-white font-mono tracking-wider outline-none focus:border-silver-500 transition-all placeholder-silver-600"
                                                                            value={sub.code}
                                                                            onChange={(e) => updateSubject(fieldIdx, yearIdx, semIdx, subIdx, 'code', e.target.value)}
                                                                        />
                                                                    </div>
                                                                ))}
                                                                {sem.subjects.length === 0 && (
                                                                    <p className="text-xs font-bold text-silver-600 italic">No subjects added</p>
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
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-8">
                            <button onClick={addBranch} className="text-silver-400 font-bold hover:text-white flex items-center justify-center gap-2 px-6 py-3 bg-dark-surface shadow-android-card border border-silver-dark/10 hover:border-silver-dark/30 rounded-xl transition-all">
                                <Plus size={18} /> Add Another Branch
                            </button>
                            <div className="flex gap-4">
                                <button onClick={() => setCurrentStep(1)} className="px-6 py-3 text-sm font-bold text-silver-400 hover:text-white transition-colors">Back</button>
                                <button onClick={() => setCurrentStep(3)} className="bg-silver-gradient text-dark-android font-bold px-8 py-3 rounded-xl shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 border border-silver-light transition-all">Review Structure</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
                <div className="bg-dark-surface shadow-android-card p-8 rounded-3xl border border-silver-dark/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-30 z-20" />
                    <h2 className="text-2xl font-display font-bold text-white mb-8 drop-shadow-md relative z-10">Review Configuration</h2>

                    <div className="mb-8 p-6 bg-dark-android border border-silver-dark/10 shadow-inner rounded-3xl relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-dark-surface shadow-android-card border border-silver-dark/20 rounded-xl flex items-center justify-center text-3xl">🏛️</div>
                            <div>
                                <h3 className="text-2xl font-display font-bold text-white drop-shadow-md">{collegeInfo.name}</h3>
                                <p className="text-silver-400 font-mono font-bold mt-1 tracking-wider">{collegeInfo.code}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 mb-10 relative z-10">
                        <h4 className="text-[10px] font-bold text-silver-600 uppercase tracking-widest ml-2">Branch Structure Preview</h4>
                        {branches.map((b, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-silver-dark/10 rounded-2xl bg-dark-android shadow-inner gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="font-display font-bold text-lg text-white drop-shadow-md">{b.name}</span>
                                    <span className="text-[10px] font-bold bg-dark-surface border border-silver-dark/20 shadow-inner px-2 py-1 rounded-md text-silver-400 tracking-wider font-mono">{b.code}</span>
                                </div>
                                <div className="text-xs font-bold text-silver-500 flex items-center gap-3 bg-dark-surface px-3 py-1.5 rounded-lg border border-silver-dark/10 shadow-android-card">
                                    <span>{b.years.length} Years</span>
                                    <span className="w-1 h-1 rounded-full bg-silver-dark/50" />
                                    <span>{b.years.reduce((acc, y) => acc + y.semesters.length, 0)} Semesters</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 font-bold rounded-xl mb-8 text-sm relative z-10 shadow-inner">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-4 justify-end relative z-10 flex-col sm:flex-row">
                        <button onClick={() => setCurrentStep(2)} className="px-6 py-3 text-sm font-bold text-silver-400 hover:text-white transition-colors">Back to Edit</button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || branches.length === 0}
                            className="bg-silver-gradient text-dark-android font-bold px-8 py-3 rounded-xl shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 border border-silver-light transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                            {loading ? 'Creating...' : 'Confirm & Create Hierarchy'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
