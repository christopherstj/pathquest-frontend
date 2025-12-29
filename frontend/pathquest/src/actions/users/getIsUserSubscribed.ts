"use server";
import getSessionToken from "@/auth/getSessionToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";

const backendUrl = getBackendUrl();

const getIsUserSubscribed = async (userId: string) => {
    // Always generate token for Google IAM authentication (required at infrastructure level)
    const idToken = await getSessionToken().catch((err) => {
        console.error("[getIsUserSubscribed] Failed to get Google ID token:", err);
        return null;
    });

    if (!idToken && process.env.NODE_ENV !== "development") {
        console.error("[getIsUserSubscribed] No token available - cannot make authenticated request");
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
        const data = await endpoints.getIsUserSubscribed(client, userId);
        return data.isSubscribed;
    } catch (err: any) {
        console.error("[getIsUserSubscribed]", err?.bodyText ?? err);
        return false;
    }
};

export default getIsUserSubscribed;
