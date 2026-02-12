"use client";

import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import type { SnotelData, SnotelTrend } from "@pathquest/shared/types";
import { cn } from "@/lib/utils";

interface SnowpackSectionProps {
    snotel: SnotelData;
    className?: string;
}

const trendConfig: Record<SnotelTrend, { label: string; color: string }> = {
    increasing: { label: "Increasing", color: "text-emerald-500" },
    decreasing: { label: "Decreasing", color: "text-red-500" },
    stable: { label: "Stable", color: "text-gray-400" },
    unknown: { label: "Unknown", color: "text-gray-400" },
};

const metersToMiles = (m: number) => (m * 0.000621371).toFixed(1);

const SnowpackSection = ({ snotel, className }: SnowpackSectionProps) => {
    if (!snotel.stations || snotel.stations.length === 0) return null;

    const nearest = snotel.stations.find((s) => s.stationId === snotel.nearestStation)
        ?? snotel.stations[0];

    if (!nearest) return null;

    const trend = trendConfig[snotel.snowTrend];
    const change24h = nearest.current.snowDepthChange24hIn;

    return (
        <div className={cn("p-3 rounded-lg bg-card border border-border/70", className)}>
            <h4 className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                Snowpack
            </h4>

            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-2">
                <span>{nearest.name}</span>
                <span>&middot;</span>
                <span>{metersToMiles(nearest.distanceM)} mi away</span>
            </div>

            <div className="flex items-end gap-3">
                {nearest.current.snowDepthIn !== null && (
                    <div>
                        <span className="text-2xl font-mono text-foreground">
                            {Math.round(nearest.current.snowDepthIn)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">in</span>
                    </div>
                )}

                {change24h !== null && change24h !== 0 && (
                    <div className="flex items-center gap-0.5 text-sm">
                        {change24h > 0 ? (
                            <ArrowUp className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-red-500" />
                        )}
                        <span className={cn("font-mono text-xs", change24h > 0 ? "text-emerald-500" : "text-red-500")}>
                            {Math.abs(change24h).toFixed(1)}&quot;
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-0.5">24h</span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3 mt-2">
                {nearest.current.sweIn !== null && (
                    <span className="text-xs text-muted-foreground">
                        SWE: {nearest.current.sweIn.toFixed(1)}&quot;
                    </span>
                )}
                <span className={cn("text-xs font-medium", trend.color)}>
                    {trend.label}
                </span>
            </div>
        </div>
    );
};

export default SnowpackSection;
