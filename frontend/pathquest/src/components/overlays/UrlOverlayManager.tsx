"use client";

import React, { Suspense, useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import PeakDetailPanel from "./PeakDetailPanel";
import ChallengeDetailPanel from "./ChallengeDetailPanel";

/**
 * URL-driven overlay manager that renders the appropriate detail panel
 * based on the current pathname.
 * 
 * This pattern allows:
 * - Map to persist across all navigations (no remounting)
 * - SEO-friendly static pages with generateStaticParams
 * - Smooth client-side navigation between all routes
 * 
 * The overlays are rendered via this component (in root layout),
 * not via parallel routes or page content, ensuring the map never reloads.
 */
const UrlOverlayManagerContent = () => {
    const pathname = usePathname();
    const router = useRouter();
    const previousPathRef = useRef<string | null>(null);

    // Parse pathname to determine what overlay to show
    const peakMatch = pathname.match(/^\/peaks\/([^\/]+)$/);
    const challengeMatch = pathname.match(/^\/challenges\/([^\/]+)$/);

    const peakId = peakMatch?.[1] ?? null;
    const challengeId = challengeMatch?.[1] ?? null;

    // Track previous path to determine navigation direction
    useEffect(() => {
        previousPathRef.current = pathname;
    }, [pathname]);

    // Close handler - navigate to home or use router.back() intelligently
    const handleClose = useCallback(() => {
        // If we have browser history and came from within the app, go back
        // Otherwise, navigate to home
        if (window.history.length > 1 && previousPathRef.current !== pathname) {
            router.back();
        } else {
            router.push("/");
        }
    }, [router, pathname]);

    // Navigate to home (useful for explicit "go home" scenarios)
    const handleNavigateHome = useCallback(() => {
        router.push("/");
    }, [router]);

    return (
        <AnimatePresence mode="wait">
            {peakId && (
                <PeakDetailPanel 
                    key={`peak-${peakId}`} 
                    peakId={peakId} 
                    onClose={handleClose} 
                />
            )}
            {challengeId && (
                <ChallengeDetailPanel 
                    key={`challenge-${challengeId}`} 
                    challengeId={parseInt(challengeId, 10)} 
                    onClose={handleClose} 
                />
            )}
        </AnimatePresence>
    );
};

const UrlOverlayManager = () => {
    return (
        <Suspense fallback={null}>
            <UrlOverlayManagerContent />
        </Suspense>
    );
};

export default UrlOverlayManager;

