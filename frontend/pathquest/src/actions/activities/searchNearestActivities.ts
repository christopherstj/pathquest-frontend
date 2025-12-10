"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { ActivityStart } from "@/typeDefs/ActivityStart";

const backendUrl = getBackendUrl();

const searchNearestActivities = async (
    lat: number,
    lng: number,
    page: number,
    search?: string
): Promise<ActivityStart[]> => {
    const session = await useAuth();

    if (!session) {
        return [];
    }

    const token = await getGoogleIdToken().catch(() => null);
    const userId = session.user?.id;

    const url = search
        ? `${backendUrl}/activities/search/nearest?lat=${lat}&lng=${lng}&page=${page}&search=${search}`
        : `${backendUrl}/activities/search/nearest?lat=${lat}&lng=${lng}&page=${page}`;

    const response = await fetch(url, {
        cache: "no-cache",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(process.env.NODE_ENV === "development" && userId
                ? { "x-user-id": userId }
                : {}),
        },
    });

    if (!response.ok) {
        console.error(await response.text());
        return [];
    } else {
        return await response.json();
    }
};

export default searchNearestActivities;
