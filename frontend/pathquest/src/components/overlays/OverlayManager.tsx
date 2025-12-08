"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import PeakDetailPanel from "./PeakDetailPanel";
import ChallengeDetailPanel from "./ChallengeDetailPanel";

const OverlayManagerContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const peakId = searchParams.get("peakId");
    const challengeId = searchParams.get("challengeId");

    const closeOverlay = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("peakId");
        params.delete("challengeId");
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <AnimatePresence>
            {peakId && (
                <PeakDetailPanel key="peak-panel" peakId={peakId} onClose={closeOverlay} />
            )}
            {challengeId && (
                <ChallengeDetailPanel key="challenge-panel" challengeId={parseInt(challengeId)} onClose={closeOverlay} />
            )}
        </AnimatePresence>
    );
};

const OverlayManager = () => {
    return (
        <Suspense fallback={null}>
            <OverlayManagerContent />
        </Suspense>
    );
}

export default OverlayManager;

