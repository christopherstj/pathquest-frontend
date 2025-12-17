"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import Challenge from "@/typeDefs/Challenge";
import { useAuth } from "@/auth/useAuth";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";

const backendUrl = getBackendUrl();

const getAllChallenges = async (
    type: "completed" | "in-progress" | "not-started",
    bounds?: {
        northwest: [number, number];
        southeast: [number, number];
    },
    search?: string
): Promise<ChallengeProgress[]> => {
    const session = await useAuth();

    if (!session) {
        return [];
    }

    const token = await getGoogleIdToken();

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[getAllChallenges] No token available - cannot make authenticated request");
        return [];
    }

    const searchString =
        search && search.length > 0
            ? `&search=${encodeURIComponent(search)}`
            : "";

    const url = bounds
        ? `${backendUrl}/challenges/search?type=${type}&northWestLat=${bounds.northwest[0]}&northWestLng=${bounds.northwest[1]}&southEastLat=${bounds.southeast[0]}&southEastLng=${bounds.southeast[1]}${searchString}`
        : `${backendUrl}/challenges/search?type=${type}${searchString}`;

    const apiRes = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!apiRes.ok) {
        console.error("[getAllChallenges]", apiRes.status, await apiRes.text());
        return [];
    }

    const data: ChallengeProgress[] = await apiRes.json();

    return data;
};

export default getAllChallenges;
