"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { useAuth } from "@/auth/useAuth";
import Activity from "@/typeDefs/Activity";
import SummitWithPeak from "@/typeDefs/SummitWithPeak";

const backendUrl = getBackendUrl();

const getActivityDetails = async (
    activityId: string
): Promise<{
    activity: Activity;
    summits: SummitWithPeak[];
} | null> => {
    const session = await useAuth();
    const token = session ? await getGoogleIdToken().catch(() => null) : null;
    const userId = session?.user?.id;

    const url = `${backendUrl}/activities/${activityId}`;

    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(process.env.NODE_ENV === "development" && userId
                ? { "x-user-id": userId }
                : {}),
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
