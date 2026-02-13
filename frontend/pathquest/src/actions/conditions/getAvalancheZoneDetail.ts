"use server";

import getSessionToken from "@/auth/getSessionToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { AvalancheZoneDetail } from "@pathquest/shared/types";

const getAvalancheZoneDetail = async (
    centerId: string,
    zoneId: string
): Promise<AvalancheZoneDetail | null> => {
    try {
        const backendUrl = getBackendUrl();

        const token = await getSessionToken().catch(() => null);

        const client = createApiClient({
            baseUrl: backendUrl,
            getAuthHeaders: async () => {
                const headers: Record<string, string> = {};
                if (token) headers.Authorization = `Bearer ${token}`;
                return headers;
            },
        });

        return await endpoints.getAvalancheZoneDetail(client, centerId, zoneId, {
            next: { revalidate: 900 },
        } as any);
    } catch (error: any) {
        console.error(
            `Error fetching avalanche zone ${centerId}/${zoneId}:`,
            error?.bodyText ?? error
        );
        return null;
    }
};

export default getAvalancheZoneDetail;
