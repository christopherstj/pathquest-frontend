"use server";

import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";

const getMapFires = async (bbox: string) => {
    try {
        const backendUrl = getBackendUrl();
        const client = createApiClient({
            baseUrl: backendUrl,
            getAuthHeaders: async () => ({}),
        });

        return await endpoints.getMapFires(client, bbox, {
            next: { revalidate: 3600 },
        } as any);
    } catch (error: any) {
        console.error(
            `Error fetching fires for bbox ${bbox}:`,
            error?.bodyText ?? error
        );
        return null;
    }
};

export default getMapFires;
