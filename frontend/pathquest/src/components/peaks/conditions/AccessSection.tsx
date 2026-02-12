"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import type { RoadAccess, TrailConditions, RoadStatus } from "@pathquest/shared/types";
import { cn } from "@/lib/utils";

interface AccessSectionProps {
    roadAccess?: RoadAccess | null;
    trailConditions?: TrailConditions | null;
    className?: string;
}

const roadStatusConfig: Record<RoadStatus, { label: string; style: string }> = {
    open: { label: "Open", style: "bg-emerald-500/20 text-emerald-400" },
    chains_required: { label: "Chains Required", style: "bg-yellow-500/20 text-yellow-400" },
    closed: { label: "Closed", style: "bg-red-500/20 text-red-400" },
    unknown: { label: "Unknown", style: "bg-gray-500/20 text-gray-400" },
};

const AccessSection = ({ roadAccess, trailConditions, className }: AccessSectionProps) => {
    const hasRoads = roadAccess && roadAccess.roads.length > 0;
    const hasAlerts = trailConditions && (trailConditions.alerts.length > 0 || trailConditions.closures.length > 0);
    const hasFireRestrictions = trailConditions?.fireRestrictions;

    if (!hasRoads && !hasAlerts && !hasFireRestrictions) return null;

    return (
        <div className={cn("p-3 rounded-lg bg-card border border-border/70", className)}>
            <h4 className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                Access & Closures
            </h4>

            {hasRoads && (
                <div className="space-y-1.5 mb-2">
                    {roadAccess!.roads.map((road, i) => {
                        const config = roadStatusConfig[road.status];
                        return (
                            <div key={i} className="flex items-center justify-between gap-2 py-1">
                                <span className="text-xs text-foreground truncate">{road.routeName}</span>
                                <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0", config.style)}>
                                    {config.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {trailConditions?.closures && trailConditions.closures.length > 0 && (
                <div className="space-y-1.5 mb-2">
                    {trailConditions.closures.map((closure, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-red-900/20 border border-red-500/20">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                            <div>
                                <span className="text-xs font-medium text-red-300">{closure.title}</span>
                                <p className="text-[10px] text-red-300/70 mt-0.5">{closure.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {trailConditions?.alerts && trailConditions.alerts.length > 0 && (
                <div className="space-y-1.5 mb-2">
                    {trailConditions.alerts.map((alert, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-yellow-900/20 border border-yellow-500/20">
                            <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 mt-0.5 shrink-0" />
                            <div>
                                <span className="text-xs font-medium text-yellow-300">{alert.title}</span>
                                <p className="text-[10px] text-yellow-300/70 mt-0.5">{alert.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {hasFireRestrictions && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-orange-900/20 border border-orange-500/20">
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span className="text-xs text-orange-300">
                        Fire Restriction Level {trailConditions!.fireRestrictions!.level}: {trailConditions!.fireRestrictions!.description}
                    </span>
                </div>
            )}
        </div>
    );
};

export default AccessSection;
