"use server";

import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";

const getMapAvalanches = async (bbox: string) => {
    try {
        const backendUrl = getBackendUrl();
        const client = createApiClient({
            baseUrl: backendUrl,
            getAuthHeaders: async () => ({}),
        });

        return await endpoints.getMapAvalanches(client, bbox, {
            next: { revalidate: 3600 },
        } as any);
    } catch (error: any) {
        console.error(
            `Error fetching avalanche zones for bbox ${bbox}:`,
            error?.bodyText ?? error
        );
        return null;
    }
};

export default getMapAvalanches;
