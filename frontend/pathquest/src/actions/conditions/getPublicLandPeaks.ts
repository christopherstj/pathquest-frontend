"use server";

import getSessionToken from "@/auth/getSessionToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { PublicLandPeaksResult } from "@pathquest/shared/types";

const getPublicLandPeaks = async (
    objectId: string,
    page: number = 1,
    limit: number = 20
): Promise<PublicLandPeaksResult | null> => {
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

        return await endpoints.getPublicLandPeaks(client, objectId, { page, limit }, {
            next: { revalidate: 86400 },
        } as any);
    } catch (error: any) {
        console.error(
            `Error fetching public land peaks ${objectId}:`,
            error?.bodyText ?? error
        );
        return null;
    }
};

export default getPublicLandPeaks;
