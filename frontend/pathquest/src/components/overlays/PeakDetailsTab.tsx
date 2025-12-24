"use client";

import React from "react";
import { Cloud, Trophy } from "lucide-react";
import Peak from "@/typeDefs/Peak";
import Challenge from "@/typeDefs/Challenge";
import CurrentConditions from "@/components/app/peaks/CurrentConditions";
import { useIsAuthenticated } from "@/hooks/useRequireAuth";
import ChallengeLinkItem from "@/components/lists/challenge-link-item";

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
        </div>
    );
};

export default PeakDetailsTab;

