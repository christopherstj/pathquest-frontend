"use server";

import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { ChallengeProgress } from "@pathquest/shared/types";

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

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getGoogleIdToken().catch(() => null);

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            return headers;
        },
    });

    try {
        return await endpoints.searchChallenges(client, {
            northWestLat,
            northWestLng,
            southEastLat,
            southEastLng,
            search,
            favoritesOnly,
            types,
        }, { cache: "no-cache" } as any);
    } catch (err: any) {
        console.error("[searchChallenges]", err?.bodyText ?? err);
        return [];
    }
};

export default searchChallenges;






