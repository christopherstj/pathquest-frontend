import { fetchLocalJson } from "./api";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";

type SearchChallengesOptions = {
    search?: string;
    favoritesOnly?: boolean;
    types?: ("completed" | "in-progress" | "not-started")[];
    bounds?: {
        nw: { lat: number; lng: number };
        se: { lat: number; lng: number };
    };
};

export const searchChallengesClient = async (
    options: SearchChallengesOptions
): Promise<ChallengeProgress[]> => {
    const params = new URLSearchParams();

    const types = options.types ?? [
        "completed",
        "in-progress",
        "not-started",
    ];
    params.set("type", types.join(","));

    if (options.search) params.set("search", options.search);
    if (options.favoritesOnly) params.set("favoritesOnly", "true");

    if (options.bounds) {
        params.set("northWestLat", options.bounds.nw.lat.toString());
        params.set("northWestLng", options.bounds.nw.lng.toString());
        params.set("southEastLat", options.bounds.se.lat.toString());
        params.set("southEastLng", options.bounds.se.lng.toString());
    }

    return fetchLocalJson<ChallengeProgress[]>("/api/search/challenges", params);
};

export default searchChallengesClient;

