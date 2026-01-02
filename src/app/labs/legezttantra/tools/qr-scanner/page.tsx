'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { Scan, RefreshCw } from 'lucide-react';
import LeGeZtHeader from '@/components/labs/LeGeZtHeader';

export default function QRScannerPage() {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [libLoaded, setLibLoaded] = useState(false);

    useEffect(() => {
        if (libLoaded && isScanning) {
            startScanner();
        }
    }, [libLoaded, isScanning]);

    const startScanner = () => {
        // @ts-ignore
        const html5QrCode = new window.Html5Qrcode("reader");
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        // @ts-ignore
        html5QrCode.start({ facingMode: "environment" }, config, (decodedText, decodedResult) => {
            setScanResult(decodedText);
            html5QrCode.stop();
            setIsScanning(false);
        },
            (errorMessage: any) => {
                // parse error, ignore or log
            })
            .catch((err: any) => {
                console.error("Error starting scanner", err);
            });
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col">
            <LeGeZtHeader />

            {/* Load Library */}
            <Script
                src="https://unpkg.com/html5-qrcode"
                strategy="lazyOnload"
                onLoad={() => setLibLoaded(true)}
            />

            <main className="flex-1 pt-32 px-4 flex flex-col items-center justify-start">
                <div className="max-w-md w-full flex flex-col items-center">

                    <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
                        <Scan className="text-cyan-400" /> QR Code Scanner
                    </h1>

                    {/* Scanner Box */}
                    <div className="relative w-full aspect-square bg-black rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl mb-8">
                        {!isScanning && !scanResult && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                <Scan size={64} className="mb-4 opacity-50" />
                                <p>Ready to Scan</p>
                            </div>
                        )}

                        <div id="reader" className="w-full h-full object-cover"></div>
                    </div>

                    {/* Controls & Result */}
                    {scanResult ? (
                        <div className="w-full bg-slate-800 p-6 rounded-xl border border-slate-700 text-center animate-in fade-in slide-in-from-bottom-4">
                            <div className="text-sm text-slate-400 mb-2 uppercase tracking-wide">Scanned Result</div>
                            <div className="text-green-400 font-mono text-lg break-all bg-slate-900 p-4 rounded mb-4">
                                {scanResult}
                            </div>
                            <button
                                onClick={() => { setScanResult(null); setIsScanning(true); }}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full font-medium transition-colors"
                            >
                                Scan Another
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsScanning(true)}
                            disabled={!libLoaded}
                            className={`px-8 py-3 rounded-full font-bold text-lg flex items-center gap-2 transition-all transform hover:scale-105
                                ${isScanning ? 'bg-red-500 hover:bg-red-600' : 'bg-cyan-500 hover:bg-cyan-600 text-slate-900'}
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                        >
                            {!libLoaded ? 'Loading Library...' : isScanning ? 'Scanning...' : 'Start Scanner'}
                            {isScanning && <RefreshCw className="animate-spin" size={20} />}
                        </button>
                    )}

                </div>
            </main>
        </div>
    );
}
