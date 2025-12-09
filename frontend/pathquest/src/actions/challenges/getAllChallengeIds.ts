"use server";
import getBackendUrl from "@/helpers/getBackendUrl";
import Challenge from "@/typeDefs/Challenge";

const backendUrl = getBackendUrl();

const getAllChallengeIds = async (): Promise<{ id: number }[]> => {
    // Get all challenges (public endpoint)
    const apiRes = await fetch(`${backendUrl}/challenges?perPage=1000`, {
        method: "GET",
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

