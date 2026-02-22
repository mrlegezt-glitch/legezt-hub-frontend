'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Plus, FlaskConical, Edit, Trash2, Code, Loader2, ArrowLeft, Folder, Upload } from 'lucide-react';
import { labApi } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function CourseDetailsPage({ params }: { params: { courseId: string } }) {
    const courseId = params.courseId;

    const [course, setCourse] = useState<any>(null);
    const [units, setUnits] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCreateUnit, setShowCreateUnit] = useState(false);
    const [newUnitTitle, setNewUnitTitle] = useState('');
    const [uploadingBulk, setUploadingBulk] = useState(false);

    useEffect(() => {
        if (!courseId) {
            setError('No Course ID provided in URL');
            setLoading(false);
            return;
        }
        loadData();
    }, [courseId]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch Course & Units
            try {
                const [cRes, uRes] = await Promise.all([
                    labApi.getCourse(courseId),
                    labApi.getCourseContent(courseId)
                ]);
                setCourse(cRes.data);
                setUnits(uRes.data);
            } catch (err: any) {
                console.error('Failed to fetch data:', err);
                const backendError = err.response?.data?.details || err.response?.data?.error || err.message;
                setError(`Server Error: ${backendError}`);
            }

        } catch (error: any) {
            console.error('Unexpected error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUnit = async () => {
        if (!newUnitTitle) return;
        try {
            await labApi.createUnit({ courseId, title: newUnitTitle });
            setNewUnitTitle('');
            setShowCreateUnit(false);
            loadData();
        } catch (error) {
            alert('Failed to create unit');
        }
    };

    const handleBulkUpload = async (e: any) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        try {
            setUploadingBulk(true);
            const unitsMap = new Map<string, any>();

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const pathParts = file.webkitRelativePath.split('/');

                // Typical structure: [CourseFolder, UnitName, ExperimentName, filename]
                if (pathParts.length < 4) continue;

                const unitTitle = pathParts[1];
                const expTitle = pathParts[2];
                const filename = pathParts[3].toLowerCase();

                if (!unitsMap.has(unitTitle)) {
                    unitsMap.set(unitTitle, { title: unitTitle, experimentsMap: new Map() });
                }
                const unitData = unitsMap.get(unitTitle);

                if (!unitData.experimentsMap.has(expTitle)) {
                    unitData.experimentsMap.set(expTitle, {
                        title: expTitle,
                        aim: '',
                        procedure: '',
                        solutionCode: '',
                        language: 'python',
                        output: ''
                    });
                }
                const expData = unitData.experimentsMap.get(expTitle);
                const text = await file.text();

                if (filename.includes('aim') || filename.includes('objective')) {
                    expData.aim = text;
                } else if (filename.includes('step') || filename.includes('procedure')) {
                    expData.procedure = text;
                } else if (filename.includes('output') || filename.includes('test')) {
                    expData.output = text;
                } else if (filename.includes('program') || filename.includes('code') || filename.includes('solution') || filename.endsWith('.c') || filename.endsWith('.py') || filename.endsWith('.java') || filename.endsWith('.cpp')) {
                    expData.solutionCode = text;
                    if (filename.endsWith('.c')) expData.language = 'c';
                    else if (filename.endsWith('.cpp')) expData.language = 'cpp';
                    else if (filename.endsWith('.java')) expData.language = 'java';
                    else if (filename.endsWith('.js')) expData.language = 'javascript';
                    else if (filename.endsWith('.py')) expData.language = 'python';
                }
            }

            const payloadUnits = Array.from(unitsMap.values()).map((unit: any) => ({
                title: unit.title,
                experiments: Array.from(unit.experimentsMap.values())
            }));

            if (payloadUnits.length === 0) {
                alert('No valid units/experiments found in the selected folder.');
                setUploadingBulk(false);
                return;
            }

            await labApi.bulkCreate(courseId, { units: payloadUnits });
            alert(`Successfully imported ${payloadUnits.length} units.`);
            loadData();

        } catch (err: any) {
            console.error(err);
            alert('Failed to bulk upload. ' + err.message);
        } finally {
            setUploadingBulk(false);
            e.target.value = '';
        }
    };

    if (loading) {
        return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="animate-spin text-primary-500" size={40} /></div>;
    }

    if (error || !course) return (
        <div className="flex flex-col items-center justify-center h-[70vh] px-4">
            <div className="bg-red-500/10 p-10 rounded-[2.5rem] border border-red-500/20 max-w-lg text-center backdrop-blur-xl">
                <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
                    <FlaskConical size={32} />
                </div>
                <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Access Denied / Failed</h3>
                <p className="text-gray-400 mb-6 leading-relaxed font-medium">{error || 'The requested curriculum resource could not be located.'}</p>
                <div className="text-[10px] font-mono bg-black/40 p-3 rounded-xl mb-8 text-red-400/80 break-all select-all uppercase tracking-widest border border-red-500/10">ERR_ID: {courseId}</div>
                <Link href="/admin/legezttantra/courses">
                    <button className="bg-white text-black px-8 py-3 rounded-2xl hover:bg-gray-100 font-black transition-all shadow-xl shadow-white/5 uppercase tracking-tighter text-sm">
                        Return to Repository
                    </button>
                </Link>
            </div>
        </div>
    );

    return (
        <div className="space-y-12 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="relative">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-6">
                    <Link href="/admin/legezttantra/courses" className="hover:text-primary-400 transition-colors flex items-center gap-1">
                        <ArrowLeft size={12} /> Course Repository
                    </Link>
                    <ChevronRight size={10} className="text-gray-700" />
                    <span className="text-primary-500">Curriculum Editor</span>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="px-3 py-1 bg-primary-600/10 border border-primary-500/20 text-primary-400 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-inner">{course.subjectCode}</span>
                            <span className="px-3 py-1 bg-dark-200 border border-dark-border text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest">{course.regulation}</span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter leading-none">{course.title}</h1>
                        <p className="text-gray-500 font-bold text-sm tracking-wide flex items-center gap-4">
                            <span>{course.year} ACADEMIC YEAR</span>
                            <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                            <span>{course.semester} PHASE</span>
                            <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                            <span className="text-primary-500">{units.length} ACTIVE MODULES</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => document.getElementById('bulk-upload-input')?.click()}
                            disabled={uploadingBulk}
                            className="bg-dark-300 text-gray-300 border border-dark-border px-6 py-3.5 rounded-2xl flex items-center gap-2 font-black hover:bg-dark-border transition-all uppercase tracking-tighter text-sm disabled:opacity-50"
                        >
                            {uploadingBulk ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                            {uploadingBulk ? 'IMPORTING...' : 'BULK IMPORT'}
                        </button>
                        <input
                            type="file"
                            id="bulk-upload-input"
                            hidden
                            //@ts-ignore
                            webkitdirectory="true"
                            directory="true"
                            multiple
                            onChange={handleBulkUpload}
                        />
                        <button
                            onClick={() => setShowCreateUnit(true)}
                            className="btn-primary px-8 py-3.5 flex items-center gap-3 shadow-2xl shadow-primary-500/30 active:scale-95 text-sm disabled:opacity-50"
                            disabled={uploadingBulk}
                        >
                            <Plus size={20} />
                            ADD SYLLABUS UNIT
                        </button>
                    </div>
                </div>
            </div>

            {/* Create Unit Inline Input */}
            <AnimatePresence>
                {showCreateUnit && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-primary-600/5 border border-primary-500/20 p-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 backdrop-blur-xl shadow-2xl"
                    >
                        <div className="w-14 h-14 bg-primary-600/20 rounded-2xl flex items-center justify-center text-primary-400 shrink-0">
                            <Folder size={28} />
                        </div>
                        <input
                            type="text"
                            placeholder="Defining Module Title (e.g. Unit 1: Foundations of Algorithms)"
                            className="flex-1 bg-dark-300 border border-dark-border rounded-2xl px-6 py-4 text-white font-bold placeholder:text-gray-700 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                            autoFocus
                            value={newUnitTitle}
                            onChange={(e) => setNewUnitTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateUnit()}
                        />
                        <div className="flex gap-4 w-full md:w-auto">
                            <button onClick={handleCreateUnit} className="flex-1 md:flex-none bg-primary-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-primary-500 transition-all shadow-xl shadow-primary-500/20 uppercase tracking-tighter text-xs">Commit</button>
                            <button onClick={() => setShowCreateUnit(false)} className="flex-1 md:flex-none bg-dark-300 text-gray-400 border border-dark-border px-8 py-4 rounded-2xl font-black hover:bg-dark-border transition-all uppercase tracking-tighter text-xs">Abort</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Units (Folders) List */}
            <div className="space-y-12">
                {units.length === 0 && !showCreateUnit ? (
                    <div className="py-32 flex flex-col items-center justify-center text-gray-600 bg-dark-200/50 rounded-[3rem] border-2 border-dashed border-dark-border">
                        <div className="w-24 h-24 bg-dark-300 rounded-[2rem] flex items-center justify-center mb-8 border border-dark-border shadow-inner">
                            <Folder size={40} className="text-gray-700" />
                        </div>
                        <p className="text-xl font-black text-gray-400 tracking-tight mb-2">Architect the Curriculum</p>
                        <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Begin by adding your first unit module above.</p>
                    </div>
                ) : (
                    units.map((unit: any) => (
                        <div key={unit.id} className="bg-dark-200 border border-dark-border rounded-[2.5rem] shadow-2xl overflow-hidden group/unit transition-all hover:border-gray-700">
                            <div className="px-10 py-8 bg-dark-300/50 border-b border-dark-border flex flex-col md:flex-row justify-between items-center gap-6">
                                <h3 className="text-2xl font-black text-white flex items-center gap-4 tracking-tight">
                                    <div className="w-10 h-10 bg-primary-600/10 border border-primary-500/20 rounded-xl flex items-center justify-center text-primary-400">
                                        <Folder size={20} />
                                    </div>
                                    {unit.title}
                                </h3>
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Enrolled Assets</span>
                                        <span className="text-sm text-gray-400 font-bold">{unit.experiments?.length || 0} EXPERIMENTS</span>
                                    </div>
                                    <Link href={`/admin/legezttantra/courses/${courseId}/experiments/create?unitId=${unit.id}`}>
                                        <button className="bg-white text-black px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-tighter hover:bg-primary-500 hover:text-white transition-all shadow-xl shadow-white/5 flex items-center gap-2">
                                            <Plus size={14} /> NEW EXPERIMENT
                                        </button>
                                    </Link>
                                </div>
                            </div>

                            <div className="divide-y divide-dark-border/30">
                                {(!unit.experiments || unit.experiments.length === 0) ? (
                                    <div className="py-16 text-center text-gray-700 text-xs font-black uppercase tracking-widest italic">Inventory Depleted - No Experiments Found</div>
                                ) : (
                                    unit.experiments.map((exp: any, index: number) => (
                                        <div
                                            key={exp.id}
                                            className="px-10 py-6 hover:bg-white/[0.02] transition-all flex items-center justify-between group/item"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-10 h-10 rounded-full bg-dark-300 border border-dark-border text-gray-500 flex items-center justify-center font-black text-xs group-hover/item:border-primary-500/50 group-hover/item:text-primary-400 transition-colors">
                                                    {index + 1}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <h4 className="text-lg font-bold text-gray-300 group-hover/item:text-white transition-colors">{exp.title}</h4>
                                                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-600">
                                                        <span>ID: {exp.id.slice(-8)}</span>
                                                        <span className="w-0.5 h-0.5 rounded-full bg-gray-800"></span>
                                                        <span className="text-primary-600">PRODUCTION READY</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 opacity-0 group-hover/item:opacity-100 transition-all translate-x-4 group-hover/item:translate-x-0">
                                                <button className="p-3 bg-dark-300 border border-dark-border text-gray-500 hover:text-primary-400 hover:border-primary-500/30 rounded-2xl transition-all" title="Edit Logic">
                                                    <Edit size={18} />
                                                </button>
                                                <button className="p-3 bg-dark-300 border border-dark-border text-gray-500 hover:text-red-400 hover:border-red-500/30 rounded-2xl transition-all" title="Wipe Asset">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
