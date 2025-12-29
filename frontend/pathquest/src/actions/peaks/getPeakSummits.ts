"use server";
import getSessionToken from "@/auth/getSessionToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { Peak } from "@pathquest/shared/types";

const getPeakSummits = async (): Promise<Peak[]> => {
    const session = await useAuth();

    if (!session) {
        return [];
    }

    const userId = session.user.id ?? "";

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getSessionToken().catch((err) => {
        console.error("[getPeakSummits] Failed to get Google ID token:", err);
        return null;
    });

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[getPeakSummits] No token available - cannot make authenticated request");
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
        const data = await endpoints.getPeakSummits(client, userId);
        return data.sort(
            (a, b) => (b.ascents?.length ?? 0) - (a.ascents?.length ?? 0)
        );
    } catch (err: any) {
        console.error("[getPeakSummits]", err?.bodyText ?? err);
        return [];
    }
};

export default getPeakSummits;
