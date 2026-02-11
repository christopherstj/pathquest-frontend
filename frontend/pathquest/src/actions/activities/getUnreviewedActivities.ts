"use server";

import getSessionToken from "@/auth/getSessionToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { UnreviewedActivity } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

const getUnreviewedActivities = async (
    limit?: number
): Promise<UnreviewedActivity[]> => {
    const token = await getSessionToken();

    if (!token) {
        console.error("[getUnreviewedActivities] No session token");
        return [];
    }

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => ({
            Authorization: `Bearer ${token}`,
        }),
    });

    try {
        return await endpoints.getUnreviewedActivities(client, limit ? { limit } : undefined);
    } catch (err: any) {
        console.error("[getUnreviewedActivities] Error:", err?.bodyText ?? err);
        return [];
    }
};

export default getUnreviewedActivities;
