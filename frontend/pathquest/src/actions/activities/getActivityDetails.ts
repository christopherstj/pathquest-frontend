"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { useAuth } from "@/auth/useAuth";
import Activity from "@/typeDefs/Activity";
import Peak from "@/typeDefs/Peak";

const backendUrl = getBackendUrl();

const getActivityDetails = async (
    activityId: string
): Promise<{
    activity: Activity;
    peakSummits: Peak[];
} | null> => {
    const session = await useAuth();

    if (!session) {
        return null;
    }

    const token = await getGoogleIdToken().catch(() => null);
    const userId = session.user?.id;

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
