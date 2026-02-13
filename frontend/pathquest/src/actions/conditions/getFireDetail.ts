"use server";

import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { FireDetail } from "@pathquest/shared/types";

const getFireDetail = async (incidentId: string): Promise<FireDetail | null> => {
    try {
        const backendUrl = getBackendUrl();
        const client = createApiClient({
            baseUrl: backendUrl,
            getAuthHeaders: async () => ({}),
        });

        return await endpoints.getFireDetail(client, incidentId, {
            next: { revalidate: 3600 },
        } as any);
    } catch (error: any) {
        console.error(
            `Error fetching fire detail ${incidentId}:`,
            error?.bodyText ?? error
        );
        return null;
    }
};

export default getFireDetail;
