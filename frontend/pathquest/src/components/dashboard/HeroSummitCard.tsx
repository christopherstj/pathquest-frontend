"use client";

import React from "react";
import { Sparkles, PenLine, Mountain, MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSummitReportStore } from "@/providers/SummitReportProvider";
import metersToFt from "@/helpers/metersToFt";
import dayjs from "@/helpers/dayjs";
import ManualPeakSummit from "@/typeDefs/ManualPeakSummit";
import Peak from "@/typeDefs/Peak";

interface HeroSummitCardProps {
    summit: Peak & ManualPeakSummit;
    className?: string;
}

const HeroSummitCard = ({ summit, className }: HeroSummitCardProps) => {
    const openSummitReport = useSummitReportStore((state) => state.openSummitReport);

    const handleAddTripReport = (e: React.MouseEvent) => {
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

    const location = [summit.county, summit.state].filter(Boolean).join(" • ");
    const elevationFt = summit.elevation ? Math.round(metersToFt(summit.elevation)).toLocaleString() : null;
    const timeAgo = summit.timestamp ? dayjs(summit.timestamp).fromNow() : null;

    return (
        <Link
            href={`/peaks/${summit.peak_id || summit.id}`}
            className={cn(
                "block relative overflow-hidden rounded-2xl",
                "bg-gradient-to-br from-primary/15 via-primary/10 to-secondary/15",
                "border border-primary/30 hover:border-primary/50",
                "transition-all duration-300 hover:shadow-lg hover:shadow-primary/10",
                "group",
                className
            )}
        >
            {/* Subtle animated background pattern */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(var(--primary-rgb),0.15),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(var(--secondary-rgb),0.1),transparent_50%)]" />
            </div>

            <div className="relative p-4 space-y-3">
                {/* Header with celebration badge */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/20 text-primary">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold uppercase tracking-wider">New Summit!</span>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Peak name and details */}
                <div className="space-y-1">
                    <h3 
                        className="text-xl font-bold text-foreground leading-tight"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        {summit.name}
                        {elevationFt && (
                            <span className="text-muted-foreground font-normal text-base ml-2">
                                ({elevationFt} ft)
                            </span>
                        )}
                    </h3>
                    {location && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{location}</span>
                        </div>
                    )}
                    {timeAgo && (
                        <p className="text-xs text-muted-foreground">{timeAgo}</p>
                    )}
                </div>

                {/* Call to action */}
                <div className="pt-2">
                    <div className="p-3 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <PenLine className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    Share your experience!
                                </span>
                            </div>
                            <button
                                onClick={handleAddTripReport}
                                className={cn(
                                    "flex items-center gap-1.5 px-4 py-2",
                                    "text-sm font-semibold text-primary-foreground",
                                    "bg-primary hover:bg-primary/90 rounded-lg",
                                    "transition-all duration-200 hover:scale-105",
                                    "shadow-md shadow-primary/25"
                                )}
                            >
                                Add Trip Report
                            </button>
                        </div>
                    </div>
                </div>

                {/* Fun fact footer */}
                {summit.summitNumber && (
                    <div className="flex items-center justify-center gap-2 pt-1">
                        <Mountain className="w-4 h-4 text-primary/70" />
                        <span className="text-sm text-muted-foreground">
                            This was your <span className="font-semibold text-foreground">{summit.summitNumber}{getOrdinalSuffix(summit.summitNumber)}</span> summit!
                        </span>
                    </div>
                )}
            </div>
        </Link>
    );
};

// Helper function to get ordinal suffix (st, nd, rd, th)
const getOrdinalSuffix = (n: number): string => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
};

export default HeroSummitCard;

