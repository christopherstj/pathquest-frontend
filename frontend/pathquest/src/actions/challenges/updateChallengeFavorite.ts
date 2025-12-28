"use server";
import { useAuth } from "@/auth/useAuth";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { UserChallengeFavorite } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

const updateChallengeFavorite = async (
    challengeId: string,
    newPrivacy: boolean
): Promise<{
    success: boolean;
    error?: string;
}> => {
    const session = await useAuth();

    if (!session) {
        return {
            success: false,
            error: "Unauthorized",
        };
    }

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[updateChallengeFavorite] Failed to get Google ID token:", err);
        return null;
    });

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[updateChallengeFavorite] No token available - cannot make authenticated request");
        return {
            success: false,
            error: "Authentication token not available",
        };
    }

    const userId = session.user?.id;

    const body: UserChallengeFavorite = {
        challenge_id: challengeId,
        user_id: userId,
        is_public: newPrivacy,
    };

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            return headers;
        },
    });

    try {
        await endpoints.updateChallengeFavorite(client, body);
    } catch (err: any) {
        console.error("[updateChallengeFavorite]", err?.bodyText ?? err);
        return { success: false, error: err?.message ?? "Failed to update challenge privacy" };
    }

    return {
        success: true,
    };
};

export default updateChallengeFavorite;
