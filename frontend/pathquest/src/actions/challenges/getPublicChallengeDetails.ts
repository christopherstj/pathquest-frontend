"use server";

import getBackendUrl from "@/helpers/getBackendUrl";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { Activity, Challenge, Peak, ServerActionResult } from "@pathquest/shared/types";
import { ChallengeProgressInfo } from "./getChallengeDetails";

const backendUrl = getBackendUrl();

/**
 * Gets challenge details for PUBLIC/STATIC pages only (SEO, metadata, static generation).
 * 
 * This function does NOT use useAuth() or access cookies/headers, making it safe
 * for static generation (ISR) without triggering DYNAMIC_SERVER_USAGE errors.
 * 
 * For authenticated challenge details (with user-specific data), use getChallengeDetails() instead.
 */
const getPublicChallengeDetails = async (
    challengeId: string | number
): Promise<
    ServerActionResult<{
        challenge: Challenge;
        peaks: Peak[];
        progress?: ChallengeProgressInfo;
        activityCoords?: {
            id: string;
            coords: Activity["coords"];
        }[];
    }>
> => {
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[getPublicChallengeDetails] Failed to get Google ID token:", err);
        return null;
    });

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            return headers;
        },
    });

    let data: any;
    try {
        data = await endpoints.getPublicChallengeDetails(
            client,
            challengeId,
            // Next.js-only fetch options for ISR caching.
            { next: { revalidate: 86400 } } as any
        );
    } catch (err: any) {
        console.error("Failed to fetch challenge details:", err?.bodyText ?? err);
        return { success: false, error: "Failed to fetch challenge details" };
    }

    return {
        success: true,
        data,
    };
};

export default getPublicChallengeDetails;
