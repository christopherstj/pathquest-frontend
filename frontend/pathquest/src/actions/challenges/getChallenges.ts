"use server";

import getSessionToken from "@/auth/getSessionToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { Challenge } from "@pathquest/shared/types";

const getChallenges = async (
    page: number,
    perPage: number,
    search?: string
): Promise<Challenge[]> => {
    const backendUrl = getBackendUrl();

    const session = await useAuth();
    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getSessionToken().catch(() => null);

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            return headers;
        },
    });

    try {
        return await endpoints.getChallenges(client, { page, perPage, search }, { cache: "no-cache" } as any);
    } catch (err: any) {
        console.error("[getChallenges]", err?.bodyText ?? err);
        return [];
    }
};

export default getChallenges;
