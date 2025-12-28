"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { ServerActionResult } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

export interface GetUserSummitStatesResult {
    states: string[];
}

/**
 * Gets the list of states where a user has summited peaks
 * Used to populate the state filter dropdown
 */
const getUserSummitStates = async (
    userId: string
): Promise<ServerActionResult<GetUserSummitStatesResult>> => {
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

    try {
        const data = await endpoints.getUserSummitStates(client, userId, { cache: "no-cache" } as any);
        return {
            success: true,
            data,
        };
    } catch (err: any) {
        console.error("Error getting user summit states:", err?.bodyText ?? err);
        return {
            success: false,
            error: "Error getting states",
        };
    }
};

export default getUserSummitStates;

