'use client';

// ==================================
// LeGeZtCast Premium Player
// ==================================

import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ChevronLeft, Play, Pause, SkipBack, SkipForward,
    Languages, Maximize2, MessageSquare, BookOpen,
    Volume2, Settings, Download, Share2, Clock
} from 'lucide-react';
import { podcastApi } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface PodcastVersion {
    id: string;
    language: string;
    audioUrl: string;
    captionsJson?: string;
    durationSeconds: number;
}

interface PodcastSlide {
    id: string;
    imageUrl: string;
    startTimeSeconds: number;
    speakerNotes?: string;
    order: number;
}

interface PodcastData {
    id: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    versions: PodcastVersion[];
    slides: PodcastSlide[];
}

export default function PodcastPlayerPage() {
    const { id } = useParams();
    const router = useRouter();
    const [podcast, setPodcast] = useState<PodcastData | null>(null);
    const [selectedVersion, setSelectedVersion] = useState<PodcastVersion | null>(null);
    const [loading, setLoading] = useState(true);

    // Audio Player State
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    // Sync state
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [activeCaption, setActiveCaption] = useState<string | null>(null);

    // Parse captions
    const captions = useMemo(() => {
        if (!selectedVersion?.captionsJson) return [];
        try {
            return JSON.parse(selectedVersion.captionsJson);
        } catch {
            return [];
        }
    }, [selectedVersion]);

    useEffect(() => {
        fetchPodcastDetail();
    }, [id]);

    const fetchPodcastDetail = async () => {
        try {
            const res = await podcastApi.get(id as string);
            const data = res.data.data;
            setPodcast(data);
            if (data.versions.length > 0) {
                handleVersionChange(data.versions[0]);
            }
        } catch (error) {
            console.error('Failed to fetch podcast:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVersionChange = async (version: PodcastVersion) => {
        setSelectedVersion(version);
        setLoading(true);
        try {
            const res = await podcastApi.getPlayUrl(version.id);
            setAudioUrl(res.data.data.audioUrl);
            if (audioRef.current) {
                audioRef.current.load();
                if (isPlaying) audioRef.current.play();
            }
        } catch (error) {
            console.error('Failed to get play URL:', error);
        } finally {
            setLoading(false);
        }
    };

    // Update sync elements on time change
    useEffect(() => {
        const interval = setInterval(() => {
            if (audioRef.current && !audioRef.current.paused) {
                const time = audioRef.current.currentTime;
                setCurrentTime(time);

                // Sync Slide
                if (podcast?.slides) {
                    const currentSlideIndex = podcast.slides.findLastIndex(s => s.startTimeSeconds <= time);
                    if (currentSlideIndex !== -1 && currentSlideIndex !== activeSlideIndex) {
                        setActiveSlideIndex(currentSlideIndex);
                    }
                }

                // Sync Caption
                if (captions.length > 0) {
                    const currentCaption = captions.findLast((c: any) => c.time <= time);
                    setActiveCaption(currentCaption?.text || null);
                }
            }
        }, 100);
        return () => clearInterval(interval);
    }, [podcast, activeSlideIndex, captions]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    if (loading && !podcast) {
        return <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center">
            <div className="text-primary-400 text-xl font-bold animate-pulse">Initializing LeGeZtCast Player...</div>
        </div>;
    }

    if (podcast && podcast.versions.length === 0) {
        return (
            <div className="min-h-[calc(100vh-60px)] bg-[#0F0F12] flex flex-col items-center justify-center text-white">
                <div className="w-20 h-20 mb-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
                    <Volume2 size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">No Audio Track Available</h2>
                <p className="text-gray-500 mb-8 max-w-sm text-center">This podcast doesn't have an audio track uploaded yet. Please check back later.</p>
                <button onClick={() => router.back()} className="px-6 py-3 rounded-xl bg-primary-500 text-white font-bold hover:bg-primary-600 transition-colors">
                    Go Back
                </button>
            </div>
        );
    }

    const currentSlide = podcast?.slides[activeSlideIndex];

    return (
        <main className="h-[calc(100vh-64px)] md:h-[calc(100vh-60px)] w-full bg-[#0F0F12] text-white flex flex-col overflow-hidden relative z-0">
            {/* Top Bar */}
            <header className="h-16 px-6 border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center transition-colors">
                        <ChevronLeft />
                    </button>
                    <div>
                        <h1 className="font-bold truncate max-w-md">{podcast?.title}</h1>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Synchronized Learning Experience</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Language Switcher */}
                    <div className="relative group">
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-primary-500/50 transition-all text-sm">
                            <Languages size={16} />
                            {selectedVersion?.language}
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-[#1A1A1F] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                            {podcast?.versions.map(v => (
                                <button
                                    key={v.id}
                                    onClick={() => handleVersionChange(v)}
                                    className={`w-full text-left px-4 py-3 hover:bg-white/5 text-sm transition-colors ${selectedVersion?.id === v.id ? 'text-primary-400 bg-primary-500/5' : ''}`}
                                >
                                    {v.language}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center"><Share2 size={18} /></button>
                </div>
            </header>

            {/* Main Dual Pane Body */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Pane: Audio & Captions */}
                <div className="w-full lg:w-[450px] border-r border-white/5 flex flex-col shrink-0">
                    {/* Thumbnail Area */}
                    <div className="grow flex flex-col p-10 items-center justify-center text-center">
                        <motion.div
                            animate={{ scale: isPlaying ? 1.05 : 1 }}
                            className="w-64 h-64 rounded-[40px] overflow-hidden shadow-2xl shadow-primary-500/20 border-4 border-white/5 mb-8"
                        >
                            <img src={podcast?.thumbnailUrl || '/assets/podcasts_hero.png'} className="w-full h-full object-cover" alt="" />
                        </motion.div>
                        <h2 className="text-2xl font-black mb-2">{podcast?.title}</h2>
                        <p className="text-gray-400 text-sm">{podcast?.description}</p>
                    </div>

                    {/* Captions Area */}
                    <div className="h-40 bg-black/40 p-6 flex items-center justify-center text-center overflow-hidden border-t border-white/5">
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={activeCaption}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-lg font-medium text-primary-100 leading-relaxed"
                            >
                                {activeCaption || "Ready to start..."}
                            </motion.p>
                        </AnimatePresence>
                    </div>

                    {/* Controls Component would go here, moved to main bottom for mobile ease */}
                </div>

                {/* Right Pane: Slide Viewer */}
                <div className="hidden lg:flex flex-1 bg-[#09090B] flex-col p-8 overflow-y-auto min-h-0">
                    <div className="grow relative min-h-[400px] flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide?.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.02 }}
                                transition={{ duration: 0.4 }}
                                className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                            >
                                <img src={currentSlide?.imageUrl || '/assets/subjects_hero.png'} className="w-full h-full object-contain bg-[#1F1F24]" alt="" />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Slide Metadata */}
                    <div className="mt-8 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 text-xs font-black uppercase tracking-widest">
                                    Slide {activeSlideIndex + 1} of {podcast?.slides.length || 0}
                                </div>
                                <div className="text-gray-500 text-sm flex items-center gap-1">
                                    <Clock size={14} /> Sync Active
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"><Maximize2 size={18} /></button>
                                <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"><MessageSquare size={18} /></button>
                            </div>
                        </div>

                        {currentSlide?.speakerNotes && (
                            <div className="p-6 rounded-2xl bg-[#1A1A1F] border border-white/5">
                                <h4 className="text-xs font-black text-gray-500 uppercase mb-3 flex items-center gap-2"> <BookOpen size={12} /> Speaker Notes</h4>
                                <p className="text-gray-300 leading-relaxed italic">{currentSlide.speakerNotes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Global Playback Bar */}
            <div className="h-24 bg-[#141418] border-t border-white/5 px-8 flex items-center gap-12 shrink-0">
                {/* Audio Component (Hidden) */}
                <audio
                    ref={audioRef}
                    src={audioUrl || ''}
                    onEnded={() => setIsPlaying(false)}
                    onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                />

                {/* Progress */}
                <div className="flex-1 flex items-center gap-4">
                    <span className="text-[10px] font-bold text-gray-500 w-10">
                        {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}
                    </span>
                    <div className="relative flex-1 group h-12 flex items-center">
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary-500 group-hover:h-2 transition-all"
                        />
                        <div className="absolute left-0 h-1 bg-primary-500 rounded-full pointer-events-none group-hover:h-2 transition-all" style={{ width: `${(currentTime / duration) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 w-10">
                        {Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}
                    </span>
                </div>

                {/* Main Controls */}
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-6">
                        <button className="text-gray-400 hover:text-white transition-colors"><SkipBack size={24} /></button>
                        <button
                            onClick={togglePlay}
                            className="w-14 h-14 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" className="ml-1" />}
                        </button>
                        <button className="text-gray-400 hover:text-white transition-colors"><SkipForward size={24} /></button>
                    </div>

                    <div className="h-8 w-px bg-white/10" />

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 group relative">
                            <Volume2 size={20} className="text-gray-400" />
                            {/* Simple volume could go here */}
                        </div>
                        <button
                            onClick={() => {
                                const nextRate = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
                                setPlaybackRate(nextRate);
                                if (audioRef.current) audioRef.current.playbackRate = nextRate;
                            }}
                            className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-bold w-12 text-center hover:bg-white/10 transition-colors"
                        >
                            {playbackRate}x
                        </button>
                        <button className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-gray-400"><Settings size={20} /></button>
                    </div>
                </div>
            </div>
        </main>
    );
}

// Custom styles for range input
// Add this to globals.css when you have a chance
