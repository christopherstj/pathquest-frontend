"use server";
import getSessionToken from "@/auth/getSessionToken";
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

    // Get the NextAuth session token from cookies
    const token = await getSessionToken();

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[getRecentActivities] No token available - cannot make authenticated request");
        return [];
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
        return await endpoints.getRecentActivities(client, { summitsOnly });
    } catch {
        return [];
    }
};

export default getRecentActivities;
