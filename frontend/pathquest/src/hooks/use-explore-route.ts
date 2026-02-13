"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

export type ExploreContentType = "discovery" | "peak" | "challenge" | "activity" | "profile" | "userChallenge" | "publicLand" | "avalancheZone" | "fire";

export interface ExploreRouteParams {
    /** The current content type being viewed */
    contentType: ExploreContentType;
    /** Peak ID if viewing a peak detail */
    peakId: string | null;
    /** Challenge ID if viewing a challenge detail */
    challengeId: number | null;
    /** Activity ID if viewing an activity detail */
    activityId: string | null;
    /** User ID if viewing a profile */
    userId: string | null;
    /** User ID from user challenge URL (/users/:userId/challenges/:challengeId) */
    userChallengeUserId: string | null;
    /** Challenge ID from user challenge URL */
    userChallengeChallengeId: string | null;
    /** Public land objectId if viewing a public land detail */
    publicLandObjectId: string | null;
    /** Avalanche center ID if viewing an avalanche zone */
    avalancheCenterId: string | null;
    /** Avalanche zone ID if viewing an avalanche zone */
    avalancheZoneId: string | null;
    /** Fire incident ID if viewing a fire detail */
    fireIncidentId: string | null;
    /** Whether any detail view is active (not discovery mode) */
    hasDetail: boolean;
    /** The current pathname */
    pathname: string;
}

/**
 * Hook to parse the current URL and extract explore route parameters.
 * Centralizes route parsing logic for the explore tab.
 */
export function useExploreRoute(): ExploreRouteParams {
    const pathname = usePathname();

    return useMemo(() => {
        // Match route patterns
        const peakMatch = pathname.match(/^\/peaks\/([^\/]+)$/);
        const challengeMatch = pathname.match(/^\/challenges\/([^\/]+)$/);
        const activityMatch = pathname.match(/^\/activities\/([^\/]+)$/);
        const userMatch = pathname.match(/^\/users\/([^\/]+)$/);
        const userChallengeMatch = pathname.match(/^\/users\/([^\/]+)\/challenges\/([^\/]+)$/);
        const publicLandMatch = pathname.match(/^\/lands\/([^\/]+)$/);
        const avalancheMatch = pathname.match(/^\/avalanche\/([^\/]+)\/([^\/]+)$/);
        const fireMatch = pathname.match(/^\/fires\/([^\/]+)$/);

        // Extract IDs
        const peakId = peakMatch?.[1] ?? null;
        const challengeId = challengeMatch?.[1] ? parseInt(challengeMatch[1], 10) : null;
        const activityId = activityMatch?.[1] ?? null;
        const userId = userMatch?.[1] ?? null;
        const userChallengeUserId = userChallengeMatch?.[1] ?? null;
        const userChallengeChallengeId = userChallengeMatch?.[2] ?? null;
        const publicLandObjectId = publicLandMatch?.[1] ?? null;
        const avalancheCenterId = avalancheMatch?.[1] ?? null;
        const avalancheZoneId = avalancheMatch?.[2] ?? null;
        const fireIncidentId = fireMatch?.[1] ?? null;

        // Determine content type
        const hasDetail = Boolean(peakId || challengeId || activityId || userId || userChallengeUserId || publicLandObjectId || avalancheCenterId || fireIncidentId);

        let contentType: ExploreContentType = "discovery";
        if (peakId) {
            contentType = "peak";
        } else if (challengeId) {
            contentType = "challenge";
        } else if (activityId) {
            contentType = "activity";
        } else if (userChallengeUserId) {
            contentType = "userChallenge";
        } else if (userId) {
            contentType = "profile";
        } else if (publicLandObjectId) {
            contentType = "publicLand";
        } else if (avalancheCenterId && avalancheZoneId) {
            contentType = "avalancheZone";
        } else if (fireIncidentId) {
            contentType = "fire";
        }

        return {
            contentType,
            peakId,
            challengeId,
            activityId,
            userId,
            userChallengeUserId,
            userChallengeChallengeId,
            publicLandObjectId,
            avalancheCenterId,
            avalancheZoneId,
            fireIncidentId,
            hasDetail,
            pathname,
        };
    }, [pathname]);
}

/**
 * Get the default sub-tab for a content type.
 */
export function getDefaultSubTab(contentType: ExploreContentType): string {
    switch (contentType) {
        case "peak":
            return "conditions";
        case "challenge":
        case "userChallenge":
            return "progress";
        case "activity":
        case "publicLand":
        case "avalancheZone":
        case "fire":
            return "details";
        case "profile":
            return "stats";
        default:
            return "discovery";
    }
}
