"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
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

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[searchNearestActivities] Failed to get Google ID token:", err);
        return null;
    });
    const userId = session.user?.id;

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            if (userId) headers["x-user-id"] = userId;
            if (session?.user?.email) headers["x-user-email"] = session.user.email;
            if (session?.user?.name) headers["x-user-name"] = encodeURIComponent(session.user.name);
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
