"use server";

import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { PublicLandConditions } from "@pathquest/shared/types";

const getPublicLandConditions = async (objectId: string): Promise<PublicLandConditions | null> => {
    try {
        const backendUrl = getBackendUrl();
        const client = createApiClient({
            baseUrl: backendUrl,
            getAuthHeaders: async () => ({}),
        });

        return await endpoints.getPublicLandConditions(client, objectId, {
            next: { revalidate: 900 },
        } as any);
    } catch (error: any) {
        console.error(
            `Error fetching public land conditions ${objectId}:`,
            error?.bodyText ?? error
        );
        return null;
    }
};

export default getPublicLandConditions;
