'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Loader2, ArrowLeft, Mail, Phone, FileText, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SubjectDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [expandedUnit, setExpandedUnit] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await api.get(`/academic/syllabus/subject/${id}`);
                setData(res.data);
                if (res.data.syllabusUnits?.length > 0) {
                    setExpandedUnit(res.data.syllabusUnits[0].id);
                }
            } catch (error) {
                console.error('Failed to load subject details');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchDetails();
    }, [id]);

    if (loading) return <div className="flex justify-center pt-20"><Loader2 className="animate-spin text-primary-500" /></div>;
    if (!data) return <div className="pt-20 text-center text-gray-500">Subject not found</div>;

    const { faculty, syllabusUnits } = data;

    return (
        <div className="pb-24 pt-24 px-4 max-w-3xl mx-auto">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                aria-label="Go back"
            >
                <ArrowLeft size={18} /> Back
            </button>

            {/* Subject Header */}
            <h1 className="text-3xl font-bold text-white mb-2">{data.name}</h1>
            <p className="text-gray-400 mb-8">{data.code} • {data.type || 'Core Subject'}</p>

            {/* Faculty Card */}
            {faculty ? (
                <div className="bg-dark-200 rounded-2xl p-6 border border-dark-border mb-8 flex items-center gap-4">
                    <img
                        src={faculty.avatar || `https://ui-avatars.com/api/?name=${faculty.name}&background=random`}
                        alt={faculty.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-primary-500"
                    />
                    <div className="flex-1">
                        <p className="text-xs text-primary-400 font-bold uppercase tracking-widest mb-1">Faculty</p>
                        <h3 className="text-lg font-bold text-white">{faculty.name}</h3>
                        <p className="text-sm text-gray-400">{faculty.designation}</p>
                    </div>
                    <div className="flex gap-2">
                        {faculty.email && (
                            <a href={`mailto:${faculty.email}`} className="p-2 bg-white/5 rounded-full text-gray-300 hover:bg-primary-500 hover:text-white transition-colors">
                                <Mail size={18} />
                            </a>
                        )}
                        {/* Ask Doubt Button (Future: Chat) */}
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-white/5 rounded-xl text-center text-gray-500 mb-8 text-sm">
                    No faculty assigned yet.
                </div>
            )}

            {/* Syllabus Units */}
            <h2 className="text-xl font-bold text-white mb-4">Syllabus & Materials</h2>
            <div className="space-y-3">
                {syllabusUnits.length === 0 ? (
                    <p className="text-gray-500 italic">No study materials uploaded yet.</p>
                ) : (
                    syllabusUnits.map((unit: any) => (
                        <div key={unit.id} className="bg-dark-100/50 rounded-xl border border-white/5 overflow-hidden">
                            <button
                                onClick={() => setExpandedUnit(expandedUnit === unit.id ? null : unit.id)}
                                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left"
                            >
                                <span className="font-semibold text-white">{unit.title}</span>
                                {expandedUnit === unit.id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                            </button>

                            <AnimatePresence>
                                {expandedUnit === unit.id && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 pt-0 border-t border-white/5 space-y-2">
                                            {unit.description && (
                                                <p className="text-sm text-gray-400 mb-3">{unit.description}</p>
                                            )}

                                            {unit.contents?.length > 0 ? (
                                                unit.contents.map((content: any) => (
                                                    <a
                                                        key={content.id}
                                                        href={content.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 p-3 rounded-lg bg-dark-200 border border-dark-border hover:border-primary-500/50 transition-colors group"
                                                    >
                                                        <div className="p-2 bg-red-500/10 text-red-400 rounded-lg group-hover:bg-red-500 group-hover:text-white transition-colors">
                                                            <FileText size={18} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-white group-hover:text-primary-400 transition-colors">{content.title}</p>
                                                            <p className="text-[10px] text-gray-500 uppercase">{content.type}</p>
                                                        </div>
                                                        <Download size={16} className="text-gray-500 group-hover:text-white" />
                                                    </a>
                                                ))
                                            ) : (
                                                <p className="text-xs text-gray-600 pl-2 border-l-2 border-gray-700">No files attached.</p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
