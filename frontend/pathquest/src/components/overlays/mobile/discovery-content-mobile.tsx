"use client";

import React, { useMemo } from "react";
import Peak from "@/typeDefs/Peak";
import Challenge from "@/typeDefs/Challenge";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";
import DiscoveryChallengesList from "@/components/discovery/discovery-challenges-list";
import DiscoveryPeaksList from "@/components/discovery/discovery-peaks-list";
import EmptyDiscoveryState from "@/components/discovery/empty-discovery-state";

interface DiscoveryContentMobileProps {
    visibleChallenges: Challenge[];
    visiblePeaks: Peak[];
    isZoomedOutTooFar: boolean;
    onPeakClick: (id: string, coords?: [number, number]) => void;
    onChallengeClick: (id: string) => void;
}

const DiscoveryContentMobile = ({
    visibleChallenges,
    visiblePeaks,
    isZoomedOutTooFar,
    onPeakClick,
    onChallengeClick,
}: DiscoveryContentMobileProps) => {
    // Convert Challenge[] to ChallengeProgress[] by adding default total/completed
    const challengesWithProgress: ChallengeProgress[] = useMemo(
        () =>
            visibleChallenges.map((challenge) => ({
                ...challenge,
                total: challenge.num_peaks,
                completed: 0,
            })),
        [visibleChallenges]
    );

    if (visibleChallenges.length === 0 && visiblePeaks.length === 0) {
        return <EmptyDiscoveryState isZoomedOutTooFar={isZoomedOutTooFar} />;
    }

    return (
        <div className="space-y-5">
            <DiscoveryChallengesList
                challenges={challengesWithProgress}
                onChallengeClick={onChallengeClick}
                compact
            />
            <DiscoveryPeaksList
                peaks={visiblePeaks}
                onPeakClick={onPeakClick}
                compact
            />
        </div>
    );
};

export default DiscoveryContentMobile;


