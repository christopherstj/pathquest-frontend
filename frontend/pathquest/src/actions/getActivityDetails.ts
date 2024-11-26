"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { useAuth } from "@/auth/useAuth";
import Activity from "@/typeDefs/Activity";
import PeakSummit from "@/typeDefs/PeakSummit";

const backendUrl = getBackendUrl();

const getActivityDetails = async (
    activityId: string
): Promise<{
    activity: Activity;
    peakSummits: PeakSummit[];
} | null> => {
    const session = await useAuth();

    if (!session) {
        return null;
    }

    const token = await getGoogleIdToken();

    const url = `${backendUrl}/activities/${activityId}`;

    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        console.error(await res.text());
        return null;
    }

    const data = await res.json();

    return data;
};

export default getActivityDetails;
