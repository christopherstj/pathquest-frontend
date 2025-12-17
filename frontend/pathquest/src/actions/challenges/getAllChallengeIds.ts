"use server";
import getBackendUrl from "@/helpers/getBackendUrl";
import Challenge from "@/typeDefs/Challenge";
import getGoogleIdToken from "@/auth/getGoogleIdToken";

const backendUrl = getBackendUrl();

const getAllChallengeIds = async (): Promise<{ id: string }[]> => {
    // Get Google ID token for authentication (works during build via Vercel OIDC)
    const token = await getGoogleIdToken();
    
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    // Get all challenges (public endpoint)
    const apiRes = await fetch(`${backendUrl}/challenges?perPage=1000`, {
        method: "GET",
        headers,
        next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!apiRes.ok) {
        console.error("Failed to fetch challenges:", await apiRes.text());
        return [];
    }

    const data: Challenge[] = await apiRes.json();
    return data.map((c) => ({ id: c.id }));
};

export default getAllChallengeIds;

