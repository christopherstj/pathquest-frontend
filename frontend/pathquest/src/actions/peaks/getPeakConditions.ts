"use server";

import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { PeakConditions } from "@pathquest/shared/types";

const getPeakConditions = async (peakId: string): Promise<PeakConditions | null> => {
    try {
        const backendUrl = getBackendUrl();
        const client = createApiClient({
            baseUrl: backendUrl,
            getAuthHeaders: async () => ({}),
        });

        const data = await endpoints.getPeakConditions(client, peakId, {
            next: { revalidate: 900 }, // 15 min cache
        } as any);
        return data;
    } catch (error: any) {
        console.error(`Error fetching conditions for peak ${peakId}:`, error?.bodyText ?? error);
        return null;
    }
};

export default getPeakConditions;
