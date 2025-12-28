"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { Challenge, Peak, ServerActionResult } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

export interface ChallengeProgressInfo {
    total: number;
    completed: number;
    lastProgressDate: string | null;
    lastProgressCount: number;
}

export interface ChallengePeakWithSummit extends Peak {
    is_summited: boolean;
    summit_date: string | null;
}

export interface UserChallengeData {
    challenge: Challenge;
    progress: ChallengeProgressInfo;
    peaks: ChallengePeakWithSummit[];
    user: {
        id: string;
        name: string;
        pic?: string;
    };
    isOwner: boolean;
}

/**
 * Get a user's progress on a specific challenge.
 * Used for viewing another user's challenge progress page.
 */
const getUserChallengeProgress = async (
    userId: string,
    challengeId: string
): Promise<ServerActionResult<UserChallengeData>> => {
    const session = await useAuth();
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
        const data = await endpoints.getUserChallengeProgress(client, userId, challengeId, { cache: "no-cache" } as any);
        return {
            success: true,
            data,
        };
    } catch (err: any) {
        console.error("Error fetching user challenge progress:", err?.bodyText ?? err);
        return {
            success: false,
            error: err?.statusCode === 404 
                ? "Challenge or user not found" 
                : "Error fetching challenge progress",
        };
    }
};

export default getUserChallengeProgress;

