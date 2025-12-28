"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
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
    // Always generate token for Google IAM authentication (required at infrastructure level)
    // User identity is passed via x-user-* headers for application-level auth
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[searchPeaks] Failed to get Google ID token:", err);
        return null;
    });

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            if (session?.user?.id) headers["x-user-id"] = session.user.id;
            if (session?.user?.email) headers["x-user-email"] = session.user.email;
            if (session?.user?.name) headers["x-user-name"] = encodeURIComponent(session.user.name);
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
