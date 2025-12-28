"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { useAuth } from "@/auth/useAuth";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { ServerActionResult } from "@pathquest/shared/types";

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

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            return headers;
        },
    });

    try {
        const data = await endpoints.getNextPeakSuggestion(client, challengeId, { lat, lng });
        return { success: true, data };
    } catch (err: any) {
        console.error("[getNextPeakSuggestion]", err?.bodyText ?? err);
        return { success: false, error: "Failed to get next peak suggestion" };
    }
};

export default getNextPeakSuggestion;

