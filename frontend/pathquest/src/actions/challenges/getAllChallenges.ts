"use server";
import getSessionToken from "@/auth/getSessionToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { useAuth } from "@/auth/useAuth";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { ChallengeProgress } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

const getAllChallenges = async (
    type: "completed" | "in-progress" | "not-started",
    bounds?: {
        northwest: [number, number];
        southeast: [number, number];
    },
    search?: string
): Promise<ChallengeProgress[]> => {
    const session = await useAuth();

    if (!session) {
        return [];
    }

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getSessionToken().catch((err) => {
        console.error("[getAllChallenges] Failed to get Google ID token:", err);
        return null;
    });

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[getAllChallenges] No token available - cannot make authenticated request");
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
        return await endpoints.getAllChallenges(client, { type, bounds, search });
    } catch (err: any) {
        console.error("[getAllChallenges]", err?.bodyText ?? err);
        return [];
    }
};

export default getAllChallenges;
