"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import Peak from "@/typeDefs/Peak";

const getUnclimbedPeaks = async (): Promise<Peak[]> => {
    const session = await useAuth();

    if (!session) {
        return [];
    }

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[getUnclimbedPeaks] Failed to get Google ID token:", err);
        return null;
    });

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[getUnclimbedPeaks] No token available - cannot make authenticated request");
        return [];
    }

    const backendUrl = getBackendUrl();

    const apiRes = await fetch(`${backendUrl}/peaks/summits/unclimbed/nearest`, {
        method: "GET",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!apiRes.ok) {
        console.error("[getUnclimbedPeaks]", apiRes.status, await apiRes.text());
        return [];
    }

    const data: Peak[] = await apiRes.json();

    return data;
};

export default getUnclimbedPeaks;
