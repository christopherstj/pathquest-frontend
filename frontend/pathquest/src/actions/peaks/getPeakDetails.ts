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
    peak: UnclimbedPeak | null;
    activities: Activity[];
    summits: {
        id: string;
        activityId: string;
        timestamp: string;
        timezone?: string;
        notes?: string;
    }[];
}> => {
    const session = await useAuth();

    if (!session) {
        return {
            peak: null,
            activities: [],
            summits: [],
        };
    }

    const userId = session.user.id;

    const idToken = await getGoogleIdToken();

    const response = await fetch(
        `${backendUrl}/peaks/details/${peakId}?userId=${userId}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
        }
    );

    if (!response.ok) {
        console.error(await response.text());
        return {
            peak: null,
            activities: [],
            summits: [],
        };
    } else {
        const data = await response.json();
        return data;
    }
};

export default getPeakDetails;
