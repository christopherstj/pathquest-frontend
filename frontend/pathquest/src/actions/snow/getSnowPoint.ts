"use server";

import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { SnowPointData } from "@pathquest/shared/types";

const getSnowPoint = async (
    lat: number,
    lng: number
): Promise<SnowPointData | null> => {
    try {
        const backendUrl = getBackendUrl();
        const client = createApiClient({
            baseUrl: backendUrl,
            getAuthHeaders: async () => ({}),
        });

        const data = await endpoints.getSnowPoint(client, { lat, lng }, {
            next: { revalidate: 3600 }, // 1hr cache
        } as any);
        return data;
    } catch (error: any) {
        console.error(
            `Error fetching snow data for ${lat},${lng}:`,
            error?.bodyText ?? error
        );
        return null;
    }
};

export default getSnowPoint;
