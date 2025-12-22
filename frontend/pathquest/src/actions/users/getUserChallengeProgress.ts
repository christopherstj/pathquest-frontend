"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import Challenge from "@/typeDefs/Challenge";
import Peak from "@/typeDefs/Peak";
import ServerActionResult from "@/typeDefs/ServerActionResult";

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

    const apiRes = await fetch(
        `${backendUrl}/users/${userId}/challenges/${challengeId}`,
        {
            method: "GET",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        }
    );

    if (!apiRes.ok) {
        const errorText = await apiRes.text();
        console.error("Error fetching user challenge progress:", errorText);
        return {
            success: false,
            error: apiRes.status === 404 
                ? "Challenge or user not found" 
                : "Error fetching challenge progress",
        };
    }

    const data = await apiRes.json();

    return {
        success: true,
        data,
    };
};

export default getUserChallengeProgress;

