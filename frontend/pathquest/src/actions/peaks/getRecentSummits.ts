"use server";
import getSessionToken from "@/auth/getSessionToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { ManualPeakSummit, Peak, Summit } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

const getRecentSummits = async (): Promise<
    (Peak & ManualPeakSummit)[] | null
> => {
    const session = await useAuth();

    if (!session) {
        return null;
    }

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getSessionToken().catch((err) => {
        console.error("[getRecentSummits] Failed to get Google ID token:", err);
        return null;
    });

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[getRecentSummits] No token available - cannot make authenticated request");
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
        const summits = await endpoints.getRecentSummits(client);
        return summits as (Peak & ManualPeakSummit)[];
    } catch (err: any) {
        console.error("[getRecentSummits]", err?.bodyText ?? err);
        return null;
    }
};

export default getRecentSummits;
