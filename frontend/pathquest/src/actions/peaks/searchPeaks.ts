"use server";
import getSessionToken from "@/auth/getSessionToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { Peak } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

const searchPeaks = async (
    northWestLat?: string,
    northWestLng?: string,
    southEastLat?: string,
    southEastLng?: string,
    search?: string,
    page?: string,
    perPage?: string,
    showSummittedPeaks?: string
): Promise<Peak[]> => {
    const session = await useAuth();
    // Get the NextAuth session token from cookies
    const token = await getSessionToken();

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            return headers;
        },
    });

    try {
        return await endpoints.searchPeaks(client, {
            northWestLat,
            northWestLng,
            southEastLat,
            southEastLng,
            search,
            page,
            perPage,
            showSummittedPeaks,
        });
    } catch (err: any) {
        console.error("[searchPeaks]", err?.bodyText ?? err);
        return [];
    }
};

export default searchPeaks;
