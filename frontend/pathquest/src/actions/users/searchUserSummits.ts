"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import ServerActionResult  from "@/typeDefs/ServerActionResult";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { SummitWithPeak } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

export interface SearchUserSummitsResult {
    summits: SummitWithPeak[];
    totalCount: number;
}

const searchUserSummits = async (
    userId: string,
    search?: string,
    page: number = 1,
    pageSize: number = 50
): Promise<ServerActionResult<SearchUserSummitsResult>> => {
    const session = await useAuth();
    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getGoogleIdToken().catch(() => null);

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            return headers;
        },
    });

    let data: SearchUserSummitsResult;
    try {
        data = await endpoints.searchUserSummits(
            client,
            userId,
            { search, page, pageSize },
            { cache: "no-cache" } as any
        );
    } catch (err: any) {
        console.error("Error searching user summits:", err?.bodyText ?? err);
        return { success: false, error: "Error searching summits" };
    }

    return {
        success: true,
        data,
    };
};

export default searchUserSummits;

