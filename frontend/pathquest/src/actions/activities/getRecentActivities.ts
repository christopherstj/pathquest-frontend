"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { useAuth } from "@/auth/useAuth";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { ActivityStart } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

const getRecentActivities = async (summitsOnly?: boolean) => {
    const session = await useAuth();

    if (!session) {
        return [];
    }

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const idToken = await getGoogleIdToken().catch((err) => {
        console.error("[getRecentActivities] Failed to get Google ID token:", err);
        return null;
    });

    if (!idToken && process.env.NODE_ENV !== "development") {
        console.error("[getRecentActivities] No token available - cannot make authenticated request");
        return [];
    }

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (idToken) headers.Authorization = `Bearer ${idToken}`;
            return headers;
        },
    });

    try {
        return await endpoints.getRecentActivities(client, { summitsOnly });
    } catch {
        return [];
    }
};

export default getRecentActivities;
