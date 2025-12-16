"use client";

import React from "react";
import Peak from "@/typeDefs/Peak";
import Challenge from "@/typeDefs/Challenge";
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
    if (visibleChallenges.length === 0 && visiblePeaks.length === 0) {
        return <EmptyDiscoveryState isZoomedOutTooFar={isZoomedOutTooFar} />;
    }

    return (
        <div className="space-y-5">
            <DiscoveryChallengesList
                challenges={visibleChallenges}
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


