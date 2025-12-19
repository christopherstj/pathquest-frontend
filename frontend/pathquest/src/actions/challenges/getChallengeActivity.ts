"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import ServerActionResult from "@/typeDefs/ServerActionResult";

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
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[getChallengeActivity] Failed to get Google ID token:", err);
        return null;
    });

    const url = `${backendUrl}/challenges/${challengeId}/activity`;

    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!res.ok) {
        console.error("[getChallengeActivity]", res.status, await res.text());
        return { success: false, error: "Failed to get challenge activity" };
    }

    const data = await res.json();

    return { success: true, data };
};

export default getChallengeActivity;

