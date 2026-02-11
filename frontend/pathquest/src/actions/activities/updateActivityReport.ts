"use server";

import getSessionToken from "@/auth/getSessionToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { Activity } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

const updateActivityReport = async (
    activityId: string,
    data: Parameters<typeof endpoints.updateActivityReport>[2]
): Promise<Activity | null> => {
    const token = await getSessionToken();

    if (!token) {
        console.error("[updateActivityReport] No session token");
        return null;
    }

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => ({
            Authorization: `Bearer ${token}`,
        }),
    });

    try {
        return await endpoints.updateActivityReport(client, activityId, data);
    } catch (err: any) {
        console.error("[updateActivityReport] Error:", err?.bodyText ?? err);
        return null;
    }
};

export default updateActivityReport;
