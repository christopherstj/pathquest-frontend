"use client";

import React, { useState } from "react";
import { Cloud, Trophy, Flag, Check } from "lucide-react";
import Peak from "@/typeDefs/Peak";
import Challenge from "@/typeDefs/Challenge";
import CurrentConditions from "@/components/app/peaks/CurrentConditions";
import { useIsAuthenticated } from "@/hooks/useRequireAuth";
import ChallengeLinkItem from "@/components/lists/challenge-link-item";
import flagPeakForReview from "@/actions/peaks/flagPeakForReview";

interface PeakDetailsTabProps {
    peak: Peak;
    challenges: Challenge[] | null | undefined;
}

/**
 * Peak Details tab content showing:
 * - Current weather conditions
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
            {/* Current Conditions Section */}
            {peak.location_coords && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Cloud className="w-4 h-4" />
                        Current Conditions
                    </h3>
                    <CurrentConditions
                        lat={peak.location_coords[1]}
                        lng={peak.location_coords[0]}
                    />
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

