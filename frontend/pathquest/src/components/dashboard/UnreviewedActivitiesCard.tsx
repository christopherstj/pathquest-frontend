"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileText, X, ChevronRight, Loader2, Mountain, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import dayjs from "@/helpers/dayjs";
import type { UnreviewedActivity } from "@pathquest/shared/types";
import dismissActivityReview from "@/actions/activities/dismissActivityReview";
import { useQueryClient } from "@tanstack/react-query";

interface UnreviewedActivitiesCardProps {
    activities: UnreviewedActivity[];
    className?: string;
    onActivityClick?: (activityId: string) => void;
}

const UnreviewedActivitiesCard = ({ 
    activities, 
    className,
    onActivityClick,
}: UnreviewedActivitiesCardProps) => {
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
    const queryClient = useQueryClient();

    const handleDismiss = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        setProcessingIds(prev => new Set(prev).add(id));
        
        try {
            const result = await dismissActivityReview(id);
            
            if (result?.success) {
                setDismissedIds(prev => new Set(prev).add(id));
                queryClient.invalidateQueries({ queryKey: ["unreviewedActivities"] });
            }
        } catch (err) {
            console.error("Failed to dismiss activity review:", err);
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const visibleActivities = activities.filter(a => !dismissedIds.has(a.id));
    const remainingCount = visibleActivities.length;

    if (remainingCount === 0) {
        return null;
    }

    return (
        <div
            className={cn(
                "rounded-xl overflow-hidden",
                "bg-summited/10 border border-summited/30",
                className
            )}
        >
            {/* Header */}
            <div className="px-4 py-3 border-b border-summited/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-summited" />
                    <span className="text-sm font-semibold text-summited">
                        {remainingCount} {remainingCount === 1 ? "activity needs" : "activities need"} trip reports
                    </span>
                </div>
            </div>

            {/* Activity items */}
            <div className="divide-y divide-summited/10">
                {visibleActivities.slice(0, 3).map((activity) => {
                    const isProcessing = processingIds.has(activity.id);
                    const timeAgo = dayjs(activity.start_time).fromNow();
                    const displayTitle = activity.display_title || 
                        (activity.peak_names.length > 0 
                            ? activity.peak_names.length === 1 
                                ? activity.peak_names[0]
                                : `${activity.peak_names[0]} +${activity.peak_names.length - 1} more`
                            : activity.title);

                    return (
                        <div
                            key={activity.id}
                            className={cn(
                                "px-4 py-3 transition-opacity duration-300",
                                isProcessing && "opacity-50"
                            )}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <Link 
                                    href={`/activities/${activity.id}`}
                                    className="flex-1 min-w-0 hover:opacity-80 transition-opacity"
                                    onClick={() => onActivityClick?.(activity.id)}
                                >
                                    <p className="font-medium text-foreground truncate">
                                        {displayTitle}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {timeAgo}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Mountain className="w-3 h-3" />
                                            {activity.summit_count} {activity.summit_count === 1 ? "peak" : "peaks"}
                                        </span>
                                    </div>
                                </Link>

                                {/* Action buttons */}
                                <div className="flex items-center gap-1.5">
                                    {isProcessing ? (
                                        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                                    ) : (
                                        <>
                                            <button
                                                onClick={(e) => handleDismiss(activity.id, e)}
                                                className={cn(
                                                    "p-1.5 rounded-lg transition-colors",
                                                    "bg-muted/50 hover:bg-muted text-muted-foreground",
                                                    "focus:outline-none focus:ring-2 focus:ring-muted/50"
                                                )}
                                                title="Skip trip report"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <Link
                                                href={`/activities/${activity.id}`}
                                                className={cn(
                                                    "px-2.5 py-1.5 rounded-lg transition-colors text-xs font-medium",
                                                    "bg-summited/20 hover:bg-summited/30 text-summited",
                                                    "focus:outline-none focus:ring-2 focus:ring-summited/50"
                                                )}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onActivityClick?.(activity.id);
                                                }}
                                            >
                                                Add Report
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
                <Link
                    href="/activities"
                    className={cn(
                        "w-full px-4 py-2.5 flex items-center justify-center gap-1.5",
                        "text-sm text-summited hover:text-summited/80",
                        "bg-summited/5 hover:bg-summited/10",
                        "border-t border-summited/20",
                        "transition-colors"
                    )}
                >
                    View all {remainingCount} activities
                    <ChevronRight className="w-4 h-4" />
                </Link>
            )}
        </div>
    );
};

export default UnreviewedActivitiesCard;
