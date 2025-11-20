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

    const peaksUrl = `${backendUrl}/challenges/${challengeId}/details?userId=${session.user.id}`;

    const peaksRes = await fetch(peaksUrl, {
        method: "GET",
        // cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!peaksRes.ok) {
        console.error(await peaksRes.text());
        return null;
    }

    const peaks = await peaksRes.json();

    return peaks;
};

export default getChallengeDetails;
