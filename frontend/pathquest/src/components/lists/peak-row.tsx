"use client";

import React from "react";
import { Mountain, Trophy, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";
import Peak from "@/typeDefs/Peak";
import metersToFt from "@/helpers/metersToFt";

interface PeakRowProps {
    peak: Peak;
    onPeakClick: (id: string, coords?: [number, number]) => void;
    onHoverStart?: (peakId: string, coords: [number, number]) => void;
    onHoverEnd?: () => void;
    compact?: boolean;
}

/**
 * A reusable peak row component used in discovery lists and challenges.
 * Shows peak name, elevation, location, public summit count, user summit count,
 * and challenge badge indicator.
 */
const PeakRow = ({
    peak,
    onPeakClick,
    onHoverStart,
    onHoverEnd,
    compact = false,
}: PeakRowProps) => {
    const hasSummited = (peak.summits ?? 0) > 0;
    const hasPublicSummits = (peak.public_summits ?? 0) > 0;
    const hasChallenges = (peak.num_challenges ?? 0) > 0;

    // Format location as "Country, State, County" showing all available fields
    const locationParts = [peak.country, peak.state, peak.county].filter(Boolean);
    const location = locationParts.join(", ");

    // Icon colors - sky blue if user has summited
    const iconColor = hasSummited ? "text-summited" : "text-primary";
    const iconBgColor = hasSummited ? "bg-summited/20" : "bg-primary/10";

    const handleMouseEnter = () => {
        if (onHoverStart && peak.location_coords) {
            onHoverStart(peak.id, peak.location_coords);
        }
    };

    const handleMouseLeave = () => {
        if (onHoverEnd) {
            onHoverEnd();
        }
    };

    return (
        <div
            onClick={() => onPeakClick(peak.id, peak.location_coords)}
            onKeyDown={(e) => e.key === "Enter" && onPeakClick(peak.id, peak.location_coords)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            tabIndex={0}
            role="button"
            aria-label={`View peak: ${peak.name}`}
            className={cn(
                "relative flex items-center justify-between rounded-lg hover:bg-muted/60 transition-colors cursor-pointer group",
                compact ? "p-2.5" : "p-3"
            )}
        >
            {/* Challenge Badge - top right corner */}
            {hasChallenges && (
                <div className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 rounded-full bg-secondary/20 text-secondary">
                    <Trophy className="w-3 h-3" />
                </div>
            )}

            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                    className={cn(
                        "rounded-full flex items-center justify-center shrink-0",
                        iconBgColor,
                        iconColor,
                        compact ? "w-7 h-7" : "w-8 h-8"
                    )}
                >
                    <Mountain className={cn(compact ? "w-3.5 h-3.5" : "w-4 h-4")} />
                </div>
                <div className="flex-1 min-w-0">
                    {/* Peak name */}
                    <p
                        className={cn(
                            "font-medium group-hover:text-primary-foreground transition-colors truncate",
                            compact ? "text-sm" : "text-sm"
                        )}
                    >
                        {peak.name}
                    </p>

                    {/* Elevation and location */}
                    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                        {peak.elevation && (
                            <span className="font-mono">
                                {Math.round(metersToFt(peak.elevation)).toLocaleString()} ft
                            </span>
                        )}
                        {location && (
                            <span className="truncate">{location}</span>
                        )}
                    </div>

                    {/* Summit info row */}
                    {(hasPublicSummits || hasSummited) && (
                        <div className="flex items-center gap-3 mt-0.5">
                            {/* Public summits count */}
                            {hasPublicSummits && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Users className="w-3 h-3" />
                                    <span>
                                        {peak.public_summits} {peak.public_summits === 1 ? "summit" : "summits"}
                                    </span>
                                </div>
                            )}

                            {/* User summit count */}
                            {hasSummited && (
                                <div className="flex items-center gap-1 text-xs text-summited font-medium">
                                    <User className="w-3 h-3" />
                                    <span>
                                        {peak.summits} {peak.summits === 1 ? "summit" : "summits"}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PeakRow;

