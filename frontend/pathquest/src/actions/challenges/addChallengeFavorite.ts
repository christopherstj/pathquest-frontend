"use server";

import getBackendUrl from "@/helpers/getBackendUrl";
import getAuthHeaders from "@/helpers/getAuthHeaders";
import { createApiClient, endpoints } from "@pathquest/shared/api";

const backendUrl = getBackendUrl();

const addChallengeFavorite = async (
    challengeId: string
): Promise<{
    success: boolean;
    error?: string;
}> => {
    const { headers, session } = await getAuthHeaders();

    if (!session) {
        return {
            success: false,
            error: "Unauthorized",
        };
    }

    const body = {
        challengeId,
    };

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => headers,
    });

    try {
        await endpoints.addChallengeFavorite(client, body.challengeId);
    } catch (err: any) {
        console.error(err?.bodyText ?? err);
        return { success: false, error: err?.message ?? "Failed to favorite challenge" };
    }

    return {
        success: true,
    };
};

export default addChallengeFavorite;
