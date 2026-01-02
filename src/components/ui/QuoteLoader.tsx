'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const quotes = [
    "The expert in anything was once a beginner.",
    "Learning is not attained by chance, it must be sought for with ardor.",
    "Education is the most powerful weapon which you can use to change the world.",
    "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    "The beautiful thing about learning is that no one can take it away from you.",
    "Success is not the key to happiness. Happiness is the key to success.",
    "Don't watch the clock; do what it does. Keep going.",
    "Believe you can and you're halfway there.",
    "Your attitude, not your aptitude, will determine your altitude.",
    "The only way to do great work is to love what you do."
];

export const QuoteLoader = () => {
    const [quoteIndex, setQuoteIndex] = useState(0);

    useEffect(() => {
        // Randomize initial quote
        setQuoteIndex(Math.floor(Math.random() * quotes.length));

        // Rotate quotes every 3 seconds
        const interval = setInterval(() => {
            setQuoteIndex((prev) => (prev + 1) % quotes.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/95 backdrop-blur-sm p-6 text-center">
            <div className="relative mb-8">
                {/* Spinning Rings */}
                <div className="absolute inset-0 animate-ping opacity-20 bg-primary-500 rounded-full blur-xl" />
                <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="text-primary-400 animate-pulse" size={24} />
                </div>
            </div>

            <div className="h-24 max-w-md flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={quoteIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col gap-2"
                    >
                        <p className="text-xl font-medium text-white font-serif italic">
                            "{quotes[quoteIndex]}"
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            <p className="mt-4 text-xs text-gray-500 uppercase tracking-widest animate-pulse">
                Loading Application...
            </p>
        </div>
    );
};
