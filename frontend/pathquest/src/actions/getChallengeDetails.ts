"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { useAuth } from "@/auth/useAuth";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import Activity from "@/typeDefs/Activity";
import Challenge from "@/typeDefs/Challenge";

const backendUrl = getBackendUrl();

const getChallengeDetails = async (
    challengeId: string
): Promise<{
    challenge: Challenge;
    peaks: (UnclimbedPeak & {
        ascents: {
            id: string;
            timestamp: string;
            activityId: string;
            timezone?: string;
        }[];
    })[];
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
