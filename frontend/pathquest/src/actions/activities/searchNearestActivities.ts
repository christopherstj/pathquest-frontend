"use server";
import getSessionToken from "@/auth/getSessionToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { ActivityStart } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

const searchNearestActivities = async (
    lat: number,
    lng: number,
    page: number,
    search?: string
): Promise<ActivityStart[]> => {
    const session = await useAuth();

    if (!session) {
        return [];
    }

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
        return await endpoints.searchNearestActivities(client, { lat, lng, page, search }, { cache: "no-cache" } as any);
    } catch (err: any) {
        console.error("[searchNearestActivities]", err?.bodyText ?? err);
        return [];
    }
};

export default searchNearestActivities;
