'use client';

import { useState, useEffect } from 'react';
import {
    Layout,
    Smartphone,
    Monitor,
    ToggleLeft,
    ToggleRight,
    Plus,
    Trash2,
    ExternalLink,
    ShieldAlert,
    BarChart
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

interface AdConfig {
    id: string;
    platform: 'web' | 'android' | 'ios';
    adType: 'banner' | 'native' | 'interstitial' | 'rewarded';
    placement: string;
    adUnitId: string;
    isEnabled: boolean;
}

export default function AdminAdsPage() {
    const { user } = useAuthStore();
    const [ads, setAds] = useState<AdConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newAd, setNewAd] = useState({
        platform: 'web' as any,
        adType: 'banner' as any,
        placement: '',
        adUnitId: '',
        isEnabled: false
    });

    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    const fetchAds = async () => {
        try {
            const res = await api.get('/ads');
            setAds(res.data.data);
        } catch (error) {
            toast.error('Failed to load ad configurations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const handleToggle = async (ad: AdConfig) => {
        try {
            await api.patch(`/ads/${ad.id}/toggle`);
            setAds(ads.map(a => a.id === ad.id ? { ...a, isEnabled: !a.isEnabled } : a));
            toast.success(`Ad ${!ad.isEnabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            toast.error('Failed to toggle ad status');
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isSuperAdmin) {
            toast.error('Only Super Admins can create ad slots');
            return;
        }

        try {
            await api.post('/ads', newAd);
            toast.success('Ad configuration created');
            setShowCreate(false);
            fetchAds();
        } catch (error) {
            toast.error('Failed to create configuration');
        }
    };

    const handleDelete = async (id: string) => {
        if (!isSuperAdmin) return;
        if (!confirm('Permanently delete this ad slot?')) return;

        try {
            await api.delete(`/ads/${id}`);
            setAds(ads.filter(a => a.id !== id));
            toast.success('Ad slot deleted');
        } catch (error) {
            toast.error('Failed to delete ad slot');
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto pb-24 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-silver-gradient opacity-5 blur-[120px] pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-dark-android border border-silver-dark/20 shadow-inner flex items-center justify-center text-silver-400 group">
                        <Layout size={28} className="drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-white mb-1 drop-shadow-md">Monetization Control</h1>
                        <p className="text-[10px] font-bold text-silver-500 uppercase tracking-widest">Manage AdMob and Adsense placements</p>
                    </div>
                </div>

                {isSuperAdmin && (
                    <button
                        onClick={() => setShowCreate(true)}
                        className="bg-silver-gradient text-dark-android font-bold flex items-center gap-2 px-6 py-3.5 rounded-xl shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 border border-silver-light transition-all text-[10px] uppercase tracking-widest relative overflow-hidden group"
                    >
                        <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/10 rounded-t-xl" />
                        <Plus size={18} className="relative z-10" />
                        <span className="relative z-10">New Ad Slot</span>
                    </button>
                )}
            </div>

            {!isSuperAdmin && (
                <div className="mb-8 p-5 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-4 text-yellow-500 text-sm font-bold shadow-inner relative z-10">
                    <div className="p-2 bg-yellow-500/20 rounded-xl"><ShieldAlert size={20} /></div>
                    <span>Viewing in Read-Only mode. Only Super Admins can edit ad slots and units.</span>
                </div>
            )}

            {showCreate && (
                <form onSubmit={handleCreate} className="w-full max-w-2xl p-8 rounded-3xl bg-dark-surface shadow-android-card border border-silver-dark/20 relative overflow-hidden mb-12 animate-in fade-in slide-in-from-top-4">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-30 z-20" />
                    <h2 className="text-xl font-display font-bold text-white mb-6 drop-shadow-md relative z-10 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-dark-android border border-silver-dark/30 shadow-inner flex items-center justify-center text-silver-400"><Plus size={16} /></span>
                        Create New Ad Slot
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                        <div>
                            <label className="text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 block ml-2">Platform</label>
                            <div className="relative">
                                <select
                                    value={newAd.platform}
                                    onChange={e => setNewAd({ ...newAd, platform: e.target.value as any })}
                                    className="w-full bg-dark-android border border-silver-800 rounded-xl py-3.5 px-4 outline-none focus:border-silver-500 text-white font-bold shadow-inner-metallic appearance-none"
                                >
                                    <option value="web" className="font-bold">Web</option>
                                    <option value="android" className="font-bold">Android App</option>
                                    <option value="ios" className="font-bold">iOS App</option>
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-silver-500"><svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 12l-5-5 1.5-1.5L10 9l3.5-3.5L15 7l-5 5z" clipRule="evenodd" /></svg></div>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 block ml-2">Ad Type</label>
                            <div className="relative">
                                <select
                                    value={newAd.adType}
                                    onChange={e => setNewAd({ ...newAd, adType: e.target.value as any })}
                                    className="w-full bg-dark-android border border-silver-800 rounded-xl py-3.5 px-4 outline-none focus:border-silver-500 text-white font-bold shadow-inner-metallic appearance-none"
                                >
                                    <option value="banner" className="font-bold">Banner</option>
                                    <option value="native" className="font-bold">Native</option>
                                    <option value="interstitial" className="font-bold">Interstitial</option>
                                    <option value="rewarded" className="font-bold">Rewarded Video</option>
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-silver-500"><svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 12l-5-5 1.5-1.5L10 9l3.5-3.5L15 7l-5 5z" clipRule="evenodd" /></svg></div>
                            </div>
                        </div>
                        <div className="col-span-1 sm:col-span-2">
                            <label className="text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 block ml-2">Placement (Short ID / Name)</label>
                            <input
                                required
                                placeholder="e.g. subjects_list_bottom"
                                value={newAd.placement}
                                onChange={e => setNewAd({ ...newAd, placement: e.target.value })}
                                className="w-full bg-dark-android border border-silver-800 rounded-xl py-3.5 px-4 outline-none focus:border-silver-500 text-white font-bold shadow-inner-metallic placeholder-silver-600 transition-all font-mono text-sm"
                            />
                        </div>
                        <div className="col-span-1 sm:col-span-2">
                            <label className="text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 block ml-2">Ad Unit ID</label>
                            <input
                                required
                                placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
                                value={newAd.adUnitId}
                                onChange={e => setNewAd({ ...newAd, adUnitId: e.target.value })}
                                className="w-full bg-dark-android border border-silver-800 rounded-xl py-3.5 px-4 outline-none focus:border-silver-500 text-white font-bold shadow-inner-metallic placeholder-silver-600 transition-all font-mono text-sm tracking-wider tracking-widest"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-silver-dark/10 relative z-10">
                        <button type="button" onClick={() => setShowCreate(false)} className="px-6 py-3.5 text-[10px] uppercase tracking-widest font-bold text-silver-500 hover:text-white transition-colors">Cancel</button>
                        <button type="submit" className="bg-silver-gradient text-dark-android font-bold uppercase tracking-widest text-[10px] px-8 py-3.5 rounded-xl shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 border border-silver-light transition-all flex items-center gap-2">Create Config</button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {ads.map((ad) => (
                    <div key={ad.id} className="p-6 rounded-3xl bg-dark-surface shadow-android-card border border-silver-dark/10 group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-20 z-20 group-hover:opacity-40 transition-opacity" />
                        <div className="flex items-start justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner border border-silver-dark/20 ${ad.isEnabled ? 'bg-dark-android text-green-400 border-green-500/20' : 'bg-dark-android text-silver-500'}`}>
                                    {ad.platform === 'web' ? <Monitor size={24} className="drop-shadow-md" /> : <Smartphone size={24} className="drop-shadow-md" />}
                                </div>
                                <div>
                                    <h3 className="font-display font-bold text-lg text-white drop-shadow-md tracking-tight flex items-center gap-2">
                                        {ad.placement}
                                        <span className={`text-[8px] px-2 py-1 rounded-md uppercase tracking-widest font-bold shadow-inner border ${ad.adType === 'interstitial' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : ad.adType === 'rewarded' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                            {ad.adType}
                                        </span>
                                    </h3>
                                    <p className="text-[10px] font-bold text-silver-500 mt-1 uppercase tracking-widest flex items-center gap-1.5">
                                        <span className={`w-2 h-2 rounded-full shadow-glow ${ad.isEnabled ? 'bg-green-400' : 'bg-red-500'}`} />
                                        Platform: {ad.platform}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleToggle(ad)}
                                className={`transition-all hover:scale-110 active:scale-95 ${ad.isEnabled ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'text-silver-600 hover:text-silver-400'}`}
                            >
                                {ad.isEnabled ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                            </button>
                        </div>

                        <div className="bg-dark-android rounded-xl p-4 border border-silver-800 shadow-inner-metallic flex items-center justify-between mb-4 mt-auto relative z-10 overflow-hidden">
                            <span className="text-xs font-mono text-silver-400 font-bold truncate mr-4 uppercase tracking-wider">{ad.adUnitId}</span>
                            <button className="w-8 h-8 flex items-center justify-center bg-dark-surface border border-silver-dark/30 rounded-lg text-silver-500 hover:text-white transition-colors shadow-inner shrink-0">
                                <ExternalLink size={14} />
                            </button>
                        </div>

                        {isSuperAdmin && (
                            <div className="absolute top-6 right-16 pt-0 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                    onClick={() => handleDelete(ad.id)}
                                    className="p-2.5 text-silver-500 hover:text-red-400 bg-dark-android hover:bg-red-500/10 rounded-xl transition-all shadow-inner border border-transparent hover:border-red-500/20"
                                    title="Delete Ad Configuration"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {ads.length === 0 && !loading && (
                    <div className="col-span-full py-20 text-center text-silver-500 bg-dark-surface border border-dashed border-silver-dark/20 shadow-android-card rounded-3xl font-bold uppercase tracking-widest text-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-20" />
                        <Layout className="w-12 h-12 mx-auto mb-4 opacity-30 text-silver-400" />
                        No ad units configured yet.
                    </div>
                )}
            </div>
        </div>
    );
}
