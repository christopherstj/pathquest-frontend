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
        activityId: string;
        timestamp: string;
        timezone?: string;
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
        data.activities.forEach((activity: any) => {
            if (activity.id === "12242435637") console.log(activity.startTime);
        });
        return data;
    }
};

export default getPeakDetails;
