"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import Peak from "@/typeDefs/Peak";

const getPeakSummits = async (): Promise<Peak[]> => {
    const session = await useAuth();

    if (!session) {
        return [];
    }

    const userId = session.user.id ?? "";

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[getPeakSummits] Failed to get Google ID token:", err);
        return null;
    });

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[getPeakSummits] No token available - cannot make authenticated request");
        return [];
    }

    const backendUrl = getBackendUrl();

    const apiRes = await fetch(`${backendUrl}/peaks/summits/${userId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!apiRes.ok) {
        console.error("[getPeakSummits]", apiRes.status, await apiRes.text());
        return [];
    }

    const data: Peak[] = await apiRes.json();

    return data.sort(
        (a, b) => (b.ascents?.length ?? 0) - (a.ascents?.length ?? 0)
    );
};

export default getPeakSummits;
