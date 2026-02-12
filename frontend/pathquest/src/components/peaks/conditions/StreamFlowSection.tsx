"use client";

import React from "react";
import { Waves, AlertTriangle } from "lucide-react";
import type { StreamFlow, StreamFlowStatus } from "@pathquest/shared/types";
import { cn } from "@/lib/utils";

interface StreamFlowSectionProps {
    streamFlow: StreamFlow;
    className?: string;
}

const statusConfig: Record<StreamFlowStatus, { label: string; color: string; bg: string }> = {
    low: { label: "Low", color: "text-blue-400", bg: "bg-blue-500/20" },
    normal: { label: "Normal", color: "text-emerald-400", bg: "bg-emerald-500/20" },
    high: { label: "High", color: "text-orange-400", bg: "bg-orange-500/20" },
    flood: { label: "Flood", color: "text-red-400", bg: "bg-red-500/20" },
    unknown: { label: "Unknown", color: "text-gray-400", bg: "bg-gray-500/20" },
};

const metersToMiles = (m: number) => (m * 0.000621371).toFixed(1);

const StreamFlowSection = ({ streamFlow, className }: StreamFlowSectionProps) => {
    if (!streamFlow.gauges || streamFlow.gauges.length === 0) return null;

    const nearest = streamFlow.gauges.find((g) => g.siteId === streamFlow.nearestGauge)
        ?? streamFlow.gauges[0];

    if (!nearest) return null;

    const config = statusConfig[nearest.status];

    return (
        <div className={cn("p-3 rounded-lg bg-card border border-border/70", className)}>
            <h4 className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                Stream Crossings
            </h4>

            {streamFlow.crossingAlert && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-orange-900/30 border border-orange-500/30 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span className="text-xs text-orange-300">
                        High water reported at nearby stream crossings
                    </span>
                </div>
            )}

            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-2">
                <span className="truncate">{nearest.siteName}</span>
                <span>&middot;</span>
                <span>{metersToMiles(nearest.distanceM)} mi</span>
            </div>

            <div className="flex items-center gap-3">
                <Waves className="w-4 h-4 text-blue-400" />
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", config.color, config.bg)}>
                    {config.label}
                </span>
                {nearest.current.dischargeCfs !== null && (
                    <span className="text-xs text-muted-foreground">
                        {Math.round(nearest.current.dischargeCfs)} cfs
                    </span>
                )}
                {nearest.current.gageHeightFt !== null && (
                    <span className="text-xs text-muted-foreground">
                        {nearest.current.gageHeightFt.toFixed(1)} ft
                    </span>
                )}
            </div>
        </div>
    );
};

export default StreamFlowSection;
