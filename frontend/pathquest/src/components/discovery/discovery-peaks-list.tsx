"use client";

import React from "react";
import { TrendingUp, Mountain } from "lucide-react";
import { cn } from "@/lib/utils";
import Peak from "@/typeDefs/Peak";
import metersToFt from "@/helpers/metersToFt";

interface DiscoveryPeaksListProps {
    peaks: Peak[];
    onPeakClick: (id: string, coords?: [number, number]) => void;
    compact?: boolean;
}

const DiscoveryPeaksList = ({
    peaks,
    onPeakClick,
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
            <div className={cn("space-y-2", compact ? "space-y-1.5" : "space-y-2.5")}>
                {peaks.map((peak) => (
                    <div
                        key={peak.id}
                        onClick={() => onPeakClick(peak.id, peak.location_coords)}
                        onKeyDown={(e) => e.key === "Enter" && onPeakClick(peak.id, peak.location_coords)}
                        tabIndex={0}
                        role="button"
                        aria-label={`View peak: ${peak.name}`}
                        className={cn(
                            "flex items-center justify-between rounded-lg hover:bg-muted/60 transition-colors cursor-pointer group",
                            compact ? "p-2.5" : "p-3"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "rounded-full bg-primary/10 flex items-center justify-center text-primary",
                                compact ? "w-7 h-7" : "w-8 h-8"
                            )}>
                                <Mountain className={cn(compact ? "w-3.5 h-3.5" : "w-4 h-4")} />
                            </div>
                            <div>
                                <p className={cn(
                                    "font-medium group-hover:text-primary-foreground transition-colors",
                                    compact ? "text-sm" : "text-sm"
                                )}>
                                    {peak.name}
                                </p>
                                <p className="text-xs font-mono text-muted-foreground">
                                    {peak.elevation
                                        ? `${Math.round(metersToFt(peak.elevation)).toLocaleString()} ft`
                                        : ""}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default DiscoveryPeaksList;


