"use client";

import React from "react";
import { BookOpen, CheckCircle, LogIn, Mountain, Plus, Trees, Shield, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import metersToFt from "@/helpers/metersToFt";
import Peak from "@/typeDefs/Peak";
import Challenge from "@/typeDefs/Challenge";
import { PeakActivityIndicator } from "@/components/peaks";
import PeakUserActivity from "@/components/overlays/PeakUserActivity";
import PeakCommunity from "@/components/overlays/PeakCommunity";
import ConditionsDashboard from "@/components/peaks/ConditionsDashboard";
import { ExploreSubTab } from "@/store/tabStore";
import { useManualSummitStore } from "@/providers/ManualSummitProvider";
import { useMapStore } from "@/providers/MapProvider";

/**
 * Notable public land types that warrant a badge in the header
 * (National Parks, Wilderness, Monuments - the "prestigious" ones)
 */
const NOTABLE_LAND_TYPES = ["NP", "NM", "WILD", "WSA"];

/**
 * Get compact icon for public land badge
 */
const getPublicLandBadgeIcon = (type: string) => {
    switch (type) {
        case "NP":
        case "NM":
            return Landmark;
        case "WILD":
        case "WSA":
            return Shield;
        default:
            return Trees;
    }
};

/**
 * Get short abbreviation for land type
 */
const getLandTypeAbbrev = (type: string): string => {
    const abbrevMap: Record<string, string> = {
        "NP": "NP",
        "NM": "NM",
        "WILD": "Wilderness",
        "WSA": "WSA",
    };
    return abbrevMap[type] || type;
};

interface ExplorePeakContentProps {
    peak: Peak | null;
    peakId: string | null;
    peakChallenges: Challenge[] | null | undefined;
    exploreSubTab: ExploreSubTab;
    setExploreSubTab: (tab: ExploreSubTab) => void;
    isAuthenticated: boolean;
    requireAuth: (fn: () => void) => void;
    highlightedActivityId: string | null;
    setHighlightedActivityId: (id: string | null) => void;
}

export const ExplorePeakContent = ({
    peak,
    peakId,
    peakChallenges,
    exploreSubTab,
    setExploreSubTab,
    isAuthenticated,
    requireAuth,
    highlightedActivityId,
    setHighlightedActivityId,
}: ExplorePeakContentProps) => {
    const openManualSummit = useManualSummitStore((state) => state.openManualSummit);
    const selectedPeakUserData = useMapStore((state) => state.selectedPeakUserData);

    // Show loading state if peak data isn't ready yet
    if (!peak) {
        return (
            <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
        );
    }

    const userSummits = peak.summits ?? 0;
    const hasUnreportedSummits = peak.ascents?.some(
        (a) => !a.notes && !a.difficulty && !a.experience_rating
    );

    const handleLogSummit = () => {
        if (!isAuthenticated) {
            requireAuth(() => {});
            return;
        }
        // Use data from selectedPeakUserData if available, otherwise fall back to peak data
        const coords = selectedPeakUserData?.peakCoords ?? peak.location_coords ?? [0, 0];
        openManualSummit({
            peakId: peak.id,
            peakName: peak.name || "Unknown Peak",
            peakCoords: coords,
        });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Compact Header */}
            <div className="px-4 py-3 border-b border-border/60">
                <div className="flex items-start justify-between">
                    <div>
                        <h1
                            className="text-lg font-bold text-foreground"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            {peak.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {peak.elevation ? `${Math.round(metersToFt(peak.elevation)).toLocaleString()} ft` : ""}
                        </p>
                        {/* Public Land Badge - only for notable lands */}
                        {peak.publicLand && NOTABLE_LAND_TYPES.includes(peak.publicLand.type) && (
                            <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                                {React.createElement(getPublicLandBadgeIcon(peak.publicLand.type), {
                                    className: "w-3 h-3 text-amber-600"
                                })}
                                <span className="text-xs font-medium text-amber-700 truncate max-w-[180px]" title={peak.publicLand.name}>
                                    {peak.publicLand.name.replace(/ (National Park|National Monument|Wilderness|Wilderness Study Area)$/i, "")} {getLandTypeAbbrev(peak.publicLand.type)}
                                </span>
                            </div>
                        )}
                    </div>
                    {peakId && <PeakActivityIndicator peakId={peakId} compact />}
                </div>
                {/* Summit status badge */}
                <div className="mt-2 flex items-center gap-2">
                    {isAuthenticated ? (
                        userSummits > 0 ? (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-summited/10 border border-summited/30">
                                <CheckCircle className="w-3 h-3 text-summited" />
                                <span className="text-xs font-medium text-summited">
                                    Summited {userSummits}x
                                </span>
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/30 border border-border/50">
                                <Mountain className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                    Not summited
                                </span>
                            </div>
                        )
                    ) : (
                        <button
                            onClick={() => requireAuth(() => {})}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/5 border border-primary/20 hover:bg-primary/10"
                        >
                            <LogIn className="w-3 h-3 text-primary" />
                            <span className="text-xs text-primary">Log in</span>
                        </button>
                    )}
                </div>

                {/* Log Summit Button - Always visible */}
                <Button
                    onClick={handleLogSummit}
                    className="mt-3 w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                >
                    <Plus className="w-4 h-4" />
                    Log Summit
                </Button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto px-2">
                {exploreSubTab === "conditions" || exploreSubTab === "details" ? (
                    <ConditionsDashboard
                        peak={peak}
                        challenges={peakChallenges}
                    />
                ) : exploreSubTab === "myActivity" ? (
                    isAuthenticated ? (
                        <PeakUserActivity
                            highlightedActivityId={highlightedActivityId}
                            onHighlightActivity={setHighlightedActivityId}
                        />
                    ) : (
                        <div className="text-center py-10">
                            <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
                            <p className="text-sm font-medium text-muted-foreground mb-3">
                                Log in to see your summit history
                            </p>
                            <Button
                                onClick={() => requireAuth(() => {})}
                                variant="outline"
                                className="gap-2"
                            >
                                <LogIn className="w-4 h-4" />
                                Log In
                            </Button>
                        </div>
                    )
                ) : (
                    <PeakCommunity />
                )}
            </div>

            {/* CTA Footer */}
            {isAuthenticated && hasUnreportedSummits && exploreSubTab === "community" && (
                <div className="p-3 border-t border-border/60 bg-gradient-to-t from-primary/5 to-transparent">
                    <Button
                        onClick={() => setExploreSubTab("myActivity")}
                        className="w-full gap-2 bg-primary hover:bg-primary/90 text-sm"
                        size="sm"
                    >
                        <Plus className="w-4 h-4" />
                        Share Your Experience
                    </Button>
                </div>
            )}
        </div>
    );
};


