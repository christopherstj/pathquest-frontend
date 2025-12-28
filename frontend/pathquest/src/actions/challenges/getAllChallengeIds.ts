"use server";
import getBackendUrl from "@/helpers/getBackendUrl";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { createApiClient, endpoints } from "@pathquest/shared/api";

const backendUrl = getBackendUrl();

const getAllChallengeIds = async (): Promise<{ id: string }[]> => {
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[getAllChallengeIds] Failed to get Google ID token:", err);
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
        return await endpoints.getAllChallengeIds(
            client,
            { next: { revalidate: 86400 } } as any
        );
    } catch (err: any) {
        console.error("[getAllChallengeIds] Failed to fetch challenges:", err?.bodyText ?? err);
        return [];
    }
};

export default getAllChallengeIds;

