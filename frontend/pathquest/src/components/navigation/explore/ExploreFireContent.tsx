"use client";

import React from "react";
import Link from "next/link";
import { Flame, MapPin, Clock, Trees, LocateFixed } from "lucide-react";
import type { FireDetail } from "@pathquest/shared/types";
import { cn } from "@/lib/utils";

const DESIGNATION_NAMES: Record<string, string> = {
    NP: "National Park", NM: "National Monument", WILD: "Wilderness Area",
    WSA: "Wilderness Study Area", NRA: "National Recreation Area",
    NCA: "National Conservation Area", NWR: "National Wildlife Refuge",
    NF: "National Forest", NG: "National Grassland", SP: "State Park",
    SW: "State Wilderness", SRA: "State Recreation Area", SF: "State Forest",
};

interface ExploreFireContentProps {
    fireDetail: FireDetail;
    onPeakClick: (id: string) => void;
    onRecenter: () => void;
}

const formatAcres = (acres: number | null): string => {
    if (acres === null) return "Unknown";
    if (acres >= 1000) return `${(acres / 1000).toFixed(1)}k acres`;
    return `${acres.toLocaleString()} acres`;
};

const getDurationDays = (discoveredAt: string | null): number | null => {
    if (!discoveredAt) return null;
    const diff = Date.now() - new Date(discoveredAt).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const ExploreFireContent = ({ fireDetail, onPeakClick, onRecenter }: ExploreFireContentProps) => {
    const durationDays = getDurationDays(fireDetail.discoveredAt);
    const containment = fireDetail.percentContained;

    return (
        <div className="space-y-4 px-4 py-3">
            {/* Header */}
            <div className="px-1">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                        <Flame className="w-5 h-5 text-orange-400 shrink-0" />
                        <h2 className="text-lg font-semibold text-foreground truncate">{fireDetail.name}</h2>
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
                {fireDetail.state && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        {fireDetail.state}
                    </span>
                )}
                {fireDetail.incidentType && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 ml-1.5">
                        {fireDetail.incidentType}
                    </span>
                )}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-card border border-border/70">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Acreage</div>
                    <div className="text-sm font-semibold text-foreground">{formatAcres(fireDetail.acres)}</div>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border/70">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Contained</div>
                    <div className={cn(
                        "text-sm font-semibold",
                        containment !== null && containment >= 80 ? "text-emerald-400" :
                        containment !== null && containment >= 40 ? "text-yellow-400" :
                        "text-orange-400"
                    )}>
                        {containment !== null ? `${containment}%` : "Unknown"}
                    </div>
                </div>
                {fireDetail.discoveredAt && (
                    <div className="p-3 rounded-lg bg-card border border-border/70">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Discovered</div>
                        <div className="text-sm font-semibold text-foreground">
                            {new Date(fireDetail.discoveredAt).toLocaleDateString()}
                        </div>
                    </div>
                )}
                {durationDays !== null && (
                    <div className="p-3 rounded-lg bg-card border border-border/70">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Duration</div>
                        <div className="text-sm font-semibold text-foreground flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            {durationDays === 0 ? "< 1 day" : `${durationDays} day${durationDays !== 1 ? "s" : ""}`}
                        </div>
                    </div>
                )}
            </div>

            {/* Containment bar */}
            {containment !== null && (
                <div className="px-1">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Containment</span>
                        <span className="text-xs font-medium text-foreground">{containment}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all",
                                containment >= 80 ? "bg-emerald-500" :
                                containment >= 40 ? "bg-yellow-500" :
                                "bg-orange-500"
                            )}
                            style={{ width: `${containment}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Affected public lands */}
            {fireDetail.affectedPublicLands && fireDetail.affectedPublicLands.length > 0 && (
                <div className="border-t border-border/40 pt-3">
                    <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-2">
                        <Trees className="w-3.5 h-3.5 text-emerald-400/70" />
                        Affected Public Lands
                    </h3>
                    <div className="space-y-1">
                        {fireDetail.affectedPublicLands.map((land) => (
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
            {fireDetail.nearbyPeaks.length > 0 && (
                <div className="border-t border-border/40 pt-3">
                    <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-2">
                        <MapPin className="w-3.5 h-3.5 text-primary/70" />
                        Nearby Peaks
                    </h3>
                    <div className="space-y-1">
                        {fireDetail.nearbyPeaks.map((peak) => (
                            <button
                                key={peak.id}
                                onClick={() => onPeakClick(peak.id)}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                            >
                                <span className="text-sm text-foreground">{peak.name}</span>
                                <span className="text-xs text-muted-foreground">{peak.distanceKm} km</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Source attribution */}
            <div className="text-center pt-2">
                <span className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest">
                    Data from NIFC WFIGS
                </span>
            </div>
        </div>
    );
};
