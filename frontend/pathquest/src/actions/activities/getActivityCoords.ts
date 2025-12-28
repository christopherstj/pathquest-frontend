"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
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

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[getActivityCoords] Failed to get Google ID token:", err);
        return null;
    });

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[getActivityCoords] No token available - cannot make authenticated request");
        return null;
    }

    const userId = session?.user?.id;

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
        return await endpoints.getActivityCoords(client, activityId);
    } catch (err: any) {
        console.error("[getActivityCoords]", err?.bodyText ?? err);
        return null;
    }
};

export default getActivityCoords;
