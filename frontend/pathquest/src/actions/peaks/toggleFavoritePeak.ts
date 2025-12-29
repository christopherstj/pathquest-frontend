"use server";
import getSessionToken from "@/auth/getSessionToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";

const toggleFavoritePeak = async (
    peakId: string,
    newValue: boolean
): Promise<boolean> => {
    const session = await useAuth();

    if (!session) {
        return false;
    }

    const backendUrl = getBackendUrl();

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getSessionToken().catch((err) => {
        console.error("[toggleFavoritePeak] Failed to get Google ID token:", err);
        return null;
    });

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[toggleFavoritePeak] No token available - cannot make authenticated request");
        return false;
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
        await endpoints.toggleFavoritePeak(client, { peakId, newValue });
        return true;
    } catch (err: any) {
        console.error("[toggleFavoritePeak]", err?.bodyText ?? err);
        return false;
    }
};

export default toggleFavoritePeak;
