"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Users, User, Trophy } from "lucide-react";
import metersToFt from "@/helpers/metersToFt";

interface PeakMarkerPopupProps {
    name?: string;
    elevation?: number;
    county?: string;
    state?: string;
    country?: string;
    publicSummits?: number;
    userSummits?: number;
    numChallenges?: number;
    onDetails: () => void;
}

/**
 * Popup component for peak markers on the map.
 * Shows name, elevation, location, summit counts, and challenge indicator.
 */
export function PeakMarkerPopup({
    name,
    elevation,
    county,
    state,
    country,
    publicSummits,
    userSummits,
    numChallenges,
    onDetails,
}: PeakMarkerPopupProps) {
    // Format elevation (convert meters to feet)
    const elevationFt =
        typeof elevation === "number" && !Number.isNaN(elevation) && elevation > 0
            ? Math.round(metersToFt(elevation)).toLocaleString()
            : null;

    // Build location string from available parts
    const locationParts = [county, state, country].filter(Boolean);
    const locationStr = locationParts.length > 0 ? locationParts.join(", ") : null;

    // Safe number check for summit counts
    const hasPublicSummits = typeof publicSummits === "number" && !Number.isNaN(publicSummits);
    const hasUserSummits = typeof userSummits === "number" && !Number.isNaN(userSummits) && userSummits > 0;
    const isPartOfChallenge = typeof numChallenges === "number" && numChallenges > 0;

    // Color scheme: blue if summited, green (primary) if not
    const isSummited = hasUserSummits;

    return (
        <div
            className={[
                "min-w-[240px] max-w-[320px]",
                "relative overflow-hidden rounded-2xl",
                // Semi-translucent background matching the bottom drawer
                "bg-background/90 backdrop-blur-xl",
                "border border-border",
                "shadow-xl",
            ].join(" ")}
        >
            <div className="relative px-4 py-3.5">
                {/* Header: Name + Challenge Trophy */}
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        {/* Peak Name */}
                        <div 
                            className={[
                                "text-base font-bold leading-tight truncate",
                                isSummited ? "text-[#5b9bd5]" : "text-foreground",
                            ].join(" ")}
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            {name ?? "Unknown peak"}
                        </div>

                        {/* Elevation - under name */}
                        {elevationFt && (
                            <div className="mt-0.5 text-sm text-muted-foreground">
                                {elevationFt} ft
                            </div>
                        )}
                    </div>

                    {/* Trophy icon if part of a challenge */}
                    {isPartOfChallenge && (
                        <div
                            className={[
                                "shrink-0",
                                "grid place-items-center size-8 rounded-lg",
                                "bg-secondary/20 text-secondary",
                            ].join(" ")}
                            title={`Part of ${numChallenges} challenge${numChallenges! > 1 ? "s" : ""}`}
                        >
                            <Trophy className="size-4" />
                        </div>
                    )}
                </div>

                {/* Location - own row */}
                {locationStr && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3 shrink-0" />
                        <span className="truncate">{locationStr}</span>
                    </div>
                )}

                {/* Summit Counts */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    {hasPublicSummits && (
                        <div
                            className={[
                                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5",
                                "text-xs font-medium",
                                "bg-background/60 backdrop-blur-sm",
                                "border border-border/50",
                            ].join(" ")}
                            title="Public summits"
                        >
                            <Users className="size-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">Public</span>
                            <span className="font-semibold text-foreground tabular-nums">
                                {publicSummits!.toLocaleString()}
                            </span>
                        </div>
                    )}

                    {hasUserSummits && (
                        <div
                            className={[
                                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5",
                                "text-xs font-medium",
                                "bg-[#5b9bd5]/20 text-[#5b9bd5]",
                                "border border-[#5b9bd5]/30",
                            ].join(" ")}
                            title="Your summits"
                        >
                            <User className="size-3.5" />
                            <span>You</span>
                            <span className="font-semibold tabular-nums">
                                {userSummits!.toLocaleString()}
                            </span>
                        </div>
                    )}
                </div>

                {/* Full-width Details Button */}
                <div className="mt-4">
                    <Button
                        size="sm"
                        onClick={onDetails}
                        className={[
                            "w-full h-9",
                            isSummited
                                ? "bg-[#5b9bd5] hover:bg-[#5b9bd5]/90 text-white shadow-md shadow-[#5b9bd5]/25"
                                : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/25",
                            "transition-all duration-200 hover:scale-[1.02]",
                        ].join(" ")}
                    >
                        Details
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default PeakMarkerPopup;
