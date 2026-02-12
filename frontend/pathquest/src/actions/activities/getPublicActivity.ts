"use server";

import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { PublicActivity } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

const getPublicActivity = async (
    activityId: string
): Promise<PublicActivity | null> => {
    // Public endpoint - no auth required
    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => ({}),
    });

    try {
        return await endpoints.getPublicActivity(client, activityId);
    } catch (err: any) {
        console.error("[getPublicActivity] Error:", err?.bodyText ?? err);
        return null;
    }
};

export default getPublicActivity;
