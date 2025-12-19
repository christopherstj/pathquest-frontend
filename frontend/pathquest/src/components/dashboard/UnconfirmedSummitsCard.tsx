"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, X, ExternalLink, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import metersToFt from "@/helpers/metersToFt";
import dayjs from "@/helpers/dayjs";
import UnconfirmedSummit from "@/typeDefs/UnconfirmedSummit";
import { useQueryClient } from "@tanstack/react-query";

interface UnconfirmedSummitsCardProps {
    summits: UnconfirmedSummit[];
    totalCount: number;
    className?: string;
    onConfirm?: (id: string) => void;
    onDeny?: (id: string) => void;
}

const UnconfirmedSummitsCard = ({ 
    summits, 
    totalCount, 
    className,
    onConfirm,
    onDeny 
}: UnconfirmedSummitsCardProps) => {
    const router = useRouter();
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
    const queryClient = useQueryClient();

    const handleConfirm = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        setProcessingIds(prev => new Set(prev).add(id));
        
        try {
            const res = await fetch(`/api/summits/${id}/confirm`, {
                method: "POST",
            });
            
            if (res.ok) {
                setDismissedIds(prev => new Set(prev).add(id));
                onConfirm?.(id);
                // Invalidate related queries
                queryClient.invalidateQueries({ queryKey: ["unconfirmedSummits"] });
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

    const handleDeny = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        setProcessingIds(prev => new Set(prev).add(id));
        
        try {
            const res = await fetch(`/api/summits/${id}/deny`, {
                method: "POST",
            });
            
            if (res.ok) {
                setDismissedIds(prev => new Set(prev).add(id));
                onDeny?.(id);
                // Invalidate related queries
                queryClient.invalidateQueries({ queryKey: ["unconfirmedSummits"] });
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

    const handleViewAll = (e: React.MouseEvent) => {
        e.preventDefault();
        // Navigate to Profile page - Review sub-tab will be handled by ProfileTabContent
        router.push("/profile");
    };

    const visibleSummits = summits.filter(s => !dismissedIds.has(s.id));
    const remainingCount = totalCount - dismissedIds.size;

    if (visibleSummits.length === 0 && remainingCount <= 0) {
        return null;
    }

    return (
        <div
            className={cn(
                "rounded-xl overflow-hidden",
                "bg-amber-500/10 border border-amber-500/30",
                className
            )}
        >
            {/* Header */}
            <div className="px-4 py-3 border-b border-amber-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-semibold text-amber-200">
                        {remainingCount} summit{remainingCount !== 1 ? "s" : ""} need{remainingCount === 1 ? "s" : ""} review
                    </span>
                </div>
            </div>

            {/* Summit items */}
            <div className="divide-y divide-amber-500/10">
                {visibleSummits.slice(0, 3).map((summit) => {
                    const isProcessing = processingIds.has(summit.id);
                    const elevationFt = summit.peakElevation 
                        ? Math.round(metersToFt(summit.peakElevation)).toLocaleString() 
                        : null;
                    const timeAgo = dayjs(summit.timestamp).fromNow();

                    return (
                        <div
                            key={summit.id}
                            className={cn(
                                "px-4 py-3 transition-opacity duration-300",
                                isProcessing && "opacity-50"
                            )}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground truncate">
                                        {summit.peakName}
                                        {elevationFt && (
                                            <span className="text-muted-foreground font-normal text-sm ml-1">
                                                ({elevationFt} ft)
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {timeAgo}
                                    </p>
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center gap-1.5">
                                    {isProcessing ? (
                                        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                                    ) : (
                                        <>
                                            <button
                                                onClick={(e) => handleConfirm(summit.id, e)}
                                                className={cn(
                                                    "p-1.5 rounded-lg transition-colors",
                                                    "bg-green-500/20 hover:bg-green-500/30 text-green-400",
                                                    "focus:outline-none focus:ring-2 focus:ring-green-500/50"
                                                )}
                                                title="Confirm summit"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDeny(summit.id, e)}
                                                className={cn(
                                                    "p-1.5 rounded-lg transition-colors",
                                                    "bg-red-500/20 hover:bg-red-500/30 text-red-400",
                                                    "focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                                )}
                                                title="Deny summit"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <Link
                                                href={`/activities/${summit.activityId}`}
                                                className={cn(
                                                    "p-1.5 rounded-lg transition-colors",
                                                    "bg-muted/50 hover:bg-muted text-muted-foreground",
                                                    "focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                )}
                                                title="View activity"
                                                onClick={(e) => e.stopPropagation()}
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

            {/* Footer - View all link */}
            {remainingCount > 3 && (
                <button
                    onClick={handleViewAll}
                    className={cn(
                        "w-full px-4 py-2.5 flex items-center justify-center gap-1.5",
                        "text-sm text-amber-300 hover:text-amber-200",
                        "bg-amber-500/5 hover:bg-amber-500/10",
                        "border-t border-amber-500/20",
                        "transition-colors"
                    )}
                >
                    View all {remainingCount} in Profile
                    <ChevronRight className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export default UnconfirmedSummitsCard;

