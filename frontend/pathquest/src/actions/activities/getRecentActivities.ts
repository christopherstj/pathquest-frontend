"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { useAuth } from "@/auth/useAuth";
import { ActivityStart } from "@/typeDefs/ActivityStart";

const backendUrl = getBackendUrl();

const getRecentActivities = async (summitsOnly?: boolean) => {
    const session = await useAuth();

    if (!session) {
        return [];
    }

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const idToken = await getGoogleIdToken().catch((err) => {
        console.error("[getRecentActivities] Failed to get Google ID token:", err);
        return null;
    });

    if (!idToken && process.env.NODE_ENV !== "development") {
        console.error("[getRecentActivities] No token available - cannot make authenticated request");
        return [];
    }

    const response = await fetch(
        `${backendUrl}/activities/recent${summitsOnly ? "?summitsOnly=true" : ""}`,
        {
            method: "GET",
            headers: {
                ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
            },
        }
    );

    if (!response.ok) {
        return [];
    }

    const data: ActivityStart[] = await response.json();

    return data;
};

export default getRecentActivities;
