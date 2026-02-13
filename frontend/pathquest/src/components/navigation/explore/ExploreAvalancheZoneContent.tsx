"use client";

import React from "react";
import Link from "next/link";
import { Mountain, ExternalLink, MapPin, Trees, LocateFixed, Users, User } from "lucide-react";
import metersToFt from "@/helpers/metersToFt";
import type { AvalancheZoneDetail } from "@pathquest/shared/types";
import type { AvalancheDangerLevel } from "@pathquest/shared/types";
import { cn } from "@/lib/utils";
import { dangerConfig, stripHtml } from "@/lib/avalanche-utils";

const DESIGNATION_NAMES: Record<string, string> = {
    NP: "National Park", NM: "National Monument", WILD: "Wilderness Area",
    WSA: "Wilderness Study Area", NRA: "National Recreation Area",
    NCA: "National Conservation Area", NWR: "National Wildlife Refuge",
    NF: "National Forest", NG: "National Grassland", SP: "State Park",
    SW: "State Wilderness", SRA: "State Recreation Area", SF: "State Forest",
};

interface ExploreAvalancheZoneContentProps {
    avalancheZoneDetail: AvalancheZoneDetail;
    onPeakClick: (id: string) => void;
    onRecenter: () => void;
}

const ElevationDangerVisual = ({ label, level, icon }: { label: string; level: AvalancheDangerLevel; icon: "upper" | "middle" | "lower" }) => {
    const config = dangerConfig[level];
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

export const ExploreAvalancheZoneContent = ({ avalancheZoneDetail, onPeakClick, onRecenter }: ExploreAvalancheZoneContentProps) => {
    const detail = avalancheZoneDetail;
    const todayDanger = detail.danger?.[0];
    const maxDanger = todayDanger
        ? Math.max(todayDanger.upper, todayDanger.middle, todayDanger.lower) as AvalancheDangerLevel
        : 0 as AvalancheDangerLevel;
    const maxConfig = dangerConfig[maxDanger];

    const cleanSummary = detail.summary ? stripHtml(detail.summary) : null;
    const summaryParagraphs = cleanSummary
        ? cleanSummary.split(/\n\n+/).filter(Boolean)
        : [];

    return (
        <div className="space-y-4 px-4 py-3">
            {/* Header */}
            <div className="px-1">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                        <Mountain className="w-5 h-5 text-blue-400 shrink-0" />
                        <h2 className="text-lg font-semibold text-foreground truncate">{detail.zoneName}</h2>
                    </div>
                    <button
                        onClick={onRecenter}
                        className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                        aria-label="Show on map"
                        title="Show on map"
                    >
                        <LocateFixed className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{detail.centerName}</span>
                    {maxDanger > 0 && (
                        <span className={cn(
                            "text-[9px] font-medium px-1.5 py-0.5 rounded-full",
                            maxConfig.color, maxConfig.bg
                        )}>
                            {maxConfig.label}
                        </span>
                    )}
                </div>
            </div>

            {/* Elevation band danger */}
            {todayDanger && (
                <div className="p-3 rounded-lg bg-card border border-border/70 space-y-1.5">
                    <h4 className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                        Danger by Elevation
                    </h4>
                    <ElevationDangerVisual label="Alpine" level={todayDanger.upper} icon="upper" />
                    <ElevationDangerVisual label="Treeline" level={todayDanger.middle} icon="middle" />
                    <ElevationDangerVisual label="Below" level={todayDanger.lower} icon="lower" />
                </div>
            )}

            {/* Problems */}
            {detail.problems && detail.problems.length > 0 && (
                <div className="px-1">
                    <h4 className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                        Avalanche Problems
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                        {detail.problems.map((problem: any, i: number) => (
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

            {/* Summary */}
            {summaryParagraphs.length > 0 && (
                <div className="p-3 rounded-lg bg-card border border-border/70">
                    <h4 className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                        Forecast Summary
                    </h4>
                    <div className="space-y-2">
                        {summaryParagraphs.map((paragraph, i) => (
                            <p key={i} className="text-xs text-foreground/80 leading-relaxed">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {/* Timestamps */}
            {(detail.publishedAt || detail.expiresAt) && (
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground px-1">
                    {detail.publishedAt && (
                        <span>Published: {new Date(detail.publishedAt).toLocaleDateString()}</span>
                    )}
                    {detail.expiresAt && (
                        <span>Expires: {new Date(detail.expiresAt).toLocaleDateString()}</span>
                    )}
                </div>
            )}

            {/* Full forecast link */}
            {detail.forecastUrl && (
                <a
                    href={detail.forecastUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-card border border-border/70 hover:bg-muted/50 transition-colors"
                >
                    <span className="text-sm font-medium text-foreground">View Full Forecast</span>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                </a>
            )}

            {/* Affected public lands */}
            {detail.affectedPublicLands && detail.affectedPublicLands.length > 0 && (
                <div className="border-t border-border/40 pt-3">
                    <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-2">
                        <Trees className="w-3.5 h-3.5 text-emerald-400/70" />
                        Affected Public Lands
                    </h3>
                    <div className="space-y-1">
                        {detail.affectedPublicLands.map((land) => (
                            <Link
                                key={land.objectId}
                                href={`/lands/${land.objectId}`}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <div className="min-w-0">
                                    <span className="text-sm text-foreground block truncate">{land.name}</span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {DESIGNATION_NAMES[land.designationType] || land.designationType}
                                    </span>
                                </div>
                                {land.acres && (
                                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                                        {land.acres >= 1000 ? `${(land.acres / 1000).toFixed(0)}k` : land.acres} acres
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Nearby peaks */}
            {detail.nearbyPeaks.length > 0 && (
                <div className="border-t border-border/40 pt-3">
                    <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-2">
                        <MapPin className="w-3.5 h-3.5 text-primary/70" />
                        Nearby Peaks
                    </h3>
                    <div className="space-y-1">
                        {detail.nearbyPeaks.map((peak) => {
                            const hasSummited = (peak.summits ?? 0) > 0;
                            const hasPublicSummits = (peak.public_summits ?? 0) > 0;
                            return (
                                <button
                                    key={peak.id}
                                    onClick={() => onPeakClick(peak.id)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left"
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                        hasSummited ? "bg-summited/20 text-summited" : "bg-primary/10 text-primary"
                                    )}>
                                        <Mountain className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-foreground truncate">{peak.name}</span>
                                            <span className="text-xs font-mono text-muted-foreground shrink-0 ml-2">
                                                {peak.elevation ? `${Math.round(metersToFt(parseFloat(String(peak.elevation)))).toLocaleString()} ft` : `${(peak.distanceM / 1000).toFixed(1)} km`}
                                            </span>
                                        </div>
                                        {peak.state && (
                                            <span className="text-[10px] text-muted-foreground">{peak.state}</span>
                                        )}
                                        {(hasPublicSummits || hasSummited) && (
                                            <div className="flex items-center gap-3 mt-0.5">
                                                {hasPublicSummits && (
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Users className="w-3 h-3" />
                                                        <span>{peak.public_summits} {peak.public_summits === 1 ? "summit" : "summits"}</span>
                                                    </div>
                                                )}
                                                {hasSummited && (
                                                    <div className="flex items-center gap-1 text-xs text-summited font-medium">
                                                        <User className="w-3 h-3" />
                                                        <span>{peak.summits} {peak.summits === 1 ? "summit" : "summits"}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Source */}
            <div className="text-center pt-2">
                <span className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest">
                    Data from National Avalanche Center
                </span>
            </div>
        </div>
    );
};
