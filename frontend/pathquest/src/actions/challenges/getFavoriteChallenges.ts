"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { useAuth } from "@/auth/useAuth";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { ChallengeProgress } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

const getFavoriteChallenges = async (): Promise<ChallengeProgress[]> => {
    const session = await useAuth();

    if (!session) {
        return [];
    }

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[getFavoriteChallenges] Failed to get Google ID token:", err);
        return null;
    });

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[getFavoriteChallenges] No token available - cannot make authenticated request");
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
        return await endpoints.getFavoriteChallenges(client);
    } catch (err: any) {
        console.error("[getFavoriteChallenges]", err?.bodyText ?? err);
        return [];
    }
};

export default getFavoriteChallenges;
