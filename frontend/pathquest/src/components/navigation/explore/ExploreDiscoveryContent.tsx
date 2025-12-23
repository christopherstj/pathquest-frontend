"use client";

import React from "react";
import DiscoveryContentMobile from "@/components/overlays/mobile/discovery-content-mobile";
import Peak from "@/typeDefs/Peak";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";

interface ExploreDiscoveryContentProps {
    visibleChallenges: ChallengeProgress[];
    visiblePeaks: Peak[];
    isZoomedOutTooFar: boolean;
    onPeakClick: (id: string, coords?: [number, number]) => void;
    onChallengeClick: (id: string) => void;
}

export const ExploreDiscoveryContent = ({
    visibleChallenges,
    visiblePeaks,
    isZoomedOutTooFar,
    onPeakClick,
    onChallengeClick,
}: ExploreDiscoveryContentProps) => {
    return (
        <div className="p-4">
            <DiscoveryContentMobile
                visibleChallenges={visibleChallenges}
                visiblePeaks={visiblePeaks}
                isZoomedOutTooFar={isZoomedOutTooFar}
                onPeakClick={onPeakClick}
                onChallengeClick={onChallengeClick}
            />
        </div>
    );
};


