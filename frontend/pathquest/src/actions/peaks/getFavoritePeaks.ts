"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { useAuth } from "@/auth/useAuth";
import Peak from "@/typeDefs/Peak";

const backendUrl = getBackendUrl();

const getFavoritePeaks = async (): Promise<Peak[]> => {
    const session = await useAuth();

    if (!session) {
        return [];
    }

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[getFavoritePeaks] Failed to get Google ID token:", err);
        return null;
    });

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[getFavoritePeaks] No token available - cannot make authenticated request");
        return [];
    }

    const response = await fetch(`${backendUrl}/peaks/summits/favorites`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
            userId: session.user.id,
        }),
    });

    if (!response.ok) {
        console.error("[getFavoritePeaks]", response.status, await response.text());
        return [];
    }

    return response.json();
};

export default getFavoritePeaks;
