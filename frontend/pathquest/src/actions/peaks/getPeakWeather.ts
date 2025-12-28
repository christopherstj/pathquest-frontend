"use server";

import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { CurrentWeather } from "@pathquest/shared/types";

const getPeakWeather = async (peakId: string): Promise<CurrentWeather | null> => {
    try {
        const backendUrl = getBackendUrl();
        const client = createApiClient({
            baseUrl: backendUrl,
            getAuthHeaders: async () => ({}),
        });

        const data = await endpoints.getPeakWeather(client, peakId, {
            next: { revalidate: 1800 },
        } as any);
        return data;
    } catch (error: any) {
        console.error(`Error fetching weather for peak ${peakId}:`, error?.bodyText ?? error);
        return null;
    }
};

export default getPeakWeather;

