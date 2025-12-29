"use server";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";

interface TopPeak {
    id: string;
    public_summits: number;
}

const backendUrl = getBackendUrl();

/**
 * Gets top peaks by summit count for static generation.
 * No authentication needed - this is a public endpoint.
 */
const getTopPeaks = async (limit: number = 1000): Promise<TopPeak[]> => {
    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => ({}), // No auth needed for public endpoint
    });

    try {
        return await endpoints.getTopPeaks(
            client,
            { limit },
            // Next.js-only fetch options for ISR caching.
            { next: { revalidate: 86400 } } as any
        );
    } catch (err: any) {
        console.error("[getTopPeaks] Failed to fetch top peaks:", err?.bodyText ?? err);
        return [];
    }
};

export default getTopPeaks;
