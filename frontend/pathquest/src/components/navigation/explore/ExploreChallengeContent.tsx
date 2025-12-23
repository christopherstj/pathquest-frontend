"use client";

import React from "react";
import { Mountain, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Challenge from "@/typeDefs/Challenge";
import Peak from "@/typeDefs/Peak";
import PeakRow from "@/components/lists/peak-row";
import ChallengeDetailsMobile from "@/components/overlays/mobile/challenge-details-mobile";
import { ChallengeProgressInfo } from "@/actions/challenges/getChallengeDetails";
import { NextPeakSuggestion } from "@/actions/challenges/getNextPeakSuggestion";
import { ChallengeActivity } from "@/actions/challenges/getChallengeActivity";
import { ExploreSubTab } from "@/store/tabStore";

interface ExploreChallengeContentProps {
    challenge: Challenge | null;
    challengePeaks: Peak[] | null;
    challengeProgress: ChallengeProgressInfo | null | undefined;
    nextPeakSuggestion: NextPeakSuggestion | null;
    communityActivity: ChallengeActivity | null;
    isFavorited: boolean;
    exploreSubTab: ExploreSubTab;
    onBack: () => void;
    onClose: () => void;
    onToggleFavorite: () => void;
    onShowOnMap: () => void;
    onPeakClick: (id: string, coords?: [number, number]) => void;
    onHoverStart: (peakId: string, coords: [number, number]) => void;
    onHoverEnd: () => void;
}

export const ExploreChallengeContent = ({
    challenge,
    challengePeaks,
    challengeProgress,
    nextPeakSuggestion,
    communityActivity,
    isFavorited,
    exploreSubTab,
    onBack,
    onClose,
    onToggleFavorite,
    onShowOnMap,
    onPeakClick,
    onHoverStart,
    onHoverEnd,
}: ExploreChallengeContentProps) => {
    // Show error state if challenge not found
    if (!challenge) {
        return (
            <div className="text-center py-10 px-4">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-foreground font-medium">Challenge Not Found</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                    This challenge doesn&apos;t exist.
                </p>
                <Button variant="outline" onClick={onBack}>
                    Go Back
                </Button>
            </div>
        );
    }

    if (exploreSubTab === "peaks" && challengePeaks) {
        return (
            <div className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                    <Mountain className="w-4 h-4 text-secondary" />
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        {challengePeaks.length} Peaks
                    </h2>
                </div>
                <div className="space-y-1">
                    {[...challengePeaks]
                        .sort((a, b) => (b.elevation || 0) - (a.elevation || 0))
                        .map((p) => (
                            <PeakRow
                                key={p.id}
                                peak={p}
                                onPeakClick={onPeakClick}
                                onHoverStart={onHoverStart}
                                onHoverEnd={onHoverEnd}
                            />
                        ))}
                </div>
            </div>
        );
    }

    // Default to progress/details view
    return (
        <div className="p-4">
            <ChallengeDetailsMobile
                challenge={challenge}
                peaks={challengePeaks}
                progress={challengeProgress}
                nextPeakSuggestion={nextPeakSuggestion}
                communityActivity={communityActivity}
                isFavorited={isFavorited}
                onClose={onClose}
                onToggleFavorite={onToggleFavorite}
                onShowOnMap={onShowOnMap}
            />
        </div>
    );
};


