'use client';

import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ChevronRight, Upload, Plus, Trash2,
    Languages, Image as ImageIcon, CheckCircle,
    Play, FileAudio, Clock, Save, Loader2
} from 'lucide-react';
import { podcastApi } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

// Steps
const STEPS = [
    { id: 1, title: 'Details', icon: <CheckCircle size={18} /> },
    { id: 2, title: 'Audio Versions', icon: <Languages size={18} /> },
    { id: 3, title: 'Slides', icon: <ImageIcon size={18} /> }
];

export default function CreatePodcastPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const folderId = searchParams.get('folderId');

    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [podcastId, setPodcastId] = useState<string | null>(null);

    // Form Data
    const [details, setDetails] = useState({
        title: '',
        description: '',
        thumbnailUrl: ''
    });

    const [versions, setVersions] = useState<{
        language: string;
        file: File | null;
        duration: number | string;
        captions: string;
        autoCaption: boolean;
        isHinglish: boolean;
    }[]>([
        { language: 'English', file: null, duration: '', captions: '', autoCaption: false, isHinglish: false }
    ]);

    const [slides, setSlides] = useState<{
        file: File | null;
        startTime: number | string;
        notes: string;
    }[]>([]);

    // Step 1: Create Podcast Context
    const handleCreateDetails = async () => {
        if (!details.title || !folderId) return;
        setLoading(true);
        try {
            const res = await podcastApi.createPodcast({
                title: details.title,
                description: details.description,
                thumbnailUrl: details.thumbnailUrl,
                folderId
            });
            setPodcastId(res.data.data.id);
            toast.success('Podcast created! Now add audio.');
            setCurrentStep(2);
        } catch (error) {
            toast.error('Failed to create podcast');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Upload Audio Versions
    const handleUploadVersion = async (index: number, hideToast: boolean = false) => {
        const v = versions[index];
        if (!v.file || !podcastId) return;

        const formData = new FormData();
        formData.append('audio', v.file);
        formData.append('language', v.language);
        formData.append('durationSeconds', v.duration.toString() || '0');
        if (v.captions) formData.append('captionsJson', v.captions);
        if (v.autoCaption) formData.append('autoCaption', 'true');
        if (v.isHinglish) formData.append('isHinglish', 'true');

        try {
            await podcastApi.addVersion(podcastId, formData);
            if (!hideToast) toast.success(`${v.language} version uploaded`);
        } catch (error) {
            if (!hideToast) toast.error(`Failed to upload ${v.language} version`);
            throw error;
        }
    };

    const handleNextStep2 = async () => {
        setLoading(true);
        try {
            // Sequential upload to avoid overwhelming the network
            for (let i = 0; i < versions.length; i++) {
                if (versions[i].file) {
                    await handleUploadVersion(i, true);
                }
            }
            toast.success('All audio versions processed successfully');
            setCurrentStep(3);
        } catch (error) {
            toast.error('Failed processing some audio versions');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Upload Slides
    const handleUploadSlide = async (index: number, hideToast: boolean = false) => {
        const s = slides[index];
        if (!s.file || !podcastId) return;

        const formData = new FormData();
        formData.append('image', s.file);
        formData.append('startTimeSeconds', s.startTime.toString() || '0');
        formData.append('speakerNotes', s.notes);
        formData.append('order', index.toString());

        try {
            await podcastApi.addSlide(podcastId, formData);
            if (!hideToast) toast.success(`Slide ${index + 1} added`);
        } catch (error) {
            if (!hideToast) toast.error(`Failed to upload slide ${index + 1}`);
            throw error; // Rethrow to catch in bulk upload
        }
    };

    const handleCompleteAll = async () => {
        setLoading(true);
        try {
            // Only upload slides that have files
            for (let i = 0; i < slides.length; i++) {
                if (slides[i].file) {
                    await handleUploadSlide(i, true);
                }
            }
            toast.success('Podcast fully published!');
            router.push('/admin/podcasts');
        } catch (error) {
            toast.error('Failed to upload some slides. You can add them later.');
            router.push('/admin/podcasts');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-android p-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-96 bg-silver-gradient opacity-5 blur-[120px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.back()} className="w-10 h-10 flex flex-col items-center justify-center bg-dark-surface shadow-inner border border-silver-dark/20 text-silver-400 hover:text-white rounded-xl transition-all group">
                        <ChevronRight size={20} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-white drop-shadow-md">Create New Podcast</h1>
                        <p className="text-[10px] font-bold text-silver-500 uppercase tracking-widest mt-1">Setup audio lectures and slides</p>
                    </div>
                </div>

                {/* Stepper */}
                <div className="flex items-center justify-between mb-12 relative px-4">
                    <div className="absolute left-8 right-8 top-1/2 h-0.5 bg-silver-dark/20 -z-10 shadow-inner" />
                    {[1, 2, 3].map((step) => (
                        <div key={step} className={`flex flex-col items-center gap-3 ${currentStep >= step ? 'text-white' : 'text-silver-600'}`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg border-[3px] transition-all duration-300 shadow-inner-metallic ${currentStep >= step ? 'bg-silver-gradient text-dark-android border-dark-android scale-110 shadow-3d' : 'bg-dark-surface border-silver-dark/20 text-silver-500'}`}>
                                {step}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${currentStep >= step ? 'text-silver-300 drop-shadow-md' : 'text-silver-600'}`}>
                                {step === 1 ? 'Details' : step === 2 ? 'Versions' : 'Slides'}
                            </span>
                        </div>
                    ))}
                </div>

                {/* STEP 1: Details */}
                {currentStep === 1 && (
                    <div className="p-8 bg-dark-surface shadow-android-card border border-silver-dark/20 rounded-3xl animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-30 z-20" />
                        <h2 className="text-xl font-display font-bold text-white mb-8 drop-shadow-md relative z-10 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-dark-android border border-silver-dark/30 shadow-inner flex items-center justify-center text-silver-400"><FileAudio size={16} /></span>
                            Podcast Details
                        </h2>
                        <div className="space-y-6 relative z-10">
                            <div>
                                <label className="block text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 ml-2">Title</label>
                                <input
                                    value={details.title}
                                    onChange={e => setDetails({ ...details, title: e.target.value })}
                                    className="w-full bg-dark-android border border-silver-800 rounded-xl px-4 py-3.5 outline-none focus:border-silver-500 text-white font-bold shadow-inner-metallic placeholder-silver-600 transition-all"
                                    placeholder="e.g., Introduction to Neural Networks"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 ml-2">Description</label>
                                <textarea
                                    value={details.description}
                                    onChange={e => setDetails({ ...details, description: e.target.value })}
                                    className="w-full bg-dark-android border border-silver-800 rounded-xl px-4 py-3.5 outline-none focus:border-silver-500 text-white font-bold min-h-[120px] shadow-inner-metallic placeholder-silver-600 transition-all resize-none"
                                    placeholder="Brief summary of the lecture..."
                                />
                            </div>
                            <div className="flex justify-end mt-4 pt-6 border-t border-silver-dark/10">
                                <button
                                    onClick={handleCreateDetails}
                                    disabled={!details.title || loading}
                                    className="bg-silver-gradient text-dark-android font-bold uppercase tracking-widest text-[10px] px-8 py-3.5 rounded-xl shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 border border-silver-light transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0 disabled:hover:shadow-3d"
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <>Next: Add Audio <ChevronRight size={18} /></>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: Audio Versions */}
                {currentStep === 2 && (
                    <div className="p-8 bg-dark-surface shadow-android-card border border-silver-dark/20 rounded-3xl animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-30 z-20" />
                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <div>
                                <h2 className="text-xl font-display font-bold text-white mb-2 drop-shadow-md flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-dark-android border border-silver-dark/30 shadow-inner flex items-center justify-center text-silver-400"><Languages size={16} /></span>
                                    Audio Versions
                                </h2>
                                <p className="text-[10px] font-bold text-silver-500 uppercase tracking-widest ml-11">Add languages and enable AI tracking.</p>
                            </div>
                            <button
                                onClick={() => setVersions([...versions, { language: '', file: null, duration: '', captions: '', autoCaption: false, isHinglish: false }])}
                                className="bg-dark-android border border-silver-dark/30 shadow-inner px-4 py-2.5 rounded-xl text-[10px] font-bold text-silver-300 hover:text-white uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-silver-dark/10"
                            >
                                <Plus size={14} /> Add Version
                            </button>
                        </div>

                        <div className="space-y-6 relative z-10">
                            {versions.map((v, i) => (
                                <div key={i} className="p-6 bg-dark-android border border-silver-dark/20 rounded-2xl shadow-inner-metallic relative group overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-silver-gradient opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 ml-2">Language</label>
                                            <input
                                                placeholder="e.g. English, Hindi"
                                                value={v.language}
                                                onChange={e => {
                                                    const newV = [...versions];
                                                    newV[i].language = e.target.value;
                                                    setVersions(newV);
                                                }}
                                                className="w-full bg-dark-surface shadow-inner border border-silver-800 rounded-xl px-4 py-3 outline-none focus:border-silver-500 text-white font-bold placeholder-silver-600 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 ml-2">Duration (Auto)</label>
                                            <input
                                                placeholder="Computed automatically"
                                                type="text"
                                                value={v.duration ? `${v.duration} Seconds` : ''}
                                                readOnly
                                                className="w-full bg-dark-surface shadow-inner border border-silver-800/50 rounded-xl px-4 py-3 outline-none text-silver-500 font-bold opacity-70 cursor-not-allowed font-mono text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-6">
                                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                                            <div className="relative group/file">
                                                <input
                                                    type="file"
                                                    accept="audio/*"
                                                    onChange={e => {
                                                        const file = e.target.files?.[0] || null;
                                                        const newV = [...versions];
                                                        newV[i].file = file;

                                                        if (file) {
                                                            const url = URL.createObjectURL(file);
                                                            const audio = new window.Audio(url);
                                                            audio.addEventListener('loadedmetadata', () => {
                                                                setVersions(prev => {
                                                                    const updated = [...prev];
                                                                    updated[i].duration = Math.round(audio.duration);
                                                                    return updated;
                                                                });
                                                            });
                                                        } else {
                                                            newV[i].duration = '';
                                                        }

                                                        setVersions(newV);
                                                    }}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div className={`px-6 py-3 rounded-xl border flex items-center gap-3 transition-colors ${v.file ? 'bg-silver-metallic/10 border-silver-metallic/30 text-white shadow-inner' : 'bg-dark-surface border-silver-dark/30 text-silver-400 group-hover/file:border-silver-500 shadow-android-card'}`}>
                                                    <Upload size={16} className={v.file ? 'text-silver-300' : ''} />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[200px]">
                                                        {v.file ? v.file.name : 'Choose Audio File'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* AI Subtitle Toggles */}
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-5 border-t border-silver-dark/10">
                                            <label className="flex items-center gap-3 cursor-pointer group/cb">
                                                <div className={`w-5 h-5 rounded border ${v.autoCaption ? 'bg-silver-gradient border-silver-light' : 'bg-dark-surface border-silver-dark/40'} flex items-center justify-center shadow-inner transition-colors`}>
                                                    {v.autoCaption && <CheckCircle size={14} className="text-dark-android" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={v.autoCaption}
                                                    onChange={e => {
                                                        const newV = [...versions];
                                                        newV[i].autoCaption = e.target.checked;
                                                        if (!e.target.checked) newV[i].isHinglish = false;
                                                        setVersions(newV);
                                                    }}
                                                    className="hidden"
                                                />
                                                <span className="text-xs font-bold text-silver-300 group-hover/cb:text-white uppercase tracking-wider drop-shadow-md transition-colors">Auto-Generate Subtitles (AI)</span>
                                            </label>

                                            {v.autoCaption && (
                                                <label className="flex items-center gap-3 cursor-pointer animate-in fade-in slide-in-from-left-2 group/cb">
                                                    <div className={`w-5 h-5 rounded border ${v.isHinglish ? 'bg-yellow-500 border-yellow-400' : 'bg-dark-surface border-silver-dark/40'} flex items-center justify-center shadow-inner transition-colors`}>
                                                        {v.isHinglish && <CheckCircle size={14} className="text-dark-android" />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        checked={v.isHinglish}
                                                        onChange={e => {
                                                            const newV = [...versions];
                                                            newV[i].isHinglish = e.target.checked;
                                                            setVersions(newV);
                                                        }}
                                                        className="hidden"
                                                    />
                                                    <span className="text-xs font-bold text-yellow-500 group-hover/cb:text-yellow-400 uppercase tracking-wider drop-shadow-md transition-colors">Is Hinglish Mix?</span>
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center mt-8 pt-6 border-t border-silver-dark/20 relative z-10">
                            <span className="text-[10px] font-bold text-silver-500 uppercase tracking-widest max-w-[200px] md:max-w-none">Note: Audio uploads may take up to 2 mins with AI.</span>
                            <button
                                onClick={handleNextStep2}
                                disabled={loading}
                                className="bg-silver-gradient text-dark-android font-bold uppercase tracking-widest text-[10px] px-8 py-3.5 rounded-xl shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 border border-silver-light transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0 disabled:hover:shadow-3d"
                            >
                                {loading ? <><Loader2 size={16} className="animate-spin" /> Processing AI...</> : <>Next: Add Slides <ChevronRight size={18} /></>}
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: Slides */}
                {currentStep === 3 && (
                    <div className="p-8 bg-dark-surface shadow-android-card border border-silver-dark/20 rounded-3xl animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-30 z-20" />
                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <h2 className="text-xl font-display font-bold text-white drop-shadow-md flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-dark-android border border-silver-dark/30 shadow-inner flex items-center justify-center text-silver-400"><ImageIcon size={16} /></span>
                                Presentation Slides
                            </h2>
                            <button
                                onClick={() => setSlides([...slides, { file: null, startTime: '', notes: '' }])}
                                className="bg-dark-android border border-silver-dark/30 shadow-inner px-4 py-2.5 rounded-xl text-[10px] font-bold text-silver-300 hover:text-white uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-silver-dark/10"
                            >
                                <Plus size={14} /> Add Slide
                            </button>
                        </div>

                        <div className="space-y-6 relative z-10">
                            {slides.map((s, i) => (
                                <div key={i} className="flex flex-col md:flex-row gap-6 p-6 bg-dark-android border border-silver-dark/20 rounded-2xl shadow-inner-metallic items-start focus-within:border-silver-500 transition-colors">
                                    <div className="w-12 h-12 bg-dark-surface shadow-inner border border-silver-dark/30 rounded-xl flex items-center justify-center text-silver-500 font-bold shrink-0">
                                        #{i + 1}
                                    </div>
                                    <div className="flex-1 space-y-4 w-full">
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div className="relative group/file flex-1">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={e => {
                                                        const newS = [...slides];
                                                        newS[i].file = e.target.files?.[0] || null;
                                                        setSlides(newS);
                                                    }}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div className={`px-4 py-3 rounded-xl border flex items-center gap-3 transition-colors ${s.file ? 'bg-silver-metallic/10 border-silver-metallic/30 text-white shadow-inner' : 'bg-dark-surface border-silver-dark/30 text-silver-400 group-hover/file:border-silver-500 shadow-android-card'}`}>
                                                    <Upload size={16} className={s.file ? 'text-silver-300' : ''} />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[200px]">
                                                        {s.file ? s.file.name : 'Choose Image File'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 bg-dark-surface px-4 py-3 rounded-xl border border-silver-dark/30 shadow-inner w-full md:w-auto">
                                                <Clock size={16} className="text-silver-500" />
                                                <input
                                                    type="number"
                                                    placeholder="Seconds"
                                                    value={s.startTime}
                                                    onChange={e => {
                                                        const newS = [...slides];
                                                        newS[i].startTime = e.target.value === '' ? '' : parseInt(e.target.value);
                                                        setSlides(newS);
                                                    }}
                                                    className="bg-transparent outline-none w-20 text-sm font-bold text-white placeholder-silver-600 font-mono"
                                                />
                                            </div>
                                        </div>
                                        <textarea
                                            placeholder="Speaker Notes (optional)"
                                            value={s.notes}
                                            onChange={e => {
                                                const newS = [...slides];
                                                newS[i].notes = e.target.value;
                                                setSlides(newS);
                                            }}
                                            className="w-full bg-dark-surface border border-silver-dark/30 shadow-inner rounded-xl p-4 text-sm font-bold text-white placeholder-silver-600 outline-none focus:border-silver-500 transition-colors min-h-[100px] resize-none"
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            const newS = slides.filter((_, idx) => idx !== i);
                                            setSlides(newS);
                                        }}
                                        className="h-12 w-12 bg-dark-surface border border-transparent hover:border-red-500/30 hover:bg-red-500/10 text-silver-500 hover:text-red-400 rounded-xl shadow-inner font-bold flex items-center justify-center transition-all shrink-0"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center mt-8 pt-6 border-t border-silver-dark/20 relative z-10">
                            <span className="text-[10px] font-bold text-silver-500 uppercase tracking-widest">Files upload on save.</span>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => router.push('/admin/podcasts')}
                                    className="px-6 py-3.5 text-[10px] uppercase tracking-widest font-bold text-silver-500 hover:text-white transition-colors"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCompleteAll}
                                    disabled={loading}
                                    className="bg-silver-gradient text-dark-android font-bold uppercase tracking-widest text-[10px] px-8 py-3.5 rounded-xl shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 border border-silver-light transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0 disabled:hover:shadow-3d"
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    {loading ? 'Publishing...' : 'Complete Publish'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
