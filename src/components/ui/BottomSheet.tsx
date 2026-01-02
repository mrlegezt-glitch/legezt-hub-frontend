'use client';

// ==================================
// Bottom Sheet Component
// ==================================

import { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export default function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
    const [mounted, setMounted] = useState(false);

    // Ensure we only render portal on client
    useEffect(() => {
        setMounted(true);
    }, []);

    // Close on escape key
    const handleEscape = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleEscape]);

    // Don't render on server or before mount
    if (!mounted) return null;

    const sheetContent = (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-[9998]"
                        onClick={onClose}
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed inset-x-0 bottom-0 max-h-[85vh] overflow-hidden bg-dark-200 rounded-t-3xl z-[9999] md:inset-auto md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-xl md:rounded-3xl md:border md:border-dark-border"
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-2 md:hidden">
                            <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 pb-4 border-b border-dark-border">
                            <h2 className="text-lg font-semibold text-white">{title}</h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-dark-100 transition-colors text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto max-h-[60vh] px-5 py-4 pb-10">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );

    // Use Portal to render at document body level
    return createPortal(sheetContent, document.body);
}

