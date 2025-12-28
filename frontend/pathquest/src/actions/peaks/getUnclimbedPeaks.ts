"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { Peak } from "@pathquest/shared/types";

const getUnclimbedPeaks = async (): Promise<Peak[]> => {
    const session = await useAuth();

    if (!session) {
        return [];
    }

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[getUnclimbedPeaks] Failed to get Google ID token:", err);
        return null;
    });

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[getUnclimbedPeaks] No token available - cannot make authenticated request");
        return [];
    }

    const backendUrl = getBackendUrl();

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            return headers;
        },
    });

    try {
        return await endpoints.getUnclimbedPeaks(client);
    } catch (err: any) {
        console.error("[getUnclimbedPeaks]", err?.bodyText ?? err);
        return [];
    }
};

export default getUnclimbedPeaks;
