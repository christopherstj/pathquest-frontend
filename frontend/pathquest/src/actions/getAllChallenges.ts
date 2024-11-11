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

    const userId = session.user.id;

    const token = await getGoogleIdToken();

    const searchString =
        search && search.length > 0
            ? `&search=${encodeURIComponent(search)}`
            : "";

    const url = bounds
        ? `${backendUrl}/challenges/search?userId=${userId}&type=${type}&northWestLat=${bounds.northwest[0]}&northWestLng=${bounds.northwest[1]}&southEastLat=${bounds.southeast[0]}&southEastLng=${bounds.southeast[1]}${searchString}`
        : `${backendUrl}/challenges/search?userId=${userId}&type=${type}${searchString}`;

    const apiRes = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!apiRes.ok) {
        console.error(await apiRes.text());
        return [];
    }

    const data: ChallengeProgress[] = await apiRes.json();

    console.log(data);

    return data;
};

export default getAllChallenges;
