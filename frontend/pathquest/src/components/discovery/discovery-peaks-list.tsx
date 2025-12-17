"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import Peak from "@/typeDefs/Peak";
import PeakRow from "@/components/lists/peak-row";

interface DiscoveryPeaksListProps {
    peaks: Peak[];
    onPeakClick: (id: string, coords?: [number, number]) => void;
    onHoverStart?: (peakId: string, coords: [number, number]) => void;
    onHoverEnd?: () => void;
    compact?: boolean;
}

const DiscoveryPeaksList = ({
    peaks,
    onPeakClick,
    onHoverStart,
    onHoverEnd,
    compact = false,
}: DiscoveryPeaksListProps) => {
    if (peaks.length === 0) return null;

    return (
        <section className="pb-2">
            <div className={cn("flex items-center gap-2", compact ? "mb-3" : "mb-4")}>
                <TrendingUp className="w-4 h-4 text-primary" />
                <h2 className={cn(
                    "font-semibold uppercase tracking-wider text-muted-foreground",
                    compact ? "text-xs" : "text-sm"
                )}>
                    Visible Peaks
                </h2>
            </div>
            <div className={cn("space-y-1", compact ? "space-y-0.5" : "space-y-1")}>
                {peaks.map((peak) => (
                    <PeakRow
                        key={peak.id}
                        peak={peak}
                        onPeakClick={onPeakClick}
                        onHoverStart={onHoverStart}
                        onHoverEnd={onHoverEnd}
                        compact={compact}
                    />
                ))}
            </div>
        </section>
    );
};

export default DiscoveryPeaksList;
