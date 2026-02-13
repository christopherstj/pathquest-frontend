"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, Mountain } from "lucide-react";
import type { AvalancheForecast, AvalancheDangerLevel } from "@pathquest/shared/types";
import { cn } from "@/lib/utils";
import { dangerConfig, stripHtml } from "@/lib/avalanche-utils";

interface AvalancheSectionProps {
    avalanche: AvalancheForecast;
    className?: string;
}

const ElevationDangerVisual = ({ label, level, icon }: { label: string; level: AvalancheDangerLevel; icon: "upper" | "middle" | "lower" }) => {
    const config = dangerConfig[level];
    // Bar width represents danger level (0-5 scale)
    const barWidth = level === 0 ? 8 : Math.max(15, (level / 5) * 100);

    return (
        <div className="flex items-center gap-3">
            <div className="w-[72px] flex items-center gap-1.5 shrink-0">
                <Mountain className={cn(
                    "w-3 h-3 shrink-0",
                    icon === "upper" ? "text-muted-foreground" :
                    icon === "middle" ? "text-muted-foreground/70" :
                    "text-muted-foreground/50"
                )} />
                <span className="text-[10px] text-muted-foreground truncate">{label}</span>
            </div>
            <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 h-3 rounded-full bg-muted/30 overflow-hidden">
                    <div
                        className={cn("h-full rounded-full transition-all", config.barColor)}
                        style={{ width: `${barWidth}%` }}
                    />
                </div>
                <span className={cn("text-[10px] font-medium w-[76px] text-right shrink-0", config.color)}>
                    {config.label}
                </span>
            </div>
        </div>
    );
};

const AvalancheSection = ({ avalanche, className }: AvalancheSectionProps) => {
    const todayDanger = avalanche.danger?.[0];
    const maxDanger = todayDanger
        ? Math.max(todayDanger.upper, todayDanger.middle, todayDanger.lower) as AvalancheDangerLevel
        : 0 as AvalancheDangerLevel;
    const maxConfig = dangerConfig[maxDanger];

    const cleanSummary = avalanche.summary ? stripHtml(avalanche.summary) : null;
    // Split into paragraphs for better readability
    const summaryParagraphs = cleanSummary
        ? cleanSummary.split(/\n\n+/).filter(Boolean)
        : [];

    return (
        <div className={cn("rounded-lg bg-card border border-border/70 overflow-hidden", className)}>
            {/* Header with danger level badge */}
            <div className="flex items-center justify-between px-3 pt-3 pb-2">
                <div className="flex items-center gap-2">
                    <h4 className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Avalanche Forecast
                    </h4>
                    {maxDanger > 0 && (
                        <span className={cn(
                            "text-[9px] font-medium px-1.5 py-0.5 rounded-full",
                            maxConfig.color, maxConfig.bg
                        )}>
                            {maxConfig.label}
                        </span>
                    )}
                </div>
                {avalanche.forecastUrl && (
                    <a
                        href={avalanche.forecastUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <span>Full forecast</span>
                        <ExternalLink className="w-3 h-3" />
                    </a>
                )}
            </div>

            {/* Zone name */}
            {avalanche.zoneName && (
                <div className="px-3 pb-2">
                    <Link
                        href={`/avalanche/${avalanche.centerId}/${avalanche.zoneId}`}
                        className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {avalanche.centerName} &mdash; {avalanche.zoneName}
                    </Link>
                </div>
            )}

            {/* Elevation band danger visual */}
            {todayDanger && (
                <div className="px-3 pb-3 space-y-1.5">
                    <ElevationDangerVisual label="Alpine" level={todayDanger.upper} icon="upper" />
                    <ElevationDangerVisual label="Treeline" level={todayDanger.middle} icon="middle" />
                    <ElevationDangerVisual label="Below" level={todayDanger.lower} icon="lower" />
                </div>
            )}

            {/* Problems as styled chips */}
            {avalanche.problems.length > 0 && (
                <div className="px-3 pb-3">
                    <div className="flex flex-wrap gap-1.5">
                        {avalanche.problems.map((problem, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-1 px-2 py-1 rounded-md bg-orange-500/8 border border-orange-500/20"
                            >
                                <span className="text-[10px] font-medium text-orange-400">
                                    {problem.name}
                                </span>
                                {problem.likelihood && (
                                    <span className="text-[9px] text-orange-400/60">
                                        &middot; {problem.likelihood}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Summary text - cleaned of HTML, broken into paragraphs */}
            {summaryParagraphs.length > 0 && (
                <div className="px-3 pb-3 border-t border-border/30 pt-2.5">
                    <div className="space-y-2">
                        {summaryParagraphs.map((paragraph, i) => (
                            <p
                                key={i}
                                className="text-xs text-foreground/80 leading-relaxed"
                            >
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AvalancheSection;
