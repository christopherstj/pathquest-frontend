"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { useAuth } from "@/auth/useAuth";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { Activity, Challenge, Peak } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

export interface ChallengeProgressInfo {
    total: number;
    completed: number;
    lastProgressDate: string | null;
    lastProgressCount: number;
}

const getChallengeDetails = async (
    challengeId: string
): Promise<{
    challenge: Challenge;
    peaks: Peak[];
    progress: ChallengeProgressInfo;
    activityCoords: {
        id: string;
        coords: Activity["coords"];
    }[];
} | null> => {
    const session = await useAuth();

    if (!session) {
        return null;
    }

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[getChallengeDetails] Failed to get Google ID token:", err);
        return null;
    });

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[getChallengeDetails] No token available - cannot make authenticated request");
        return null;
    }

    const userId = session?.user?.id;
    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            if (userId) headers["x-user-id"] = String(userId);
            return headers;
        },
    });

    try {
        return await endpoints.getChallengeDetails(client, challengeId);
    } catch (err: any) {
        console.error("[getChallengeDetails]", err?.bodyText ?? err);
        return null;
    }
};

export default getChallengeDetails;
