"use server";
import getSessionToken from "@/auth/getSessionToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { useAuth } from "@/auth/useAuth";
import { createApiClient, endpoints } from "@pathquest/shared/api";

const backendUrl = getBackendUrl();

const getActivityCoords = async (
    activityId: string
): Promise<{
    coords: [number, number][];
} | null> => {
    const session = await useAuth();

    if (!session) {
        return null;
    }

    // Get the NextAuth session token from cookies
    const token = await getSessionToken();

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[getActivityCoords] No token available - cannot make authenticated request");
        return null;
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
        return await endpoints.getActivityCoords(client, activityId);
    } catch (err: any) {
        console.error("[getActivityCoords]", err?.bodyText ?? err);
        return null;
    }
};

export default getActivityCoords;
