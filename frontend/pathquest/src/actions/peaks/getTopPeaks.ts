"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";

interface TopPeak {
    id: string;
    public_summits: number;
}

const backendUrl = getBackendUrl();

const getTopPeaks = async (limit: number = 1000): Promise<TopPeak[]> => {
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[getTopPeaks] Failed to get Google ID token:", err);
        return null;
    });

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            return headers;
        },
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

