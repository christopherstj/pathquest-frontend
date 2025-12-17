"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { useAuth } from "@/auth/useAuth";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";

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

    const response = await fetch(
        `${backendUrl}/challenges/search?type=in-progress,not-started&favoritesOnly=true`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        }
    );

    if (!response.ok) {
        console.error("[getFavoriteChallenges]", response.status, await response.text());
        return [];
    }

    return response.json();
};

export default getFavoriteChallenges;
