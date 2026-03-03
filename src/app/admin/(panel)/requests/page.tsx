"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
    Check, X, Loader2, ShieldAlert, User, BookOpen, Clock,
    MapPin, GraduationCap, Layout
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

export default function AdminRequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchRequests = useCallback(async () => {
        try {
            const { data } = await api.get("/admin-requests");
            setRequests(data);
        } catch (error) {
            toast.error("Failed to fetch requests");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);


    const handleStatusUpdate = async (id: string, status: "APPROVED" | "REJECTED") => {
        setProcessingId(id);
        try {
            await api.put(`/admin-requests/${id}/status`, { status });
            toast.success(`Request ${status.toLowerCase()} successfully`);
            // Remove from list
            setRequests((prev) => prev.filter((req) => req.id !== id));
        } catch (error) {
            toast.error("Action failed");
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto pb-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-dark-android border border-silver-dark/20 shadow-inner flex items-center justify-center text-silver-400 group">
                        <ShieldAlert size={28} className="drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-white drop-shadow-md">Admin Requests</h1>
                        <p className="text-[10px] font-bold text-silver-500 uppercase tracking-widest mt-1">Review & Authorize Clearances</p>
                    </div>
                </div>
                <div className="px-6 py-3 bg-dark-android shadow-inner-metallic border border-silver-dark/20 rounded-xl">
                    <span className="text-silver-300 font-bold text-[10px] uppercase tracking-widest">
                        <span className="text-white text-sm mr-2">{requests.length}</span>Pending
                    </span>
                </div>
            </div>

            {requests.length === 0 ? (
                <div className="text-center py-20 bg-dark-surface shadow-android-card border border-silver-dark/10 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-20" />
                    <ShieldAlert className="w-16 h-16 text-silver-600 mx-auto mb-4 drop-shadow-md opacity-50" />
                    <h3 className="text-xl font-display font-bold text-white drop-shadow-md">No Pending Clearances</h3>
                    <p className="text-[10px] font-bold text-silver-500 uppercase tracking-widest mt-2">All tasks synchronized.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {requests.map((req) => (
                        <div
                            key={req.id}
                            className="bg-dark-surface shadow-android-card border border-silver-dark/10 rounded-3xl p-6 lg:p-8 flex flex-col lg:flex-row gap-8 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
                        >
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-20 z-20 group-hover:opacity-40 transition-opacity" />

                            {/* User Avatar & Basic Info */}
                            <div className="flex flex-col items-center lg:items-start text-center lg:text-left min-w-[220px] relative z-10 shrink-0">
                                <div className="w-20 h-20 rounded-2xl bg-dark-android shadow-inner-metallic border border-silver-dark/20 p-1 mb-4">
                                    <div className="w-full h-full rounded-xl bg-dark-surface overflow-hidden relative shadow-inner">
                                        {req.user?.avatar ? (
                                            <div className="relative w-full h-full"><Image src={req.user.avatar} alt={req.user.name} fill className="object-cover" /></div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-silver-metallic/5">
                                                <User className="w-8 h-8 text-silver-500 drop-shadow-md" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <h3 className="font-bold text-xl text-white drop-shadow-md tracking-tight">{req.user?.name || "Unknown Identity"}</h3>
                                <p className="text-[10px] font-bold text-silver-500 uppercase tracking-widest mt-1 break-all">{req.user?.email}</p>
                                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-silver-600 uppercase tracking-widest bg-dark-android shadow-inner-metallic border border-silver-800 px-3 py-2 rounded-xl">
                                    <Clock className="w-3 h-3 opacity-50 shrink-0" />
                                    <span>{formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}</span>
                                </div>
                            </div>

                            {/* Application Details */}
                            <div className="flex-1 space-y-6 lg:border-l border-silver-dark/10 lg:pl-8 relative z-10 min-w-0">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <span className="text-[9px] font-bold text-silver-600 uppercase tracking-widest flex items-center gap-1.5">
                                            <GraduationCap className="w-3 h-3 opacity-50 shrink-0" /> Institute
                                        </span>
                                        <span className="text-sm font-bold text-white drop-shadow-md truncate block" title={req.college}>{req.college}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-[9px] font-bold text-silver-600 uppercase tracking-widest flex items-center gap-1.5">
                                            <BookOpen className="w-3 h-3 opacity-50 shrink-0" /> Branch
                                        </span>
                                        <span className="text-sm font-bold text-white drop-shadow-md truncate block" title={req.branch}>{req.branch}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-[9px] font-bold text-silver-600 uppercase tracking-widest flex items-center gap-1.5">
                                            <Layout className="w-3 h-3 opacity-50 shrink-0" /> Phase
                                        </span>
                                        <span className="text-sm font-bold text-white drop-shadow-md truncate block" title={`${req.year} / ${req.semester}`}>{req.year} <span className="text-silver-600 mx-1">/</span> {req.semester}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-[9px] font-bold text-silver-600 uppercase tracking-widest flex items-center gap-1.5">
                                            <MapPin className="w-3 h-3 opacity-50 shrink-0" /> Identifier
                                        </span>
                                        <span className="text-sm font-bold text-white drop-shadow-md font-mono truncate block" title={req.rollNumber}>{req.rollNumber}</span>
                                    </div>
                                </div>

                                <div className="bg-dark-android shadow-inner-metallic border border-silver-800 p-6 rounded-2xl relative">
                                    <h4 className="text-[10px] font-bold text-silver-500 uppercase tracking-widest mb-3 absolute top-0 -translate-y-1/2 left-6 bg-dark-android px-2">Objective Context</h4>
                                    <p className="text-sm text-silver-300 leading-relaxed font-medium italic mt-2">
                                        &quot;{req.reason}&quot;
                                    </p>
                                </div>

                                {req.interests?.length > 0 && (
                                    <div className="flex gap-2 flex-wrap">
                                        {req.interests.map((intel: string) => (
                                            <span key={intel} className="px-3 py-1.5 bg-silver-metallic/5 border border-silver-metallic/20 rounded-lg text-[10px] font-bold text-silver-300 uppercase tracking-widest shadow-inner">
                                                {intel}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-row lg:flex-col justify-center gap-4 lg:w-[160px] shrink-0 relative z-10 pt-6 border-t lg:border-t-0 lg:border-l border-silver-dark/10 lg:pl-8">
                                <button
                                    onClick={() => handleStatusUpdate(req.id, "APPROVED")}
                                    disabled={!!processingId}
                                    className="flex-1 lg:flex-none py-3 px-4 bg-dark-android hover:bg-silver-gradient hover:text-dark-android text-white shadow-inner-metallic border border-silver-700 rounded-xl transition-all flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest disabled:opacity-50 disabled:pointer-events-none group/btn shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5"
                                >
                                    {processingId === req.id ? <Loader2 className="w-4 h-4 animate-spin text-silver-400 group-hover/btn:text-dark-android" /> : <Check className="w-4 h-4 text-silver-400 group-hover/btn:text-dark-android drop-shadow-md" />}
                                    Authorize
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(req.id, "REJECTED")}
                                    disabled={!!processingId}
                                    className="flex-1 lg:flex-none py-3 px-4 bg-dark-android hover:bg-red-500/10 text-silver-500 hover:text-red-400 shadow-inner-metallic border border-transparent hover:border-red-500/30 rounded-xl transition-all flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest disabled:opacity-50 disabled:pointer-events-none active:scale-95"
                                >
                                    {processingId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4 drop-shadow-md" />}
                                    Deny
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
