"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { useAuth } from "@/auth/useAuth";
import { ActivityStart } from "@/typeDefs/ActivityStart";

const backendUrl = getBackendUrl();

const getActivityStarts = async (
    bounds?: {
        northwest: [number, number];
        southeast: [number, number];
    },
    search?: string
): Promise<ActivityStart[]> => {
    const session = await useAuth();

    if (!session) {
        return [];
    }

    if (!search && !bounds) {
        return [];
    }

    const userId = session.user.id;

    const token = await getGoogleIdToken();

    const searchString =
        search && search.length > 0
            ? `&search=${encodeURIComponent(search)}`
            : "";

    const boundsString =
        bounds && bounds.northwest && bounds.southeast
            ? `&northWestLat=${bounds.northwest[0]}&northWestLng=${bounds.northwest[1]}&southEastLat=${bounds.southeast[0]}&southEastLng=${bounds.southeast[1]}`
            : "";

    const url = `${backendUrl}/activities/search?userId=${userId}${boundsString}${searchString}`;

    const apiRes = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!apiRes.ok) {
        console.error(await apiRes.text());
        return [];
    }

    const data: ActivityStart[] = await apiRes.json();

    return data;
};

export default getActivityStarts;
