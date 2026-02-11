"use client";

import React, { useState } from "react";
import { Cloud, Trophy, Flag, Check, Trees, Mountain, Shield, Landmark } from "lucide-react";
import Peak from "@/typeDefs/Peak";
import Challenge from "@/typeDefs/Challenge";
import EnhancedConditions from "@/components/peaks/EnhancedConditions";
import { useIsAuthenticated } from "@/hooks/useRequireAuth";
import ChallengeLinkItem from "@/components/lists/challenge-link-item";
import flagPeakForReview from "@/actions/peaks/flagPeakForReview";

interface PeakDetailsTabProps {
    peak: Peak;
    challenges: Challenge[] | null | undefined;
}

/**
 * Get the appropriate icon for a public land type
 */
const getPublicLandIcon = (type: string) => {
    switch (type) {
        case "NP":
        case "NM":
        case "NRA":
        case "NCA":
            return Landmark; // National Parks, Monuments, Recreation/Conservation Areas
        case "NF":
        case "NG":
        case "SF":
            return Trees; // National/State Forests and Grasslands
        case "WILD":
        case "WSA":
        case "SW":
            return Shield; // Wilderness Areas
        case "SP":
        case "SRA":
            return Mountain; // State Parks and Recreation Areas
        case "NWR":
            return Trees; // Wildlife Refuges
        default:
            return Landmark;
    }
};

/**
 * Get a friendly short name for the land manager
 */
const getManagerDisplayName = (manager: string): string => {
    const managerMap: Record<string, string> = {
        "NPS": "National Park Service",
        "USFS": "US Forest Service",
        "BLM": "Bureau of Land Management",
        "FWS": "US Fish & Wildlife Service",
        "USACE": "US Army Corps of Engineers",
        "DOD": "Dept. of Defense",
        "TVA": "Tennessee Valley Authority",
        "USBR": "Bureau of Reclamation",
    };
    return managerMap[manager] || manager;
};

/**
 * Peak Details tab content showing:
 * - Current weather conditions
 * - Public land information (if applicable)
 * - Challenges this peak is part of (with progress if authenticated)
 */
const PeakDetailsTab = ({ peak, challenges }: PeakDetailsTabProps) => {
    const { isAuthenticated } = useIsAuthenticated();
    const [flagging, setFlagging] = useState(false);
    const [flagged, setFlagged] = useState(false);

    const handleFlagForReview = async () => {
        if (flagging || flagged) return;
        setFlagging(true);
        const success = await flagPeakForReview(peak.id);
        setFlagging(false);
        if (success) {
            setFlagged(true);
        }
    };

    return (
        <div className="space-y-6">
            {/* Conditions Section */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Cloud className="w-4 h-4" />
                    Conditions
                </h3>
                <EnhancedConditions peakId={peak.id} />
            </div>

            {/* Public Land Section */}
            {peak.publicLand && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        {React.createElement(getPublicLandIcon(peak.publicLand.type), { className: "w-4 h-4" })}
                        Public Land
                    </h3>
                    <div className="p-4 rounded-lg bg-card border border-border/70">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                {React.createElement(getPublicLandIcon(peak.publicLand.type), { 
                                    className: "w-5 h-5 text-primary" 
                                })}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-foreground leading-tight">
                                    {peak.publicLand.name}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                        {peak.publicLand.typeName}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {getManagerDisplayName(peak.publicLand.manager)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Challenges Section */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Part of {challenges?.length || 0} Challenge{challenges?.length !== 1 ? "s" : ""}
                </h3>
                {challenges && challenges.length > 0 ? (
                    <div className="space-y-2">
                        {challenges.map((challenge) => (
                            <ChallengeLinkItem
                                key={challenge.id}
                                challenge={challenge}
                                showProgress={isAuthenticated}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 px-4 rounded-lg bg-muted/20 border border-border/50">
                        <Trophy className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                            This peak is not part of any challenges yet
                        </p>
                    </div>
                )}
            </div>

            {/* Flag for Review - only show to authenticated users */}
            {isAuthenticated && (
                <div className="pt-4 border-t border-border/30">
                    <button
                        onClick={handleFlagForReview}
                        disabled={flagging || flagged}
                        className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                            flagged
                                ? "bg-primary/10 text-primary cursor-default"
                                : "bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                        } disabled:opacity-50`}
                    >
                        {flagged ? (
                            <>
                                <Check className="w-4 h-4" />
                                Flagged for Review
                            </>
                        ) : flagging ? (
                            <>
                                <Flag className="w-4 h-4 animate-pulse" />
                                Flagging...
                            </>
                        ) : (
                            <>
                                <Flag className="w-4 h-4" />
                                Flag Coordinates for Review
                            </>
                        )}
                    </button>
                    <p className="text-xs text-muted-foreground/70 text-center mt-1">
                        If this peak&apos;s location seems off, let us know
                    </p>
                </div>
            )}
        </div>
    );
};

export default PeakDetailsTab;

