'use client';

import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ChevronRight, Upload, Plus, Trash2,
    Languages, Image as ImageIcon, CheckCircle,
    Play, FileAudio, Clock, Save
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
        duration: number;
        captions: string;
    }[]>([
        { language: 'English', file: null, duration: 0, captions: '' }
    ]);

    const [slides, setSlides] = useState<{
        file: File | null;
        startTime: number;
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
    const handleUploadVersion = async (index: number) => {
        const v = versions[index];
        if (!v.file || !podcastId) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('audio', v.file);
        formData.append('language', v.language);
        formData.append('durationSeconds', v.duration.toString());
        if (v.captions) formData.append('captionsJson', v.captions);

        try {
            await podcastApi.addVersion(podcastId, formData);
            toast.success(`${v.language} version uploaded`);
        } catch (error) {
            toast.error(`Failed to upload ${v.language} version`);
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Upload Slides
    const handleUploadSlide = async (index: number) => {
        const s = slides[index];
        if (!s.file || !podcastId) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', s.file);
        formData.append('startTimeSeconds', s.startTime.toString());
        formData.append('speakerNotes', s.notes);
        formData.append('order', index.toString());

        try {
            await podcastApi.addSlide(podcastId, formData);
            toast.success(`Slide ${index + 1} added`);
        } catch (error) {
            toast.error(`Failed to upload slide ${index + 1}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-400 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.back()} className="text-gray-400 hover:text-white">Back</button>
                    <h1 className="text-2xl font-bold">Create New Podcast</h1>
                </div>

                {/* Stepper */}
                <div className="flex items-center justify-between mb-12 relative">
                    <div className="absolute left-0 top-1/2 w-full h-0.5 bg-dark-200 -z-10" />
                    {[1, 2, 3].map((step) => (
                        <div key={step} className={`flex flex-col items-center gap-2 ${currentStep >= step ? 'text-primary-400' : 'text-gray-600'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 border-dark-400 transition-colors ${currentStep >= step ? 'bg-primary-500 text-white' : 'bg-dark-200'}`}>
                                {step}
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider">
                                {step === 1 ? 'Details' : step === 2 ? 'Versions' : 'Slides'}
                            </span>
                        </div>
                    ))}
                </div>

                {/* STEP 1: Details */}
                {currentStep === 1 && (
                    <div className="card p-8 animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="text-xl font-bold mb-6">Podcast Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                                <input
                                    value={details.title}
                                    onChange={e => setDetails({ ...details, title: e.target.value })}
                                    className="w-full bg-dark-200 border border-dark-border rounded-xl px-4 py-3 outline-none focus:border-primary-500"
                                    placeholder="e.g., Introduction to Neural Networks"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                <textarea
                                    value={details.description}
                                    onChange={e => setDetails({ ...details, description: e.target.value })}
                                    className="w-full bg-dark-200 border border-dark-border rounded-xl px-4 py-3 outline-none focus:border-primary-500 min-h-[100px]"
                                    placeholder="Brief summary of the lecture..."
                                />
                            </div>
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={handleCreateDetails}
                                    disabled={!details.title || loading}
                                    className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2"
                                >
                                    {loading ? 'Creating...' : 'Next: Add Audio'} <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: Audio Versions */}
                {currentStep === 2 && (
                    <div className="card p-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Audio Versions</h2>
                            <button
                                onClick={() => setVersions([...versions, { language: '', file: null, duration: 0, captions: '' }])}
                                className="text-primary-400 hover:text-white text-sm font-bold flex items-center gap-1"
                            >
                                <Plus size={16} /> Add Language
                            </button>
                        </div>

                        <div className="space-y-6">
                            {versions.map((v, i) => (
                                <div key={i} className="p-4 bg-dark-200/50 rounded-xl border border-dark-border">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <input
                                            placeholder="Language (e.g. Hindi)"
                                            value={v.language}
                                            onChange={e => {
                                                const newV = [...versions];
                                                newV[i].language = e.target.value;
                                                setVersions(newV);
                                            }}
                                            className="bg-dark-100 border border-dark-border rounded-lg px-3 py-2 outline-none"
                                        />
                                        <input
                                            placeholder="Duration (Seconds)"
                                            type="number"
                                            value={v.duration}
                                            onChange={e => {
                                                const newV = [...versions];
                                                newV[i].duration = parseInt(e.target.value);
                                                setVersions(newV);
                                            }}
                                            className="bg-dark-100 border border-dark-border rounded-lg px-3 py-2 outline-none"
                                        />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="file"
                                            accept="audio/*"
                                            onChange={e => {
                                                const newV = [...versions];
                                                newV[i].file = e.target.files?.[0] || null;
                                                setVersions(newV);
                                            }}
                                            className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-500/10 file:text-primary-400 hover:file:bg-primary-500/20"
                                        />
                                        <button
                                            onClick={() => handleUploadVersion(i)}
                                            disabled={loading || !v.file}
                                            className="ml-auto px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 text-sm font-bold"
                                        >
                                            Upload
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end mt-8">
                            <button
                                onClick={() => setCurrentStep(3)}
                                className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2"
                            >
                                Next: Add Slides <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: Slides */}
                {currentStep === 3 && (
                    <div className="card p-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Presentation Slides</h2>
                            <button
                                onClick={() => setSlides([...slides, { file: null, startTime: 0, notes: '' }])}
                                className="text-primary-400 hover:text-white text-sm font-bold flex items-center gap-1"
                            >
                                <Plus size={16} /> Add Slide
                            </button>
                        </div>

                        <div className="space-y-4">
                            {slides.map((s, i) => (
                                <div key={i} className="flex gap-4 p-4 bg-dark-200/50 rounded-xl border border-dark-border items-start">
                                    <div className="w-10 flex flex-col items-center gap-1 text-gray-500 font-bold">
                                        #{i + 1}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="flex gap-4">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => {
                                                    const newS = [...slides];
                                                    newS[i].file = e.target.files?.[0] || null;
                                                    setSlides(newS);
                                                }}
                                                className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20"
                                            />
                                            <div className="flex items-center gap-2 bg-dark-100 px-3 py-2 rounded-lg border border-dark-border">
                                                <Clock size={16} className="text-gray-400" />
                                                <input
                                                    type="number"
                                                    placeholder="Seconds"
                                                    value={s.startTime}
                                                    onChange={e => {
                                                        const newS = [...slides];
                                                        newS[i].startTime = parseInt(e.target.value);
                                                        setSlides(newS);
                                                    }}
                                                    className="bg-transparent outline-none w-20 text-sm"
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
                                            className="w-full bg-dark-100 border border-dark-border rounded-lg p-3 text-sm outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleUploadSlide(i)}
                                        disabled={loading || !s.file}
                                        className="h-10 px-4 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 text-sm font-bold flex items-center justify-center"
                                    >
                                        <Save size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end mt-8 gap-4">
                            <button
                                onClick={() => router.push('/admin/podcasts')}
                                className="px-6 py-3 text-gray-400 hover:text-white font-medium"
                            >
                                Finish Later
                            </button>
                            <button
                                onClick={() => router.push('/admin/podcasts')}
                                className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2"
                            >
                                <CheckCircle size={18} /> Complete All
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
