"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { PenLine, ChevronRight, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSummitReportStore } from "@/providers/SummitReportProvider";
import metersToFt from "@/helpers/metersToFt";
import dayjs from "@/helpers/dayjs";
import ManualPeakSummit from "@/typeDefs/ManualPeakSummit";
import Peak from "@/typeDefs/Peak";

interface UnreviewedSummitsQueueProps {
    summits: (Peak & ManualPeakSummit)[];
    className?: string;
}

const UnreviewedSummitsQueue = ({ summits, className }: UnreviewedSummitsQueueProps) => {
    const router = useRouter();
    const openSummitReport = useSummitReportStore((state) => state.openSummitReport);

    // Filter to show only summits without reports that are older than 72 hours
    const unreviewedSummits = React.useMemo(() => {
        const seventyTwoHoursAgo = dayjs().subtract(72, "hours");
        return summits.filter(summit => {
            const hasReport = summit.hasReport || (summit.notes && summit.notes.trim() !== "") || summit.difficulty || summit.experience_rating;
            const summitDate = dayjs(summit.timestamp);
            return !hasReport && summitDate.isBefore(seventyTwoHoursAgo);
        }).slice(0, 5); // Max 5 items
    }, [summits]);

    const handleAddReport = (summit: Peak & ManualPeakSummit, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        openSummitReport({
            summit: {
                id: summit.id,
                timestamp: summit.timestamp,
                timezone: summit.timezone,
                activity_id: summit.activity_id || "",
                notes: summit.notes,
                is_public: summit.is_public,
                difficulty: summit.difficulty,
                experience_rating: summit.experience_rating,
            },
            peakId: summit.peak_id,
            peakName: summit.name || "Unknown Peak",
        });
    };

    const handleViewAll = () => {
        // Navigate to Profile page
        router.push("/profile");
    };

    if (unreviewedSummits.length === 0) {
        return null;
    }

    const totalUnreviewed = summits.filter(summit => {
        const hasReport = summit.hasReport || (summit.notes && summit.notes.trim() !== "") || summit.difficulty || summit.experience_rating;
        return !hasReport;
    }).length;

    return (
        <div className={cn(
            "rounded-xl border border-border/60 bg-card/30 overflow-hidden",
            className
        )}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-card/50 border-b border-border/50">
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/10 text-amber-500">
                        <PenLine className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                        {unreviewedSummits.length} summit{unreviewedSummits.length !== 1 ? "s" : ""} need trip reports
                    </span>
                </div>
                {totalUnreviewed > 5 && (
                    <button
                        onClick={handleViewAll}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        View all
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Summit list */}
            <div className="divide-y divide-border/30">
                {unreviewedSummits.map((summit) => (
                    <div 
                        key={summit.id}
                        className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors"
                    >
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-foreground truncate">
                                {summit.name}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>{dayjs(summit.timestamp).format("MMM D")}</span>
                            </div>
                        </div>
                        <button
                            onClick={(e) => handleAddReport(summit, e)}
                            className={cn(
                                "flex items-center gap-1 px-3 py-1.5 text-xs font-medium",
                                "text-amber-600 dark:text-amber-400",
                                "bg-amber-500/10 hover:bg-amber-500/20",
                                "rounded-md transition-colors whitespace-nowrap"
                            )}
                        >
                            Add Report
                        </button>
                    </div>
                ))}
            </div>

            {/* Community message footer */}
            <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-card/30 border-t border-border/30">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                    Your reports help other climbers! 🤝
                </span>
            </div>
        </div>
    );
};

export default UnreviewedSummitsQueue;

