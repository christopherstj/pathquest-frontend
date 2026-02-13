"use server";

import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { PublicLandDetail } from "@pathquest/shared/types";

const getPublicLandDetail = async (objectId: string): Promise<PublicLandDetail | null> => {
    try {
        const backendUrl = getBackendUrl();
        const client = createApiClient({
            baseUrl: backendUrl,
            getAuthHeaders: async () => ({}),
        });

        return await endpoints.getPublicLandDetail(client, objectId, {
            next: { revalidate: 86400 },
        } as any);
    } catch (error: any) {
        console.error(
            `Error fetching public land detail ${objectId}:`,
            error?.bodyText ?? error
        );
        return null;
    }
};

export default getPublicLandDetail;
