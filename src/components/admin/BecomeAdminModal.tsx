"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ShieldCheck, BookOpen, Mic, Layout } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface BecomeAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

export default function BecomeAdminModal({ isOpen, onClose, user }: BecomeAdminModalProps) {
    const [formData, setFormData] = useState({
        college: user?.college?.name || "",
        branch: user?.branch?.name || "",
        year: user?.year?.displayName || "",
        semester: user?.semester?.displayName || "",
        section: user?.section || "",
        rollNumber: "",
        reason: "",
        interests: [] as string[],
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const interestOptions = [
        { id: "PDF", label: "PDF Manager", icon: BookOpen },
        { id: "PODCAST", label: "Podcast Host", icon: Mic },
        { id: "LABS", label: "Lab Assistant", icon: Layout },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post("/admin-requests", formData);
            setSuccess(true);
            toast.success("Application submitted successfully!");
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to submit application");
        } finally {
            setLoading(false);
        }
    };

    const toggleInterest = (id: string) => {
        setFormData((prev) => ({
            ...prev,
            interests: prev.interests.includes(id)
                ? prev.interests.filter((i) => i !== id)
                : [...prev.interests, id],
        }));
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-lg bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 bg-gradient-to-r from-primary/10 to-transparent border-b border-dark-border flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/20 rounded-lg">
                                <ShieldCheck className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Become an Admin</h2>
                                <p className="text-sm text-text-secondary">Join the team & contribute</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                        {success ? (
                            <div className="text-center py-10 space-y-4">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                                    <Check className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">Application Sent!</h3>
                                <p className="text-text-secondary">
                                    Thanks for showing interest. We have received your request and will notify you via email once reviewed.
                                </p>
                                <button
                                    onClick={onClose}
                                    className="mt-4 px-6 py-2 bg-dark-border hover:bg-white/10 rounded-xl text-white transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Pre-filled info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-text-secondary">College <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-xl text-white focus:border-primary text-sm"
                                            value={formData.college}
                                            onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                                            placeholder="Enter your college name"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-text-secondary">Branch <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-xl text-white focus:border-primary text-sm"
                                            value={formData.branch}
                                            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                            placeholder="Enter your branch name"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-text-secondary">Year <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-xl text-white focus:border-primary text-sm"
                                            value={formData.year}
                                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                            placeholder="e.g. 2nd Year"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-text-secondary">Semester</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-xl text-white focus:border-primary text-sm"
                                            value={formData.semester}
                                            onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                            placeholder="e.g. Sem 3"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-text-secondary">Section</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-xl text-white focus:border-primary text-sm"
                                            value={formData.section}
                                            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                            placeholder="e.g. A"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-text-secondary">Roll Number <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-xl text-white focus:border-primary text-sm"
                                        value={formData.rollNumber}
                                        onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                                        placeholder="Your College Roll Number"
                                        required
                                    />
                                </div>

                                {/* Interests */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-text-secondary">Establish Interest</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {interestOptions.map((option) => (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => toggleInterest(option.id)}
                                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${formData.interests.includes(option.id)
                                                    ? "bg-primary/20 border-primary text-primary"
                                                    : "bg-dark-bg border-dark-border text-text-secondary hover:border-gray-600"
                                                    }`}
                                            >
                                                <option.icon className="w-5 h-5" />
                                                <span className="text-xs font-medium">{option.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Reason */}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-text-secondary">Why do you want to be an Admin? <span className="text-red-500">*</span></label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:border-primary text-sm h-24 resize-none"
                                        placeholder="Tell us how you can contribute..."
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-primary hover:bg-primary/90 text-black font-semibold rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    ) : (
                                        <>Submit Application</>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
