"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { useAuth } from "@/auth/useAuth";
import Activity from "@/typeDefs/Activity";
import Challenge from "@/typeDefs/Challenge";
import Peak from "@/typeDefs/Peak";

const backendUrl = getBackendUrl();

const getChallengeDetails = async (
    challengeId: string
): Promise<{
    challenge: Challenge;
    peaks: Peak[];
    activityCoords: {
        id: string;
        coords: Activity["coords"];
    }[];
} | null> => {
    const session = await useAuth();

    if (!session) {
        return null;
    }

    const token = await getGoogleIdToken();

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[getChallengeDetails] No token available - cannot make authenticated request");
        return null;
    }

    const peaksUrl = `${backendUrl}/challenges/${challengeId}/details`;

    const peaksRes = await fetch(peaksUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
