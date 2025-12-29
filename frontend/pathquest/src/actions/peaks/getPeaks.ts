"use server";
import getSessionToken from "@/auth/getSessionToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { Peak } from "@pathquest/shared/types";

const getPeaks = async (
    page: number,
    perPage: number,
    search?: string
): Promise<Peak[]> => {
    const backendUrl = getBackendUrl();

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getSessionToken().catch((err) => {
        console.error("[getPeaks] Failed to get Google ID token:", err);
        return null;
    });

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[getPeaks] No token available - cannot make authenticated request");
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
        return await endpoints.getPeaks(client, { page, perPage, search }, { cache: "no-cache" } as any);
    } catch (err: any) {
        console.error("[getPeaks]", err?.bodyText ?? err);
        return [];
    }
};

export default getPeaks;
