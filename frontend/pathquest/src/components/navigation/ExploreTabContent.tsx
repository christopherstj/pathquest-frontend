"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useMapStore } from "@/providers/MapProvider";
import { useTabStore, ExploreSubTab } from "@/store/tabStore";
import useRequireAuth, { useIsAuthenticated } from "@/hooks/useRequireAuth";
import { useExploreRoute, getDefaultSubTab } from "@/hooks/use-explore-route";
import { useRouterRef } from "@/hooks/use-stable-ref";
import mapboxgl from "mapbox-gl";
import { ExploreContent } from "@/components/navigation/explore/ExploreContent";
import { ExploreProfileHeader } from "@/components/navigation/explore/ExploreProfileHeader";
import { ExploreSubTabs } from "@/components/navigation/explore/ExploreSubTabs";
import { useExploreData } from "@/hooks/use-explore-data";
import { useExploreMapEffects } from "@/hooks/use-explore-map-effects";

import addChallengeFavorite from "@/actions/challenges/addChallengeFavorite";
import deleteChallengeFavorite from "@/actions/challenges/deleteChallengeFavorite";

// Helpers
import { usePeakHoverMapEffects } from "@/hooks/use-peak-hover-map-effects";

interface ExploreTabContentProps {
    isActive: boolean;
}

/**
 * Explore tab content - handles both discovery mode and detail views.
 * 
 * Discovery mode: Shows visible peaks and challenges on the map
 * Detail mode: Shows specific peak, challenge, activity, or user profile
 * 
 * Sub-tabs change based on what type of content is being viewed.
 */
const ExploreTabContent = ({ isActive }: ExploreTabContentProps) => {
    const router = useRouter();
    const routerRef = useRouterRef(router);
    const requireAuth = useRequireAuth();
    const { isAuthenticated } = useIsAuthenticated();

    // Route parsing (centralized in hook)
    const {
        contentType,
        peakId,
        challengeId,
        activityId,
        userId,
        userChallengeUserId,
        userChallengeChallengeId,
        hasDetail,
    } = useExploreRoute();

    // Map store
    const visiblePeaks = useMapStore((state) => state.visiblePeaks);
    const visibleChallenges = useMapStore((state) => state.visibleChallenges);
    const map = useMapStore((state) => state.map);
    const isZoomedOutTooFar = useMapStore((state) => state.isZoomedOutTooFar);
    const setHoveredPeakId = useMapStore((state) => state.setHoveredPeakId);

    // Tab store
    const exploreSubTab = useTabStore((state) => state.exploreSubTab);
    const setExploreSubTab = useTabStore((state) => state.setExploreSubTab);
    const clearExploreHistory = useTabStore((state) => state.clearExploreHistory);
    const setLastExplorePath = useTabStore((state) => state.setLastExplorePath);

    // Local state
    const [hoveredPeakCoords, setHoveredPeakCoords] = useState<[number, number] | null>(null);
    const [highlightedActivityId, setHighlightedActivityId] = useState<string | null>(null);
    const [activityHoverCoords, setActivityHoverCoords] = useState<[number, number] | null>(null);

    // Peak hover effects
    usePeakHoverMapEffects({ hoverCoords: hoveredPeakCoords });

    // Set appropriate default sub-tab when content type changes
    useEffect(() => {
        setExploreSubTab(getDefaultSubTab(contentType) as ExploreSubTab);
    }, [contentType, peakId, challengeId, activityId, userId, userChallengeUserId, setExploreSubTab]);

    const {
        isLoading,
        peak,
        peakChallenges,
        publicSummits,
        peakActivities,
        challenge,
        challengePeaks,
        challengeProgress,
        nextPeakSuggestion,
        communityActivity,
        isFavorited,
        activity,
        activitySummits,
        isActivityOwner,
        activityPeakSummits,
        profileUser,
        profileStats,
        profilePeaksForMap,
        userChallengeChallenge,
        userChallengeProgress,
        userChallengePeaks,
        userChallengeUser,
        invalidateChallengeDetails,
        invalidateFavoriteChallenges,
    } = useExploreData({
        isActive,
        isAuthenticated,
        peakId,
        challengeId,
        activityId,
        userId,
        userChallengeUserId,
        userChallengeChallengeId,
    });

    const { flyToActivity } = useExploreMapEffects({
        contentType,
        exploreSubTab,
        isAuthenticated,
        peakId,
        peak: peak ?? null,
        peakActivities: peakActivities ?? null,
        publicSummits: publicSummits ?? null,
        setHighlightedActivityId,
        challengeId,
        challengePeaks: challengePeaks ?? null,
        userChallengeUserId,
        userChallengeChallengeId,
        userChallengePeaks,
        activity,
        activityPeakSummits,
        activityHoverCoords,
        userId,
        profilePeaksForMap,
    });

    // Navigation handlers
    const handlePeakClick = useCallback((id: string, coords?: [number, number]) => {
        routerRef.current.push(`/peaks/${id}`);
        if (map && coords) {
            map.flyTo({
                center: coords,
                zoom: 14,
                pitch: 60,
                essential: true,
            });
        }
    }, [map]);

    const handleChallengeClick = useCallback((id: string) => {
        routerRef.current.push(`/challenges/${id}`);
    }, []);

    const handlePeakHoverStart = useCallback((peakId: string, coords: [number, number]) => {
        setHoveredPeakCoords(coords);
    }, []);

    const handlePeakHoverEnd = useCallback(() => {
        setHoveredPeakCoords(null);
    }, []);

    const handleBack = useCallback(() => {
        // UX decision: the Explore back arrow always returns to Explore discovery mode.
        // Also clear any cached Explore detail route and internal history to prevent stale restoration.
        clearExploreHistory();
        setLastExplorePath(null);
        routerRef.current.push("/explore");
    }, [clearExploreHistory, setLastExplorePath]);

    const handleClose = useCallback(() => {
        // Close detail views back to Explore discovery mode (not Home).
        clearExploreHistory();
        setLastExplorePath(null);
        routerRef.current.push("/explore");
    }, [clearExploreHistory, setLastExplorePath]);

    const handleShowChallengeOnMap = useCallback(() => {
        if (!challengePeaks || challengePeaks.length === 0 || !map) return;

        const peakCoords = challengePeaks
            .filter((p) => p.location_coords)
            .map((p) => p.location_coords as [number, number]);

        if (peakCoords.length > 0) {
            const bounds = new mapboxgl.LngLatBounds();
            peakCoords.forEach((coord) => bounds.extend(coord));
            map.fitBounds(bounds, {
                maxZoom: 12,
            });
        }
    }, [challengePeaks, map]);

    const handleToggleFavorite = useCallback(() => {
        if (!challengeId) return;

        requireAuth(async () => {
            if (isFavorited) {
                await deleteChallengeFavorite(String(challengeId));
            } else {
                await addChallengeFavorite(String(challengeId));
            }
            invalidateChallengeDetails(challengeId);
            invalidateFavoriteChallenges();
        });
    }, [challengeId, isFavorited, requireAuth, invalidateChallengeDetails, invalidateFavoriteChallenges]);

    return (
        <div className="flex flex-col h-full">
            {/* Profile header (only for profile views) */}
            <ExploreProfileHeader user={contentType === "profile" ? profileUser : null} />

            {/* Sub-tab bar (only show when detail is open) */}
            {hasDetail && (
                <div className="px-4 py-2 border-b border-border/60 shrink-0 flex items-center gap-2">
                    <button
                        onClick={handleBack}
                        className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Back to Explore"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <ExploreSubTabs
                        contentType={contentType}
                        exploreSubTab={exploreSubTab}
                        onChangeSubTab={setExploreSubTab}
                    />
                </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${contentType}-${exploreSubTab}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                    >
                        <ExploreContent
                            isLoading={Boolean(isLoading)}
                            contentType={contentType}
                            exploreSubTab={exploreSubTab}
                            visibleChallenges={visibleChallenges}
                            visiblePeaks={visiblePeaks}
                            isZoomedOutTooFar={isZoomedOutTooFar}
                            onPeakClick={handlePeakClick}
                            onChallengeClick={handleChallengeClick}
                            peak={peak ?? null}
                            peakId={peakId}
                            peakChallenges={peakChallenges}
                            setExploreSubTab={setExploreSubTab}
                            isAuthenticated={isAuthenticated}
                            requireAuth={requireAuth}
                            highlightedActivityId={highlightedActivityId}
                            setHighlightedActivityId={setHighlightedActivityId}
                            challenge={challenge ?? null}
                            challengePeaks={challengePeaks ?? null}
                            challengeProgress={challengeProgress}
                            nextPeakSuggestion={nextPeakSuggestion ?? null}
                            communityActivity={communityActivity ?? null}
                            isFavorited={isFavorited}
                            onBack={handleBack}
                            onClose={handleClose}
                            onToggleFavorite={handleToggleFavorite}
                            onShowChallengeOnMap={handleShowChallengeOnMap}
                            onHoverStart={handlePeakHoverStart}
                            onHoverEnd={handlePeakHoverEnd}
                            userChallengeChallengeId={userChallengeChallengeId}
                            userChallengeChallenge={userChallengeChallenge}
                            userChallengeProgress={userChallengeProgress}
                            userChallengePeaks={userChallengePeaks}
                            userChallengeUser={userChallengeUser}
                            activity={activity}
                            activityId={activityId}
                            activitySummits={activitySummits}
                            isActivityOwner={isActivityOwner}
                            onSummitHover={setHoveredPeakId}
                            onShowActivityOnMap={flyToActivity}
                            onHoverCoords={setActivityHoverCoords}
                            userId={userId}
                            profileUser={profileUser}
                            profileStats={profileStats}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ExploreTabContent;

