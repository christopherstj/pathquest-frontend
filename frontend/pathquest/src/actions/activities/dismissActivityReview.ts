"use server";

import getSessionToken from "@/auth/getSessionToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";

const backendUrl = getBackendUrl();

const dismissActivityReview = async (
    activityId: string
): Promise<{ success: boolean } | null> => {
    const token = await getSessionToken();

    if (!token) {
        console.error("[dismissActivityReview] No session token");
        return null;
    }

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => ({
            Authorization: `Bearer ${token}`,
        }),
    });

    try {
        return await endpoints.dismissActivityReview(client, activityId);
    } catch (err: any) {
        console.error("[dismissActivityReview] Error:", err?.bodyText ?? err);
        return null;
    }
};

export default dismissActivityReview;
