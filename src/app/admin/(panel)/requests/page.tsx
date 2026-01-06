"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
    Check, X, Loader2, ShieldAlert, User, BookOpen, Clock,
    MapPin, GraduationCap, Layout
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AdminRequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const { data } = await api.get("/admin/admin-requests");
            setRequests(data);
        } catch (error) {
            toast.error("Failed to fetch requests");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: "APPROVED" | "REJECTED") => {
        setProcessingId(id);
        try {
            await api.put(`/admin/admin-requests/${id}/status`, { status });
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
        <div className="space-y-8 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Admin Requests</h1>
                    <p className="text-text-secondary mt-1">Review and manage student applications</p>
                </div>
                <div className="px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm">
                    {requests.length} Pending Requests
                </div>
            </div>

            {requests.length === 0 ? (
                <div className="text-center py-20 bg-dark-card rounded-3xl border border-dark-border">
                    <ShieldAlert className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white">No Pending Requests</h3>
                    <p className="text-gray-400 mt-2">All caught up! Check back later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {requests.map((req) => (
                        <div
                            key={req.id}
                            className="bg-dark-card border border-dark-border rounded-2xl p-6 flex flex-col md:flex-row gap-6 hover:border-primary/30 transition-colors"
                        >
                            {/* User Avatar & Basic Info */}
                            <div className="flex-shrink-0 flex flex-col items-center md:items-start text-center md:text-left min-w-[200px]">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-500 p-[2px] mb-3">
                                    <div className="w-full h-full rounded-full bg-dark-card overflow-hidden">
                                        {req.user?.avatar ? (
                                            <img src={req.user.avatar} alt={req.user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-dark-bg">
                                                <User className="w-8 h-8 text-gray-500" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg text-white">{req.user?.name || "Unknown User"}</h3>
                                <p className="text-sm text-text-secondary">{req.user?.email}</p>
                                <div className="mt-2 flex items-center gap-2 text-xs text-gray-400 bg-dark-bg px-2 py-1 rounded-md">
                                    <Clock className="w-3 h-3" />
                                    {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                                </div>
                            </div>

                            {/* Application Details */}
                            <div className="flex-1 space-y-4 border-l border-dark-border pl-0 md:pl-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <span className="text-xs text-text-secondary block flex items-center gap-1">
                                            <GraduationCap className="w-3 h-3" /> College
                                        </span>
                                        <span className="font-medium text-white">{req.college}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-text-secondary block flex items-center gap-1">
                                            <BookOpen className="w-3 h-3" /> Branch
                                        </span>
                                        <span className="font-medium text-white">{req.branch}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-text-secondary block flex items-center gap-1">
                                            <Layout className="w-3 h-3" /> Year/Sem
                                        </span>
                                        <span className="font-medium text-white">{req.year} / {req.semester}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-text-secondary block flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> Roll No.
                                        </span>
                                        <span className="font-medium text-white">{req.rollNumber}</span>
                                    </div>
                                </div>

                                <div className="bg-dark-bg/50 p-4 rounded-xl">
                                    <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Reason for Interest</h4>
                                    <p className="text-sm text-gray-300 leading-relaxed italic">
                                        "{req.reason}"
                                    </p>
                                </div>

                                {req.interests?.length > 0 && (
                                    <div className="flex gap-2 flex-wrap">
                                        {req.interests.map((intel: string) => (
                                            <span key={intel} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300">
                                                {intel}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-row md:flex-col justify-center gap-3 min-w-[140px]">
                                <button
                                    onClick={() => handleStatusUpdate(req.id, "APPROVED")}
                                    disabled={!!processingId}
                                    className="flex-1 md:flex-none py-2 px-4 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 rounded-xl transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                                >
                                    {processingId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(req.id, "REJECTED")}
                                    disabled={!!processingId}
                                    className="flex-1 md:flex-none py-2 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                                >
                                    <X className="w-4 h-4" />
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
