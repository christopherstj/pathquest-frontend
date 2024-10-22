"use server";

import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import Activity from "@/typeDefs/Activity";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";

const backendUrl = getBackendUrl();

const getPeakDetails = async (
    peakId: string
): Promise<{
    peak: UnclimbedPeak;
    activities: Activity[];
    summits: {
        activityId: string;
        timestamp: string;
    }[];
} | null> => {
    const session = await useAuth();

    if (!session) {
        return null;
    }

    const userId = session.user.id;

    const idToken = await getGoogleIdToken();

    const response = await fetch(
        `${backendUrl}/peaks/details/${peakId}?userId=${userId}`,
        {
            method: "GET",
            cache: "no-cache",
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
        }
    );

    if (!response.ok) {
        console.error(await response.text());
        return null;
    } else {
        const data = await response.json();
        return data;
    }
};

export default getPeakDetails;
