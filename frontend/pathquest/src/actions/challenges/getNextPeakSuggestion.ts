"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { useAuth } from "@/auth/useAuth";
import ServerActionResult from "@/typeDefs/ServerActionResult";

const backendUrl = getBackendUrl();

export interface NextPeakSuggestion {
    closestPeak: {
        id: string;
        name: string;
        elevation: number;
        latitude: number;
        longitude: number;
        distance: number; // in kilometers
    } | null;
    easiestPeak: {
        id: string;
        name: string;
        elevation: number;
        latitude: number;
        longitude: number;
    } | null;
    totalRemaining: number;
}

/**
 * Gets the next peak suggestion for a challenge - the closest unclimbed peak
 * and the easiest (lowest elevation) unclimbed peak.
 */
const getNextPeakSuggestion = async (
    challengeId: string,
    lat?: number,
    lng?: number
): Promise<ServerActionResult<NextPeakSuggestion>> => {
    const session = await useAuth();

    if (!session) {
        return { success: false, error: "Not authenticated" };
    }

    const token = await getGoogleIdToken().catch((err) => {
        console.error("[getNextPeakSuggestion] Failed to get Google ID token:", err);
        return null;
    });

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[getNextPeakSuggestion] No token available");
        return { success: false, error: "Authentication error" };
    }

    const params = new URLSearchParams();
    if (lat !== undefined) params.set("lat", lat.toString());
    if (lng !== undefined) params.set("lng", lng.toString());

    const url = `${backendUrl}/challenges/${challengeId}/next-peak${params.toString() ? `?${params.toString()}` : ""}`;

    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!res.ok) {
        console.error("[getNextPeakSuggestion]", res.status, await res.text());
        return { success: false, error: "Failed to get next peak suggestion" };
    }

    const data = await res.json();

    return { success: true, data };
};

export default getNextPeakSuggestion;

