"use server";
import getSessionToken from "@/auth/getSessionToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { Peak } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

const getUnclimbedPeaksWithBounds = async (
    bounds?: {
        northwest: [number, number];
        southeast: [number, number];
    },
    search?: string,
    showSummittedPeaks?: boolean
): Promise<Peak[]> => {
    const session = await useAuth();

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getSessionToken().catch((err) => {
        console.error("[getUnclimbedPeaksWithBounds] Failed to get Google ID token:", err);
        return null;
    });

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[getUnclimbedPeaksWithBounds] No token available - cannot make authenticated request");
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
        if (!bounds) {
            return [];
        }
        return await endpoints.getUnclimbedPeaksWithBounds(client, { bounds, search, showSummittedPeaks });
    } catch (err: any) {
        console.error("[getUnclimbedPeaksWithBounds]", err?.bodyText ?? err);
        return [];
    }
};

export default getUnclimbedPeaksWithBounds;
