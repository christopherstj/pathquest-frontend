"use server";
import getSessionToken from "@/auth/getSessionToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";

const backendUrl = getBackendUrl();

const getIsFavorited = async (peakId: string): Promise<boolean> => {
    const session = await useAuth();

    if (!session) {
        return false;
    }

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const idToken = await getSessionToken().catch((err) => {
        console.error("[getIsPeakFavorited] Failed to get Google ID token:", err);
        return null;
    });

    if (!idToken && process.env.NODE_ENV !== "development") {
        console.error("[getIsPeakFavorited] No token available - cannot make authenticated request");
        return false;
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
        const data = await endpoints.getIsPeakFavorited(client, peakId);
        return data.isFavorited;
    } catch (err: any) {
        console.error("[getIsPeakFavorited]", err?.bodyText ?? err);
        return false;
    }
};

export default getIsFavorited;
