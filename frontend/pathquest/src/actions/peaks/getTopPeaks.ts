"use server";
import getBackendUrl from "@/helpers/getBackendUrl";
import getGoogleIdToken from "@/auth/getGoogleIdToken";

interface TopPeak {
    id: string;
    public_summits: number;
}

const backendUrl = getBackendUrl();

const getTopPeaks = async (limit: number = 1000): Promise<TopPeak[]> => {
    // Always generate token for Google IAM authentication (required at infrastructure level)
    // Works during build via Vercel OIDC
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[getTopPeaks] Failed to get Google ID token:", err);
        return null;
    });
    
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const apiRes = await fetch(`${backendUrl}/peaks/top?limit=${limit}`, {
        method: "GET",
        headers,
        next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!apiRes.ok) {
        console.error("Failed to fetch top peaks:", await apiRes.text());
        return [];
    }

    const data = await apiRes.json();
    return data;
};

export default getTopPeaks;

