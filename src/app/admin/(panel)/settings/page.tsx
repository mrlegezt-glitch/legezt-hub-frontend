'use client';

import { Settings, Save } from 'lucide-react';

export default function AdminSettingsPage() {
    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-dark-android border border-silver-dark/20 shadow-inner flex items-center justify-center text-silver-400">
                    <Settings size={28} className="drop-shadow-md" />
                </div>
                <div>
                    <h1 className="text-3xl font-display font-bold text-white drop-shadow-md">Settings</h1>
                    <p className="text-[10px] font-bold text-silver-500 uppercase tracking-widest mt-1">Manage application configuration</p>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-dark-surface shadow-android-card border border-silver-dark/10 rounded-3xl p-8 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-20 z-20 group-hover:opacity-40 transition-opacity" />
                    <h2 className="text-xl font-display font-bold text-white mb-2 relative z-10 drop-shadow-md">General Settings</h2>
                    <p className="text-[10px] font-bold text-silver-500 uppercase tracking-widest mb-8 relative z-10">
                        System-wide configurations will appear here.
                    </p>
                    <div className="p-6 bg-dark-android shadow-inner-metallic rounded-2xl border border-silver-dark/20 border-dashed text-center text-[10px] font-bold text-silver-600 uppercase tracking-widest relative z-10 group-hover:bg-silver-metallic/5 group-hover:border-silver-metallic/30 transition-all">
                        Module Configuration Coming Soon
                    </div>
                </div>

                <div className="bg-dark-surface shadow-android-card border border-silver-dark/10 rounded-3xl p-8 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-20 z-20 group-hover:opacity-40 transition-opacity" />
                    <h2 className="text-xl font-display font-bold text-white mb-2 relative z-10 drop-shadow-md">Notification Preferences</h2>
                    <p className="text-[10px] font-bold text-silver-500 uppercase tracking-widest mb-8 relative z-10">
                        Configure system alerts and email triggers.
                    </p>
                    <div className="p-6 bg-dark-android shadow-inner-metallic rounded-2xl border border-silver-dark/20 border-dashed text-center text-[10px] font-bold text-silver-600 uppercase tracking-widest relative z-10 group-hover:bg-silver-metallic/5 group-hover:border-silver-metallic/30 transition-all">
                        Email Templates Coming Soon
                    </div>
                </div>
            </div>
        </div>
    );
}
