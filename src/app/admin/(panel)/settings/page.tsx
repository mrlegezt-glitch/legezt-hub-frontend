'use client';

import { Settings, Save } from 'lucide-react';

export default function AdminSettingsPage() {
    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center">
                    <Settings size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Settings</h1>
                    <p className="text-gray-400">Manage application configuration</p>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-dark-200 border border-dark-border rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">General Settings</h2>
                    <p className="text-gray-400 mb-6">
                        System-wide configurations will appear here.
                    </p>
                    <div className="p-4 bg-dark-300 rounded-lg border border-dark-border border-dashed text-center text-gray-500">
                        Module Configuration Coming Soon
                    </div>
                </div>

                <div className="bg-dark-200 border border-dark-border rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Notification Preferences</h2>
                    <p className="text-gray-400 mb-6">
                        Configure system alerts and email triggers.
                    </p>
                    <div className="p-4 bg-dark-300 rounded-lg border border-dark-border border-dashed text-center text-gray-500">
                        Email Templates Coming Soon
                    </div>
                </div>
            </div>
        </div>
    );
}
