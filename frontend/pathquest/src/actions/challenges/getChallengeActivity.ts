"use server";
import getSessionToken from "@/auth/getSessionToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { ServerActionResult } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

export interface ChallengeActivity {
    /** Number of unique users who summited challenge peaks this week */
    weeklyActiveUsers: number;
    /** Number of summits on challenge peaks this week */
    weeklySummits: number;
    /** Recent challenge completions (public only) */
    recentCompletions: {
        userId: string;
        userName: string | null;
        completedAt: string;
    }[];
}

/**
 * Gets community activity for a challenge - how many people are actively
 * working on this challenge.
 */
const getChallengeActivity = async (
    challengeId: string
): Promise<ServerActionResult<ChallengeActivity>> => {
    const token = await getSessionToken().catch((err) => {
        console.error("[getChallengeActivity] Failed to get Google ID token:", err);
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
        const data = await endpoints.getChallengeActivity(client, challengeId);
        return { success: true, data };
    } catch (err: any) {
        console.error("[getChallengeActivity]", err?.bodyText ?? err);
        return { success: false, error: "Failed to get challenge activity" };
    }
};

export default getChallengeActivity;

