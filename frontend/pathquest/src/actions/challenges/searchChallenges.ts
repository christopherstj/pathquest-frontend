"use server";

import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";

type SearchChallengesParams = {
    northWestLat?: string;
    northWestLng?: string;
    southEastLat?: string;
    southEastLng?: string;
    search?: string;
    favoritesOnly?: boolean;
    types?: ("completed" | "in-progress" | "not-started")[];
};

const backendUrl = getBackendUrl();
const defaultTypes: ("completed" | "in-progress" | "not-started")[] = [
    "completed",
    "in-progress",
    "not-started",
];

const searchChallenges = async (
    params: SearchChallengesParams = {}
): Promise<ChallengeProgress[]> => {
    const {
        northWestLat,
        northWestLng,
        southEastLat,
        southEastLng,
        search,
        favoritesOnly = false,
        types = defaultTypes,
    } = params;

    const session = await useAuth();
    if (favoritesOnly && !session) {
        return [];
    }

    const token = session ? await getGoogleIdToken() : null;

    const url = new URL(`${backendUrl}/challenges/search`);
    url.searchParams.append("type", types.join(","));

    if (northWestLat && northWestLng && southEastLat && southEastLng) {
        url.searchParams.append("northWestLat", northWestLat);
        url.searchParams.append("northWestLng", northWestLng);
        url.searchParams.append("southEastLat", southEastLat);
        url.searchParams.append("southEastLng", southEastLng);
    }

    if (search) {
        url.searchParams.append("search", search);
    }

    if (favoritesOnly) {
        url.searchParams.append("favoritesOnly", "true");
    }

    const response = await fetch(url.toString(), {
        method: "GET",
        cache: "no-cache",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!response.ok) {
        console.error(await response.text());
        return [];
    }

    return (await response.json()) as ChallengeProgress[];
};

export default searchChallenges;


