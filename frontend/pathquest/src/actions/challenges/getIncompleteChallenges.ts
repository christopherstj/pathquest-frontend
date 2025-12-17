"use server";

import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { useAuth } from "@/auth/useAuth";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";

const backendUrl = getBackendUrl();

const getIncompleteChallenges = async (): Promise<ChallengeProgress[]> => {
    const session = await useAuth();

    if (!session) {
        return [];
    }

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[getIncompleteChallenges] Failed to get Google ID token:", err);
        return null;
    });

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[getIncompleteChallenges] No token available - cannot make authenticated request");
        return [];
    }

    const response = await fetch(`${backendUrl}/challenges/incomplete`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!response.ok) {
        console.error("[getIncompleteChallenges]", response.status, await response.text());
        return [];
    }

    return response.json();
};

export default getIncompleteChallenges;
