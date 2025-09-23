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

    const idToken = await getGoogleIdToken();

    const userId = session.user.id;

    const response = await fetch(
        `${backendUrl}/activities/recent?userId=${userId}${
            summitsOnly ? "&summitsOnly=true" : ""
        }`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${idToken}`,
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
