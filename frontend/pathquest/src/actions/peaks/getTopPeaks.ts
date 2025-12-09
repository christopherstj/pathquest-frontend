"use server";
import getBackendUrl from "@/helpers/getBackendUrl";

interface TopPeak {
    id: string;
    public_summits: number;
}

const backendUrl = getBackendUrl();

const getTopPeaks = async (limit: number = 1000): Promise<TopPeak[]> => {
    const apiRes = await fetch(`${backendUrl}/peaks/top?limit=${limit}`, {
        method: "GET",
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

