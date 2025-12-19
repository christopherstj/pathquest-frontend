"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { useAuth } from "@/auth/useAuth";
import Activity from "@/typeDefs/Activity";
import Challenge from "@/typeDefs/Challenge";
import Peak from "@/typeDefs/Peak";

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
    const peaksUrl = `${backendUrl}/challenges/${challengeId}/details`;

    const peaksRes = await fetch(peaksUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            // Send user ID header for backend to identify user (works in all environments)
            ...(userId ? { "x-user-id": String(userId) } : {}),
        },
    });

    if (!peaksRes.ok) {
        console.error("[getChallengeDetails]", peaksRes.status, await peaksRes.text());
        return null;
    }

    const peaks = await peaksRes.json();

    return peaks;
};

export default getChallengeDetails;
