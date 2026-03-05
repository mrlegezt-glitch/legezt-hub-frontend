'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ChevronRight, Save, Plus, Trash2, Code, FileText,
    Settings, Eye, Loader2, Info, ArrowLeft,
    CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { labApi } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { safeTextToHtml } from '@/utils/sanitize';

const MDEditor = dynamic(
    () => import("@uiw/react-md-editor").then((mod) => mod.default),
    { ssr: false }
);
const MonacoEditor = dynamic(
    () => import("@monaco-editor/react"),
    { ssr: false }
);

export default function EditExperimentPage({ params }: { params: { courseId: string; expId: string } }) {
    const router = useRouter();
    const courseId = params.courseId;
    const expId = params.expId;

    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'theory' | 'code' | 'settings' | 'preview'>('theory');

    // Form Stats
    const [labDetails, setLabDetails] = useState({
        title: '',
        aim: '',
        procedure: '',
        solutionCode: '',
        language: 'python',
        testCases: [
            { input: '', output: '', type: 'sample' }
        ]
    });

    useEffect(() => {
        if (!expId) return;
        const loadExperiment = async () => {
            try {
                setLoading(true);
                const res = await labApi.getExperiment(expId);
                const data = res.data;
                const content = data.content || {};

                setLabDetails({
                    title: data.title || '',
                    aim: content.aim || '',
                    procedure: content.procedure || '',
                    solutionCode: content.solutionCode || '',
                    language: content.language || 'python',
                    testCases: content.testCases && content.testCases.length > 0
                        ? content.testCases
                        : [{ input: '', output: '', type: 'sample' }]
                });
            } catch (err) {
                console.error(err);
                alert('Failed to load experiment data.');
            } finally {
                setLoading(false);
            }
        };

        loadExperiment();
    }, [expId]);

    const addTestCase = () => {
        setLabDetails(prev => ({
            ...prev,
            testCases: [...prev.testCases, { input: '', output: '', type: 'sample' }]
        }));
    };

    const removeTestCase = (index: number) => {
        setLabDetails(prev => ({
            ...prev,
            testCases: prev.testCases.filter((_, i) => i !== index)
        }));
    };

    const updateTestCase = (index: number, field: string, value: any) => {
        const newCases = [...labDetails.testCases];
        // @ts-ignore
        newCases[index][field] = value;
        setLabDetails(prev => ({ ...prev, testCases: newCases }));
    };

    const handleSave = async () => {
        if (!labDetails.title) return alert('Experiment Title is required');
        if (!labDetails.solutionCode) return alert('Source Code is required for students to see');

        try {
            setLoading(true);
            const payload = {
                title: labDetails.title,
                description: labDetails.aim,
                content: {
                    procedure: labDetails.procedure,
                    aim: labDetails.aim,
                    solutionCode: labDetails.solutionCode,
                    language: labDetails.language,
                    testCases: labDetails.testCases.filter(tc => tc.input || tc.output)
                }
            };

            await labApi.updateExperiment(expId, payload);
            router.push(`/admin/legezttantra/courses/${courseId}`);
        } catch (error) {
            console.error(error);
            alert('Failed to save experiment. Check console for details.');
        } finally {
            setLoading(false);
        }
    }

    const tabs = [
        { id: 'theory', label: 'Theory & Problem', icon: FileText },
        { id: 'code', label: 'Solution Code', icon: Code },
        { id: 'settings', label: 'Test Cases', icon: Settings },
        { id: 'preview', label: 'Student Preview', icon: Eye },
    ];

    return (
        <div className="max-w-6xl mx-auto pb-20">
            {/* Header / Breadcrumb */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                        <Link href="/admin/legezttantra/courses" className="hover:text-primary-400 transition-colors">Lab Courses</Link>
                        <ChevronRight size={12} className="text-gray-700" />
                        <Link href={`/admin/legezttantra/courses/${courseId}`} className="hover:text-primary-400 transition-colors">Course Editor</Link>
                        <ChevronRight size={12} className="text-gray-700" />
                        <span className="text-primary-500">Edit Experiment</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href={`/admin/legezttantra/courses/${courseId}`} className="p-2 bg-dark-200 border border-dark-border rounded-lg text-gray-400 hover:text-white transition-all">
                            <ArrowLeft size={18} />
                        </Link>
                        <input
                            type="text"
                            placeholder="Untilted Experiment..."
                            className="text-4xl font-extrabold text-white placeholder:text-gray-800 bg-transparent border-none focus:ring-0 outline-none w-full"
                            value={labDetails.title}
                            onChange={(e) => setLabDetails({ ...labDetails, title: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="btn-primary flex items-center gap-2 px-8 py-3 shadow-xl shadow-primary-500/10 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                        {loading ? 'PUBLISHING...' : 'SAVE CHANGES'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-10">
                {/* Side Navigation */}
                <div className="col-span-12 lg:col-span-3 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full text-left px-5 py-4 rounded-xl flex items-center justify-between font-bold transition-all border group ${activeTab === tab.id
                                ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-500/20'
                                : 'bg-dark-200 border-dark-border text-gray-400 hover:border-gray-700 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <tab.icon size={20} className={activeTab === tab.id ? 'text-white' : 'text-gray-500 group-hover:text-primary-400'} />
                                <span className="text-sm">{tab.label}</span>
                            </div>
                            {activeTab === tab.id && <motion.div layoutId="tab-indicator" className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />}
                        </button>
                    ))}

                    <div className="mt-8 p-6 bg-dark-200/50 border border-dark-border rounded-2xl">
                        <div className="flex items-center gap-2 text-primary-400 mb-2">
                            <Info size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Editor Tip</span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed italic">
                            Markdown is supported for the Procedure section. Use `###` for headers and `---` for dividers.
                        </p>
                    </div>
                </div>

                {/* Content Panel */}
                <div className="col-span-12 lg:col-span-9 bg-dark-200 border border-dark-border rounded-3xl p-1 shadow-2xl overflow-hidden min-h-[700px] relative">
                    <AnimatePresence mode="wait">
                        {activeTab === 'theory' && (
                            <motion.div
                                key="theory"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="p-8 space-y-8"
                            >
                                <div>
                                    <label className="text-[10px] font-bold text-primary-500 uppercase tracking-[0.2em] block mb-4">Aim & Objective</label>
                                    <textarea
                                        className="w-full bg-dark-100 border border-dark-border rounded-2xl p-6 text-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none min-h-[120px] transition-all"
                                        placeholder="What will students learn in this experiment?"
                                        value={labDetails.aim}
                                        onChange={(e) => setLabDetails({ ...labDetails, aim: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="w-full min-w-0">
                                    <label className="text-[10px] font-bold text-primary-500 uppercase tracking-[0.2em] block mb-4">Step-by-Step Instructions</label>
                                    <div className="bg-dark-100 border border-dark-border rounded-2xl overflow-hidden" data-color-mode="dark">
                                        <MDEditor
                                            value={labDetails.procedure}
                                            onChange={(val) => setLabDetails({ ...labDetails, procedure: val || '' })}
                                            height={450}
                                            preview="live"
                                            hideToolbar={false}
                                            enableScroll={true}
                                            className="w-full !border-0"
                                            textareaProps={{
                                                placeholder: "# Heading\n1. First Step...\n2. Second Step..."
                                            }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'code' && (
                            <motion.div
                                key="code"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-8 space-y-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-[10px] font-bold text-primary-500 uppercase tracking-[0.2em]">Source Code Solution</label>
                                    <select
                                        className="bg-dark-100 border border-dark-border text-gray-300 text-xs rounded-xl px-4 py-2 outline-none focus:border-primary-500 transition-colors"
                                        value={labDetails.language}
                                        onChange={(e) => setLabDetails({ ...labDetails, language: e.target.value })}
                                    >
                                        <option value="python">Python 3</option>
                                        <option value="java">Java 17</option>
                                        <option value="c">C (GCC)</option>
                                        <option value="cpp">C++ 20</option>
                                        <option value="javascript">Node.js</option>
                                    </select>
                                </div>

                                <div className="h-[550px] w-full rounded-2xl overflow-hidden border border-dark-border shadow-2xl relative">
                                    {/* Muted background when empty */}
                                    {!labDetails.solutionCode && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                            <span className="text-gray-600 opacity-50 text-sm font-mono tracking-widest">{`// optimal_solution_goes_here`}</span>
                                        </div>
                                    )}
                                    <MonacoEditor
                                        height="100%"
                                        language={labDetails.language === 'c' || labDetails.language === 'cpp' ? 'cpp' : labDetails.language}
                                        theme="vs-dark"
                                        value={labDetails.solutionCode}
                                        onChange={(val) => setLabDetails({ ...labDetails, solutionCode: val || '' })}
                                        options={{
                                            minimap: { enabled: false },
                                            fontSize: 14,
                                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                            padding: { top: 20 },
                                            scrollBeyondLastLine: false,
                                            smoothScrolling: true,
                                            cursorBlinking: 'smooth',
                                            cursorSmoothCaretAnimation: 'on',
                                            renderLineHighlight: 'all',
                                            lineHeight: 24,
                                        }}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'settings' && (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-8 space-y-8"
                            >
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-primary-500 uppercase tracking-[0.2em]">Test Bench Reference</label>
                                    <button
                                        onClick={addTestCase}
                                        className="text-xs bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-primary-600/20 active:scale-95"
                                    >
                                        + ADD TEST CASE
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {labDetails.testCases.map((tc, index) => (
                                        <div key={index} className="bg-dark-100 border border-dark-border rounded-2xl p-6 relative group transition-all hover:border-gray-600">
                                            <button
                                                onClick={() => removeTestCase(index)}
                                                className="absolute top-6 right-6 text-gray-600 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <div className="text-[10px] font-extrabold text-gray-600 mb-6 tracking-[0.1em]">TEST CASE REFERENCE {index + 1}</div>
                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] text-gray-500 font-bold uppercase">Standard Input</label>
                                                    <textarea
                                                        className="w-full bg-dark-200 border border-dark-border rounded-xl p-4 text-xs font-mono text-gray-300 min-h-[100px] outline-none focus:border-primary-500"
                                                        value={tc.input}
                                                        onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                                                    ></textarea>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] text-gray-500 font-bold uppercase">Expected Output</label>
                                                    <textarea
                                                        className="w-full bg-dark-200 border border-dark-border rounded-xl p-4 text-xs font-mono text-gray-300 min-h-[100px] outline-none focus:border-primary-500"
                                                        value={tc.output}
                                                        onChange={(e) => updateTestCase(index, 'output', e.target.value)}
                                                    ></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'preview' && (
                            <motion.div
                                className="bg-[#1e222d] h-full flex flex-col p-8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="text-center mb-8">
                                    <div className="inline-block bg-primary-500/10 text-primary-400 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest border border-primary-500/20">STUDENT VIEW SIMULATION</div>
                                </div>
                                <div className="flex-1 bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[600px] text-slate-800 p-8 border border-white/20">
                                    <div className="max-w-xl mx-auto space-y-8 w-full">
                                        <h1 className="text-3xl font-extrabold text-[#4139a8] leading-tight italic">{labDetails.title || 'Experiment Title'}</h1>
                                        <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Outcome</h3>
                                            <p className="text-sm text-slate-700 leading-relaxed font-medium">{labDetails.aim || 'Aim goes here...'}</p>
                                        </div>
                                        <div className="prose prose-sm prose-slate">
                                            <div dangerouslySetInnerHTML={{ __html: safeTextToHtml(labDetails.procedure ?? '') || 'Instructions will appear here...' }} />
                                        </div>
                                    </div>
                                </div>
                                <p className="text-center mt-6 text-xs text-gray-500 italic">This is a simplified visual simulation of the instructional panel.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
