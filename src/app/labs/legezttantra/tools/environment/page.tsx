'use client';

import { useState, useEffect } from 'react';
import { Check, X, Loader2, Camera, Mic, Monitor, Globe } from 'lucide-react';
import LeGeZtHeader from '@/components/labs/LeGeZtHeader';

export default function EnvironmentCheckPage() {
    const [checks, setChecks] = useState({
        browser: { status: 'pending', message: 'Checking browser...' },
        camera: { status: 'pending', message: 'Requesting camera access...' },
        microphone: { status: 'pending', message: 'Requesting microphone access...' },
        network: { status: 'pending', message: 'Checking connection...' }
    });

    useEffect(() => {
        checkSystem();
    }, []);

    const checkSystem = async () => {
        // 1. Browser Check
        const userAgent = navigator.userAgent;
        let browserStatus = 'success';
        let browserMsg = `Verified: ${getBrowserName(userAgent)}`;

        setChecks(prev => ({ ...prev, browser: { status: browserStatus, message: browserMsg } }));

        // 2. Network Check
        const isOnline = navigator.onLine;
        setChecks(prev => ({
            ...prev,
            network: {
                status: isOnline ? 'success' : 'error',
                message: isOnline ? 'High Speed Connection Detected' : 'No Internet Connection'
            }
        }));

        // 3. Media Devices (Camera & Mic)
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

            setChecks(prev => ({
                ...prev,
                camera: { status: 'success', message: 'Camera Detected & Accessible' },
                microphone: { status: 'success', message: 'Microphone Detected & Accessible' }
            }));

            // Stop tracks after check
            stream.getTracks().forEach(track => track.stop());

        } catch (err: any) {
            console.error("Media Error:", err);

            let camStatus = 'error';
            let micStatus = 'error';
            let errorMsg = 'Access Denied or Not Found';

            if (err.name === 'NotAllowedError') {
                errorMsg = 'Permission Denied by User';
            } else if (err.name === 'NotFoundError') {
                errorMsg = 'Device Not Found';
            }

            setChecks(prev => ({
                ...prev,
                camera: { status: camStatus, message: `Camera: ${errorMsg}` },
                microphone: { status: micStatus, message: `Microphone: ${errorMsg}` }
            }));
        }
    };

    const getBrowserName = (ua: string) => {
        if (ua.indexOf("Chrome") > -1) return "Google Chrome";
        if (ua.indexOf("Safari") > -1) return "Safari";
        if (ua.indexOf("Firefox") > -1) return "Mozilla Firefox";
        if (ua.indexOf("MSIE") > -1 || ua.indexOf("Trident/") > -1) return "Internet Explorer";
        return "Unknown Browser";
    };

    const renderStatus = (status: string) => {
        if (status === 'pending') return <Loader2 className="animate-spin text-blue-500" />;
        if (status === 'success') return <div className="bg-green-100 p-1 rounded-full"><Check className="text-green-600" size={16} /></div>;
        return <div className="bg-red-100 p-1 rounded-full"><X className="text-red-600" size={16} /></div>;
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
            <LeGeZtHeader />

            <main className="flex-1 pt-32 px-4 flex justify-center">
                <div className="max-w-2xl w-full bg-white shadow-lg rounded-xl overflow-hidden border border-slate-200">
                    <div className="p-6 border-b border-slate-100 bg-slate-50">
                        <h1 className="text-xl font-bold text-slate-800">System Compatibility Check</h1>
                        <p className="text-sm text-slate-500 mt-1">Verifying your hardware and network requirements for Laboratory access.</p>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {/* Browser */}
                        <div className="p-6 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                <Monitor size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-700">Browser Compatibility</h3>
                                <p className={`text-sm ${checks.browser.status === 'error' ? 'text-red-500' : 'text-slate-500'}`}>
                                    {checks.browser.message}
                                </p>
                            </div>
                            {renderStatus(checks.browser.status)}
                        </div>

                        {/* Camera */}
                        <div className="p-6 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                            <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                                <Camera size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-700">Webcam Check</h3>
                                <p className={`text-sm ${checks.camera.status === 'error' ? 'text-red-500' : 'text-slate-500'}`}>
                                    {checks.camera.message}
                                </p>
                            </div>
                            {renderStatus(checks.camera.status)}
                        </div>

                        {/* Microphone */}
                        <div className="p-6 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                            <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
                                <Mic size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-700">Microphone Check</h3>
                                <p className={`text-sm ${checks.microphone.status === 'error' ? 'text-red-500' : 'text-slate-500'}`}>
                                    {checks.microphone.message}
                                </p>
                            </div>
                            {renderStatus(checks.microphone.status)}
                        </div>

                        {/* Internet */}
                        <div className="p-6 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                                <Globe size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-700">Internet Connectivity</h3>
                                <p className={`text-sm ${checks.network.status === 'error' ? 'text-red-500' : 'text-slate-500'}`}>
                                    {checks.network.message}
                                </p>
                            </div>
                            {renderStatus(checks.network.status)}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
