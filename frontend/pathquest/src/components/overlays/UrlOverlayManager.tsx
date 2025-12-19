"use client";

import React, { Suspense, useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import PeakDetailPanel from "./PeakDetailPanel";
import ChallengeDetailPanel from "./ChallengeDetailPanel";
import ActivityDetailPanel from "./ActivityDetailPanel";
import ProfileDetailPanel from "./ProfileDetailPanel";
import DiscoveryDrawer from "./DiscoveryDrawer";
import MobileNavLayout from "@/components/navigation/MobileNavLayout";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * URL-driven overlay manager that renders the appropriate detail panel
 * based on the current pathname.
 * 
 * This pattern allows:
 * - Map to persist across all navigations (no remounting)
 * - SEO-friendly static pages with generateStaticParams
 * - Smooth client-side navigation between all routes
 * 
 * Mobile: Uses MobileNavLayout with fixed tab bar and content sheet
 * Desktop: Uses separate panels (PeakDetailPanel, ChallengeDetailPanel, DiscoveryDrawer)
 * 
 * The overlays are rendered via this component (in root layout),
 * not via parallel routes or page content, ensuring the map never reloads.
 */
const UrlOverlayManagerContent = () => {
    const pathname = usePathname();
    const router = useRouter();
    const routerRef = useRef(router);
    const previousPathRef = useRef<string | null>(null);
    const isMobile = useIsMobile(1024);

    // Parse pathname to determine what overlay to show
    const peakMatch = pathname.match(/^\/peaks\/([^\/]+)$/);
    const challengeMatch = pathname.match(/^\/challenges\/([^\/]+)$/);
    const activityMatch = pathname.match(/^\/activities\/([^\/]+)$/);
    const userMatch = pathname.match(/^\/users\/([^\/]+)$/);

    const peakId = peakMatch?.[1] ?? null;
    const challengeId = challengeMatch?.[1] ?? null;
    const activityId = activityMatch?.[1] ?? null;
    const userId = userMatch?.[1] ?? null;

    // Keep router ref updated to avoid stale closure issues
    useEffect(() => {
        routerRef.current = router;
    }, [router]);

    // Track previous path to determine navigation direction
    useEffect(() => {
        previousPathRef.current = pathname;
    }, [pathname]);

    // Close handler - navigate to home or use router.back() intelligently
    const handleClose = useCallback(() => {
        // If we have browser history and came from within the app, go back
        // Otherwise, navigate to home (preserving map state)
        if (window.history.length > 1 && previousPathRef.current !== pathname) {
            routerRef.current.back();
        } else {
            routerRef.current.push("/");
        }
    }, [pathname]);

    // Mobile: Use new MobileNavLayout with fixed tab bar
    if (isMobile) {
        return <MobileNavLayout />;
    }

    // Desktop: Use separate panels for details and discovery
    return (
        <>
            <DiscoveryDrawer />
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
                {activityId && (
                    <ActivityDetailPanel 
                        key={`activity-${activityId}`} 
                        activityId={activityId} 
                        onClose={handleClose} 
                    />
                )}
                {userId && (
                    <ProfileDetailPanel 
                        key={`profile-${userId}`} 
                        userId={userId} 
                        onClose={handleClose} 
                    />
                )}
            </AnimatePresence>
        </>
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

