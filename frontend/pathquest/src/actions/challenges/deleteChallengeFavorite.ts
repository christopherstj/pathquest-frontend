"use server";

import getBackendUrl from "@/helpers/getBackendUrl";
import getAuthHeaders from "@/helpers/getAuthHeaders";
import { createApiClient, endpoints } from "@pathquest/shared/api";

const backendUrl = getBackendUrl();

const deleteChallengeFavorite = async (challengeId: string) => {
    const { headers, session } = await getAuthHeaders();

    if (!session) {
        return {
            success: false,
            error: "Unauthorized",
        };
    }

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => headers,
    });

    try {
        await endpoints.deleteChallengeFavorite(client, challengeId);
    } catch (err: any) {
        console.error(err?.bodyText ?? err);
        return { success: false, error: err?.message ?? "Failed to unfavorite challenge" };
    }

    return {
        success: true,
    };
};

export default deleteChallengeFavorite;
