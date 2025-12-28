"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import ServerActionResult  from "@/typeDefs/ServerActionResult";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { UserPeakWithSummitCount } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

export type PeakSortBy = "summits" | "elevation" | "recent" | "oldest" | "name";

export interface SearchUserPeaksFilters {
    search?: string;
    state?: string;
    minElevation?: number; // in meters
    maxElevation?: number; // in meters
    hasMultipleSummits?: boolean;
    sortBy?: PeakSortBy;
}

export interface SearchUserPeaksResult {
    peaks: UserPeakWithSummitCount[];
    totalCount: number;
}

const searchUserPeaks = async (
    userId: string,
    filters: SearchUserPeaksFilters = {},
    page: number = 1,
    pageSize: number = 50
): Promise<ServerActionResult<SearchUserPeaksResult>> => {
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

    let data: SearchUserPeaksResult;
    try {
        data = await endpoints.searchUserPeaks(
            client,
            userId,
            { filters, page, pageSize },
            { cache: "no-cache" } as any
        );
    } catch (err: any) {
        console.error("Error searching user peaks:", err?.bodyText ?? err);
        return { success: false, error: "Error searching peaks" };
    }

    return {
        success: true,
        data,
    };
};

export default searchUserPeaks;
