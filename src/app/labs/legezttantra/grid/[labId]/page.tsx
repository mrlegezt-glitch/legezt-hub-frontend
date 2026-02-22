'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { labApi } from '@/lib/api';
import {
    ChevronLeft, Check, Info, Code, FileText,
    Terminal, Loader2, Maximize2, Lock,
    Search, ChevronRight, RotateCcw, Send, Folder, CheckCircle2, Server, Clock, Activity
} from 'lucide-react';
import LeGeZtHeader from '@/components/labs/LeGeZtHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function StudentCodeViewerPage({ params }: { params: { labId: string } }) {
    const labId = params.labId;
    const router = useRouter();

    const [lab, setLab] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [sidebarWidth, setSidebarWidth] = useState(300);
    const [instructionWidth, setInstructionWidth] = useState(45); // percentage
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Fetch Course Structure for Sidebar Navigation
    const [units, setUnits] = useState<any[]>([]);
    const [activeUnitId, setActiveUnitId] = useState<string | null>(null);

    useEffect(() => {
        if (!labId) return;
        loadData();
    }, [labId]);

    // Handle Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile && isSidebarOpen) setSidebarOpen(false); // auto close sidebar on mobile
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await labApi.getExperiment(labId);
            setLab(res.data);

            if (res.data.unit?.course?.id) {
                const courseContent = await labApi.getCourseContent(res.data.unit.course.id);
                setUnits(courseContent.data);
                setActiveUnitId(res.data.unitId);
            }
        } catch (error) {
            console.error('Failed to fetch experiment:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen flex-col bg-[#0f172a] items-center justify-center">
                <Loader2 className="animate-spin text-indigo-500" size={40} />
                <p className="text-slate-400 mt-4 font-medium">Loading Lab Environment...</p>
            </div>
        );
    }

    if (!lab) return <div className="p-10 text-center text-slate-500">Failed to load lab data.</div>;

    const solutionCode = lab.content?.solutionCode || '// No solution code provided yet.';

    // Flatten experiments for navigation
    const allExperiments: any[] = [];
    units.forEach(u => {
        if (u.experiments) {
            u.experiments.forEach((e: any) => {
                allExperiments.push({ ...e, unitTitle: u.title });
            });
        }
    });

    const currentIndex = allExperiments.findIndex(e => e.id === labId);
    const prevExp = currentIndex > 0 ? allExperiments[currentIndex - 1] : null;
    const nextExp = currentIndex < allExperiments.length - 1 ? allExperiments[currentIndex + 1] : null;

    const filteredUnits = units.map(u => ({
        ...u,
        experiments: u.experiments?.filter((e: any) =>
            e.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(u => u.experiments && u.experiments.length > 0);

    return (
        <div className="flex flex-col h-screen bg-white overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">
            <LeGeZtHeader className="shrink-0" />

            {/* MAIN WORKSPACE */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden pt-16 relative">

                {/* 1. EXPLORER SIDEBAR */}
                <AnimatePresence initial={false}>
                    {isSidebarOpen && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: isMobile ? '100%' : sidebarWidth, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="bg-[#fcfcfd] border-r border-slate-200 flex flex-col shrink-0 z-50 overflow-hidden absolute inset-0 md:relative h-full"
                        >
                            <div className="p-4 flex flex-col h-full min-w-[300px] w-full">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h2 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Explorer</h2>
                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">Lab v2.0</span>
                                        </div>
                                        <h1 className="text-sm font-bold text-slate-800 truncate" title={lab.unit?.course?.title}>
                                            {lab.unit?.course?.title}
                                        </h1>
                                    </div>
                                    <button onClick={() => setSidebarOpen(false)} className="md:hidden shrink-0 text-slate-400 p-2 bg-slate-100 rounded-lg">
                                        <ChevronLeft size={16} />
                                    </button>
                                </div>

                                {/* Search Field */}
                                <div className="relative mb-6 group">
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Search topics (Ctrl+K)"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full text-xs bg-white border border-slate-200 rounded-md py-2.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700"
                                    />
                                    <Search size={14} className="absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                </div>

                                {/* Tree View */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                                    {filteredUnits.map((unit, uIdx) => (
                                        <div key={unit.id} className="space-y-1">
                                            <div className="flex items-center gap-2 py-1 px-1">
                                                <div className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                                                    {uIdx + 1}
                                                </div>
                                                <span className="text-[11px] font-bold text-slate-700 truncate uppercase tracking-tight">{unit.title}</span>
                                            </div>
                                            <div className="space-y-[2px] ml-1 border-l-2 border-slate-100 pl-4">
                                                {unit.experiments.map((exp: any, eIdx: number) => (
                                                    <button
                                                        key={exp.id}
                                                        onClick={() => router.push(`/labs/legezttantra/grid/${exp.id}`)}
                                                        className={`w-full text-left px-3 py-2 text-xs rounded transition-all flex items-center gap-2 group ${exp.id === labId
                                                            ? 'bg-indigo-50 text-indigo-700 font-bold border-r-2 border-indigo-600 shadow-sm'
                                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                                            }`}
                                                    >
                                                        <Code size={12} className={exp.id === labId ? 'text-indigo-600' : 'text-slate-300 group-hover:text-slate-400'} />
                                                        <span className="truncate">{uIdx + 1}.{eIdx + 1}. {exp.title}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {filteredUnits.length === 0 && (
                                        <div className="text-center py-8 text-slate-400 text-xs">No topics found matching your search.</div>
                                    )}
                                </div>
                            </div>

                            {/* Sidebar Resizer */}
                            <div
                                className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-indigo-500/30 transition-colors z-30"
                                onMouseDown={(e) => {
                                    const handleMouseMove = (mmE: MouseEvent) => {
                                        const newWidth = mmE.clientX;
                                        if (newWidth > 200 && newWidth < 500) setSidebarWidth(newWidth);
                                    };
                                    const handleMouseUp = () => {
                                        document.removeEventListener('mousemove', handleMouseMove);
                                        document.removeEventListener('mouseup', handleMouseUp);
                                    };
                                    document.addEventListener('mousemove', handleMouseMove);
                                    document.addEventListener('mouseup', handleMouseUp);
                                }}
                            />
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Sidebar Toggle (Floating) */}
                <button
                    onClick={() => setSidebarOpen(!isSidebarOpen)}
                    className="absolute top-1/2 left-0 z-40 w-5 h-10 md:w-5 md:h-10 bg-white border border-slate-200 border-l-0 rounded-r-md flex items-center justify-center shadow-md hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-all -translate-y-1/2"
                    style={{ left: isMobile ? (isSidebarOpen ? '100%' : 0) : (isSidebarOpen ? sidebarWidth : 0), display: isMobile && isSidebarOpen ? 'none' : 'flex' }}
                >
                    {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                </button>

                {/* 2. INSTRUCTION PANEL (Center) */}
                <div
                    className="bg-white flex flex-col overflow-hidden border-b md:border-b-0 md:border-r border-slate-200 shrink-0 md:shrink"
                    style={{ width: isMobile ? '100%' : `${instructionWidth}%`, height: isMobile ? '45%' : 'auto' }}
                >
                    {/* Header */}
                    <div className="bg-[#4139a8] px-4 md:px-6 py-4 md:py-5 flex flex-col shrink-0 text-white relative overflow-hidden shadow-lg selection:bg-white/20">
                        <div className="flex items-center justify-between mb-2 relative z-10">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-sm backdrop-blur-md uppercase tracking-widest">Problem Statement</span>
                                    <span className="text-white/40 text-[10px]">•</span>
                                    <span className="text-white/60 text-[10px] font-medium">{lab.unitTitle || 'Module 1'}</span>
                                </div>
                                <h2 className="text-xl font-bold tracking-tight text-white drop-shadow-sm">
                                    {lab.title}
                                </h2>
                            </div>
                            <div className="flex items-center gap-2 md:gap-3">
                                <div className="bg-orange-500/20 text-orange-400 border border-orange-500/40 px-2 md:px-3 py-1 rounded-full text-[10px] font-extrabold font-mono shadow-inner flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                                    <span className="hidden md:inline">00:45:12</span>
                                </div>
                                <button className="text-white/60 hover:text-white transition-colors"><Maximize2 size={16} /></button>
                                <button className="hidden md:block text-white/60 hover:text-white transition-colors"><Info size={16} /></button>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
                    </div>

                    {/* Content Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                        <div className="max-w-3xl">
                            {/* Aim */}
                            <div className="mb-10">
                                <h3 className="text-[11px] font-extrabold text-[#4139a8] mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                                    Outcome & Objective
                                </h3>
                                <p className="text-slate-700 text-base leading-relaxed font-medium bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
                                    {lab.description}
                                </p>
                            </div>

                            {/* Procedure / Content */}
                            {lab.content?.procedure && (
                                <div className="mb-10">
                                    <h3 className="text-[11px] font-extrabold text-[#4139a8] mb-4 uppercase tracking-[0.2em]">Step-by-Step Instructions</h3>
                                    <div className="prose prose-slate prose-sm max-w-none text-slate-600 leading-7">
                                        <div dangerouslySetInnerHTML={{ __html: lab.content.procedure.replace(/\n/g, '<br/>') }} />
                                    </div>
                                </div>
                            )}

                            {/* Sample Test Cases (Expandable Card) */}
                            {lab.content?.testCases?.length > 0 && (
                                <div className="mb-10">
                                    <h3 className="text-[11px] font-extrabold text-[#4139a8] mb-4 uppercase tracking-[0.2em]">Data Verification</h3>
                                    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-sm">
                                        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <FileText size={16} className="text-orange-500" />
                                                <span className="text-sm font-bold text-slate-800">Sample Test Cases</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{lab.content.testCases.length} Cases</span>
                                        </div>
                                        <div className="divide-y divide-slate-200">
                                            {lab.content.testCases.map((tc: any, i: number) => (
                                                <div key={i} className="p-6">
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                                                        Test Case #{i + 1}
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <div className="text-[10px] text-slate-500 mb-1.5 font-bold">INPUT DATA</div>
                                                            <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-800 relative group overflow-hidden">
                                                                <pre className="whitespace-pre-wrap">{tc.input}</pre>
                                                                <button
                                                                    onClick={() => navigator.clipboard.writeText(tc.input)}
                                                                    className="absolute top-2 right-2 p-1.5 bg-slate-50 text-slate-400 border border-slate-200 rounded opacity-0 group-hover:opacity-100 transition-all hover:text-indigo-600 hover:border-indigo-100"
                                                                >
                                                                    <Check size={10} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] text-slate-500 mb-1.5 font-bold">EXPECTED OUTPUT</div>
                                                            <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-800 relative group overflow-hidden">
                                                                <pre className="whitespace-pre-wrap">{tc.output}</pre>
                                                                <button
                                                                    onClick={() => navigator.clipboard.writeText(tc.output)}
                                                                    className="absolute top-2 right-2 p-1.5 bg-slate-50 text-slate-400 border border-slate-200 rounded opacity-0 group-hover:opacity-100 transition-all hover:text-indigo-600 hover:border-indigo-100"
                                                                >
                                                                    <Check size={10} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Vertical Resizer (Instruction/Code) */}
                <div
                    className="hidden md:block w-1.5 h-full cursor-col-resize hover:bg-indigo-500/20 transition-colors z-30 bg-slate-100 border-x border-slate-200"
                    onMouseDown={(e) => {
                        const startX = e.clientX;
                        const startWidth = instructionWidth;
                        const handleMouseMove = (mmE: MouseEvent) => {
                            const deltaX = ((mmE.clientX - startX) / window.innerWidth) * 100;
                            const newWidth = Math.min(Math.max(startWidth + deltaX, 20), 80);
                            setInstructionWidth(newWidth);
                        };
                        const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                        };
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                    }}
                />

                {/* 3. SOLUTION PANEL (Right) */}
                <div className="flex-1 bg-[#0f172a] flex flex-col overflow-hidden">
                    {/* Tab Bar */}
                    <div className="h-11 bg-[#1e293b] border-b border-slate-800 flex items-center px-4 shrink-0 justify-between">
                        <div className="flex h-full items-center">
                            <div className="bg-[#0f172a] h-full px-5 border-x border-slate-800 text-[11px] font-bold text-slate-300 flex items-center gap-2 border-t-2 border-t-indigo-500 shadow-md">
                                <Code size={13} className="text-indigo-400" />
                                Solution.{lab.content?.language === 'python' ? 'py' : lab.content?.language === 'java' ? 'java' : 'c'}
                            </div>
                            <div className="px-4 text-[10px] font-medium text-slate-500 flex items-center gap-2 italic">
                                Read Only Access
                            </div>
                        </div>
                        <button
                            onClick={() => navigator.clipboard.writeText(solutionCode)}
                            className="bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-2 transition-all shadow-md"
                        >
                            <span className="opacity-90">COPY CODE</span>
                            <Check size={12} />
                        </button>
                    </div>

                    {/* Code Editor Body */}
                    <div className="flex-1 overflow-auto relative custom-scrollbar bg-[#0f172a]">
                        <SyntaxHighlighter
                            language={lab.content?.language || 'javascript'}
                            style={vscDarkPlus}
                            customStyle={{
                                margin: 0,
                                background: 'transparent',
                                fontSize: '14px',
                                padding: '1.5rem',
                                lineHeight: '1.6',
                            }}
                            showLineNumbers={true}
                            lineNumberStyle={{ minWidth: '3em', paddingRight: '1.5em', color: '#475569', textAlign: 'right', borderRight: '1px solid #1e293b', marginRight: '1.5em' }}
                        >
                            {solutionCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* Mock Test Results UI */}
                    <div className="h-1/3 min-h-[260px] bg-[#1a2333] border-t border-slate-800 flex flex-col shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20">
                        {/* Header */}
                        <div className="h-12 bg-[#0f172a] flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-1 px-2 bg-emerald-500/10 border border-emerald-500/20 rounded-md flex items-center gap-2">
                                    <CheckCircle2 size={13} className="text-emerald-400" />
                                    <span className="text-emerald-400 text-[10px] font-black tracking-widest uppercase">Executed Successfully</span>
                                </div>
                                <span className="text-slate-500 text-[10px] font-bold">Passed all 2 test cases</span>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
                                <span className="flex items-center gap-1.5"><Clock size={12} /> 0.042s</span>
                                <span className="flex items-center gap-1.5"><Server size={12} /> 14MB Memory</span>
                            </div>
                        </div>

                        {/* Results Content */}
                        <div className="flex-1 flex overflow-hidden">
                            {/* Test Cases Sidebar */}
                            <div className="w-48 bg-[#1e293b]/50 border-r border-slate-800 flex flex-col shrink-0">
                                <div className="p-3 text-[10px] font-bold text-slate-500 tracking-widest uppercase border-b border-slate-800">Test Suite</div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                                    <button className="w-full text-left px-3 py-2 text-xs rounded bg-slate-800/80 border border-slate-700 text-slate-200 flex items-center justify-between shadow-sm">
                                        <span className="font-mono">Case 1</span> <Check size={14} className="text-emerald-400" />
                                    </button>
                                    <button className="w-full text-left px-3 py-2 text-xs rounded hover:bg-slate-800/50 text-slate-400 flex items-center justify-between transition-colors">
                                        <span className="font-mono flex items-center gap-2"><Lock size={10} className="text-slate-500" /> Case 2</span> <Check size={14} className="text-emerald-400" />
                                    </button>
                                </div>
                            </div>
                            {/* Verification Detail */}
                            <div className="flex-1 p-5 overflow-y-auto custom-scrollbar bg-[#161f2e]">
                                <div className="flex items-center gap-2 mb-4">
                                    <Activity size={16} className="text-indigo-400" />
                                    <h4 className="text-slate-300 text-sm font-bold">Standard Output</h4>
                                </div>
                                <pre className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl text-emerald-400 font-mono text-xs leading-relaxed shadow-inner">
                                    {`Build successful...\nExecuting binary...\n\nOutput matched expected result strictly.\nExit code: 0`}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* BOTTOM FOOTER (Premium Dark Action Bar) */}
            <div className="h-14 bg-[#1e293b] border-t border-slate-800 flex items-center justify-between px-2 md:px-6 shrink-0 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] overflow-x-auto custom-scrollbar">
                {/* Left Controls */}
                <div className="flex h-full items-center gap-1 shrink-0">
                    <button
                        onClick={() => lab.unit?.course?.id && router.push(`/labs/legezttantra/courses/${lab.unit.course.id}`)}
                        className="h-full px-4 md:px-6 text-[11px] font-extrabold text-white border-r border-slate-800/50 bg-indigo-600/20 hover:bg-indigo-600/30 flex items-center gap-2 transition-all border-b-2 border-indigo-500 shadow-inner"
                    >
                        <Folder size={14} className="text-indigo-400" /> <span className="hidden md:inline uppercase tracking-widest block">Go to Course</span>
                    </button>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 md:gap-3 shrink-0 py-2">
                    <div className="flex items-center bg-slate-900/50 rounded-lg p-1 mr-1 md:mr-2 border border-slate-800">
                        <button
                            onClick={() => prevExp && router.push(`/labs/legezttantra/grid/${prevExp.id}`)}
                            disabled={!prevExp}
                            className="p-1.5 md:p-2 text-slate-400 hover:text-white disabled:opacity-20 transition-all rounded"
                            title="Previous Exercise"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div className="w-px h-4 bg-slate-800 mx-1"></div>
                        <button
                            onClick={() => nextExp && router.push(`/labs/legezttantra/grid/${nextExp.id}`)}
                            disabled={!nextExp}
                            className="p-1.5 md:p-2 text-slate-400 hover:text-white disabled:opacity-20 transition-all rounded"
                            title="Next Exercise"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <button className="hidden md:flex bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-[11px] font-bold px-5 py-2 rounded-lg transition-all border border-slate-700 items-center gap-2">
                        <RotateCcw size={14} /> RESET
                    </button>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
                .tab-4 {
                    tab-size: 4;
                }
            `}</style>
        </div>
    );
}
