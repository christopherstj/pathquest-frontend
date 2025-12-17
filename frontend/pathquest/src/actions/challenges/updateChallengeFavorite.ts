"use server";
import { useAuth } from "@/auth/useAuth";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import UserChallengeFavorite from "@/typeDefs/UserChallengeFavorite";

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

    const url = `${backendUrl}/challenges/favorite`;

    const res = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        console.error("[updateChallengeFavorite]", res.status, await res.text());
        return {
            success: false,
            error: res.statusText,
        };
    }

    return {
        success: true,
    };
};

export default updateChallengeFavorite;
