"use server";
import getSessionToken from "@/auth/getSessionToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { AscentDetail, Peak } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

const getAscentDetails = async (
    ascentId: string
): Promise<{
    ascent: AscentDetail;
    peak: Peak;
} | null> => {
    const session = await useAuth();

    if (!session) {
        return null;
    }

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getSessionToken().catch((err) => {
        console.error("[getAscentDetails] Failed to get Google ID token:", err);
        return null;
    });

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[getAscentDetails] No token available - cannot make authenticated request");
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
        return await endpoints.getAscentDetails(client, ascentId);
    } catch (err: any) {
        console.error("[getAscentDetails]", err?.bodyText ?? err);
        return null;
    }
};

export default getAscentDetails;
