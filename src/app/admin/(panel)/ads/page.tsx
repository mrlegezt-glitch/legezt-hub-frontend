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
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Monetization Control</h1>
                    <p className="text-gray-400">Manage Google AdMob and Adsense placements</p>
                </div>

                {isSuperAdmin && (
                    <button
                        onClick={() => setShowCreate(true)}
                        className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all hover:scale-105"
                    >
                        <Plus size={18} />
                        New Ad Slot
                    </button>
                )}
            </div>

            {!isSuperAdmin && (
                <div className="mb-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-3 text-orange-400 text-sm">
                    <ShieldAlert size={18} />
                    <span>Viewing in Read-Only mode. Only Super Admins can edit ad slots and units.</span>
                </div>
            )}

            {showCreate && (
                <form onSubmit={handleCreate} className="card p-6 mb-8 border-primary-500/20 bg-primary-500/5 max-w-2xl">
                    <h2 className="text-lg font-bold mb-4">Create New Ad Slot</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">Platform</label>
                            <select
                                value={newAd.platform}
                                onChange={e => setNewAd({ ...newAd, platform: e.target.value as any })}
                                className="w-full bg-dark-200 border border-dark-border rounded-lg py-2 px-4 outline-none focus:border-primary-500"
                            >
                                <option value="web">Web</option>
                                <option value="android">Android App</option>
                                <option value="ios">iOS App</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">Ad Type</label>
                            <select
                                value={newAd.adType}
                                onChange={e => setNewAd({ ...newAd, adType: e.target.value as any })}
                                className="w-full bg-dark-200 border border-dark-border rounded-lg py-2 px-4 outline-none focus:border-primary-500"
                            >
                                <option value="banner">Banner</option>
                                <option value="native">Native</option>
                                <option value="interstitial">Interstitial</option>
                                <option value="rewarded">Rewarded Video</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">Placement (Short ID / Name)</label>
                            <input
                                required
                                placeholder="e.g. subjects_list_bottom"
                                value={newAd.placement}
                                onChange={e => setNewAd({ ...newAd, placement: e.target.value })}
                                className="w-full bg-dark-200 border border-dark-border rounded-lg py-2 px-4 outline-none focus:border-primary-500"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">Ad Unit ID</label>
                            <input
                                required
                                placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
                                value={newAd.adUnitId}
                                onChange={e => setNewAd({ ...newAd, adUnitId: e.target.value })}
                                className="w-full bg-dark-200 border border-dark-border rounded-lg py-2 px-4 outline-none focus:border-primary-500 font-mono text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                        <button type="submit" className="btn-primary px-6 py-2 rounded-lg text-sm">Create Config</button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ads.map((ad) => (
                    <div key={ad.id} className="card p-6 border-dark-border group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-xl ${ad.isEnabled ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                    {ad.platform === 'web' ? <Monitor size={20} /> : <Smartphone size={20} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        {ad.placement}
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase ${ad.adType === 'interstitial' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {ad.adType}
                                        </span>
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-tight">{ad.platform}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleToggle(ad)}
                                className={`transition-colors ${ad.isEnabled ? 'text-green-500' : 'text-gray-600 hover:text-gray-400'}`}
                            >
                                {ad.isEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                            </button>
                        </div>

                        <div className="bg-dark-100/50 rounded-lg p-3 border border-dark-border flex items-center justify-between mb-4">
                            <span className="text-[10px] font-mono text-gray-500 truncate mr-4">{ad.adUnitId}</span>
                            <button className="text-gray-500 hover:text-white transition-colors">
                                <ExternalLink size={14} />
                            </button>
                        </div>

                        {isSuperAdmin && (
                            <div className="flex justify-end pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleDelete(ad.id)}
                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {ads.length === 0 && !loading && (
                    <div className="col-span-full py-20 text-center text-gray-500 card border-dashed">
                        No ad units configured yet.
                    </div>
                )}
            </div>
        </div>
    );
}
