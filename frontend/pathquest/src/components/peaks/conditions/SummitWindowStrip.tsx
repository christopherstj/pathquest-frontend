"use client";

import React from "react";
import { AlertTriangle, Flame, Wind, CircleAlert } from "lucide-react";
import type { SummitWindow, SummitWindowDay, HazardFlag, HazardType } from "@pathquest/shared/types";
import { cn } from "@/lib/utils";

interface SummitWindowStripProps {
    summitWindow: SummitWindow;
    className?: string;
}

const getScoreColor = (score: number): string => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-green-500";
    if (score >= 40) return "bg-amber-500";
    if (score >= 20) return "bg-orange-500";
    return "bg-red-500";
};

const getScoreTextColor = (score: number): string => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-green-500";
    if (score >= 40) return "text-amber-500";
    if (score >= 20) return "text-orange-500";
    return "text-red-500";
};

const getDayLabel = (dateStr: string): string => {
    const date = new Date(dateStr + "T12:00:00");
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    const diffDays = Math.round(
        (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tmrw";
    return date.toLocaleDateString("en-US", { weekday: "short" });
};

const hazardIconMap: Record<HazardType, typeof AlertTriangle> = {
    avalanche: AlertTriangle,
    fire: Flame,
    air_quality: Wind,
};

const severityColorMap = {
    caution: "text-amber-400",
    warning: "text-orange-400",
    danger: "text-red-400",
};

const HazardIndicator = ({ hazards }: { hazards: HazardFlag[] }) => {
    // Show the most severe hazard
    const severityRank = { danger: 3, warning: 2, caution: 1 };
    const worst = hazards.reduce((a, b) =>
        severityRank[b.severity] > severityRank[a.severity] ? b : a
    );
    const Icon = hazardIconMap[worst.type] ?? CircleAlert;
    const color = severityColorMap[worst.severity];
    const title = hazards.map((h) => h.message).join("; ");

    return (
        <div className="flex justify-center" title={title}>
            <Icon className={cn("w-3 h-3", color)} />
        </div>
    );
};

const SummitWindowStrip = ({ summitWindow, className }: SummitWindowStripProps) => {
    if (!summitWindow.days || summitWindow.days.length === 0) return null;

    const bestDay = summitWindow.days.find(
        (d: SummitWindowDay) => d.date === summitWindow.bestDay
    );

    return (
        <div className={cn("space-y-3", className)}>
            {/* Best day callout */}
            {bestDay && bestDay.score >= 40 && (
                <div className="flex items-center gap-2 text-xs">
                    <span className={cn(
                        "px-2 py-0.5 rounded-full font-medium",
                        bestDay.score >= 80
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : bestDay.score >= 60
                            ? "bg-green-500/10 text-green-500 border border-green-500/20"
                            : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    )}>
                        Best: {getDayLabel(bestDay.date)}
                    </span>
                    <span className="text-muted-foreground">{bestDay.summary}</span>
                </div>
            )}

            {/* 7-day strip */}
            <div className="grid grid-cols-7 gap-1">
                {summitWindow.days.map((day: SummitWindowDay) => (
                    <div
                        key={day.date}
                        className="flex flex-col items-center gap-1"
                        title={`${day.label}: ${day.summary}`}
                    >
                        <span className="text-[10px] text-muted-foreground">
                            {getDayLabel(day.date)}
                        </span>
                        {day.hazards && day.hazards.length > 0 ? (
                            <HazardIndicator hazards={day.hazards} />
                        ) : (
                            <div className="h-3" />
                        )}
                        <div
                            className={cn(
                                "w-full h-2 rounded-full",
                                getScoreColor(day.score)
                            )}
                        />
                        <span className={cn(
                            "text-[10px] font-mono font-medium",
                            getScoreTextColor(day.score)
                        )}>
                            {day.score}
                        </span>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between text-[9px] text-muted-foreground/60 px-1">
                <span>Relative conditions score</span>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        Worst
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-8 h-0.5 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 rounded-full" />
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Best
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SummitWindowStrip;
