"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Check, X, ExternalLink, Loader2, CheckCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import metersToFt from "@/helpers/metersToFt";
import dayjs from "@/helpers/dayjs";
import UnconfirmedSummit from "@/typeDefs/UnconfirmedSummit";

const ProfileReviewContent = () => {
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
    const [confirmingAll, setConfirmingAll] = useState(false);
    const queryClient = useQueryClient();

    const { data: summits, isLoading, error, refetch } = useQuery({
        queryKey: ["unconfirmedSummits", "all"],
        queryFn: async (): Promise<UnconfirmedSummit[]> => {
            const res = await fetch("/api/summits/unconfirmed");
            if (!res.ok) throw new Error("Failed to fetch unconfirmed summits");
            return res.json();
        },
    });

    const handleConfirm = async (id: string) => {
        setProcessingIds(prev => new Set(prev).add(id));
        
        try {
            const res = await fetch(`/api/summits/${id}/confirm`, {
                method: "POST",
            });
            
            if (res.ok) {
                // Remove from local cache immediately for better UX
                queryClient.setQueryData<UnconfirmedSummit[]>(
                    ["unconfirmedSummits", "all"], 
                    (old) => old?.filter(s => s.id !== id) ?? []
                );
                // Also invalidate dashboard queries
                queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
                queryClient.invalidateQueries({ queryKey: ["recentSummits"] });
            }
        } catch (err) {
            console.error("Failed to confirm summit:", err);
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const handleDeny = async (id: string) => {
        setProcessingIds(prev => new Set(prev).add(id));
        
        try {
            const res = await fetch(`/api/summits/${id}/deny`, {
                method: "POST",
            });
            
            if (res.ok) {
                queryClient.setQueryData<UnconfirmedSummit[]>(
                    ["unconfirmedSummits", "all"], 
                    (old) => old?.filter(s => s.id !== id) ?? []
                );
                queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
                queryClient.invalidateQueries({ queryKey: ["recentSummits"] });
            }
        } catch (err) {
            console.error("Failed to deny summit:", err);
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const handleConfirmAll = async () => {
        if (!summits?.length || confirmingAll) return;
        
        setConfirmingAll(true);
        
        try {
            const res = await fetch("/api/summits/confirm-all", {
                method: "POST",
            });
            
            if (res.ok) {
                queryClient.setQueryData<UnconfirmedSummit[]>(
                    ["unconfirmedSummits", "all"], 
                    []
                );
                queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
                queryClient.invalidateQueries({ queryKey: ["recentSummits"] });
            }
        } catch (err) {
            console.error("Failed to confirm all summits:", err);
        } finally {
            setConfirmingAll(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8 px-4">
                <p className="text-sm text-destructive mb-3">Failed to load summits to review</p>
                <button
                    onClick={() => refetch()}
                    className="text-sm text-primary hover:underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    if (!summits?.length) {
        return (
            <div className="text-center py-12 px-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-lg font-medium text-foreground mb-1">All caught up!</p>
                <p className="text-sm text-muted-foreground">No summits need review right now.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header with count and confirm all */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-foreground">
                        {summits.length} summit{summits.length !== 1 ? "s" : ""} to review
                    </span>
                </div>
                <button
                    onClick={handleConfirmAll}
                    disabled={confirmingAll}
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5",
                        "text-xs font-medium text-green-400",
                        "bg-green-500/20 hover:bg-green-500/30 rounded-lg",
                        "transition-colors disabled:opacity-50"
                    )}
                >
                    {confirmingAll ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <Check className="w-3.5 h-3.5" />
                    )}
                    Confirm All
                </button>
            </div>

            {/* Summit list */}
            <div className="space-y-2">
                {summits.map((summit) => {
                    const isProcessing = processingIds.has(summit.id);
                    const elevationFt = summit.peakElevation 
                        ? Math.round(metersToFt(summit.peakElevation)).toLocaleString() 
                        : null;
                    const date = dayjs(summit.timestamp).format("MMM D, YYYY");

                    return (
                        <div
                            key={summit.id}
                            className={cn(
                                "p-3 rounded-xl transition-all duration-300",
                                "bg-card border border-border",
                                isProcessing && "opacity-50 scale-95"
                            )}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground truncate">
                                        {summit.peakName}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                                        {elevationFt && <span>{elevationFt} ft</span>}
                                        <span>•</span>
                                        <span>{date}</span>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {isProcessing ? (
                                        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleConfirm(summit.id)}
                                                className={cn(
                                                    "p-2 rounded-lg transition-colors",
                                                    "bg-green-500/20 hover:bg-green-500/30 text-green-400",
                                                    "focus:outline-none focus:ring-2 focus:ring-green-500/50"
                                                )}
                                                title="Confirm - I did summit this peak"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeny(summit.id)}
                                                className={cn(
                                                    "p-2 rounded-lg transition-colors",
                                                    "bg-red-500/20 hover:bg-red-500/30 text-red-400",
                                                    "focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                                )}
                                                title="Deny - I didn't summit this peak"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <Link
                                                href={`/activities/${summit.activityId}`}
                                                className={cn(
                                                    "p-2 rounded-lg transition-colors",
                                                    "bg-muted/50 hover:bg-muted text-muted-foreground",
                                                    "focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                )}
                                                title="View activity to verify"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Refresh button at bottom */}
            <div className="flex justify-center pt-2">
                <button
                    onClick={() => refetch()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh
                </button>
            </div>
        </div>
    );
};

export default ProfileReviewContent;

