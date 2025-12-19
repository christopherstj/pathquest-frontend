"use server";

import getBackendUrl from "@/helpers/getBackendUrl";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import Activity from "@/typeDefs/Activity";
import Challenge from "@/typeDefs/Challenge";
import Peak from "@/typeDefs/Peak";
import ServerActionResult from "@/typeDefs/ServerActionResult";
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
    // Get token for Google IAM authentication (required at infrastructure level)
    // No user headers - this is public-only data for static generation
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[getPublicChallengeDetails] Failed to get Google ID token:", err);
        return null;
    });

    const apiRes = await fetch(`${backendUrl}/challenges/${challengeId}/details`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            // No x-user-* headers - this is public-only data
        },
        // Cache for ISR
        next: { revalidate: 86400 },
    });

    if (!apiRes.ok) {
        console.error("Failed to fetch challenge details:", await apiRes.text());
        return {
            success: false,
            error: "Failed to fetch challenge details",
        };
    }

    const data = await apiRes.json();

    return {
        success: true,
        data,
    };
};

export default getPublicChallengeDetails;
