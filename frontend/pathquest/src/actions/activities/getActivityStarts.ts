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

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[getActivityStarts] Failed to get Google ID token:", err);
        return null;
    });

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[getActivityStarts] No token available - cannot make authenticated request");
        return [];
    }

    const searchString =
        search && search.length > 0
            ? `&search=${encodeURIComponent(search)}`
            : "";

    const boundsString =
        bounds && bounds.northwest && bounds.southeast
            ? `&northWestLat=${bounds.northwest[0]}&northWestLng=${bounds.northwest[1]}&southEastLat=${bounds.southeast[0]}&southEastLng=${bounds.southeast[1]}`
            : "";

    const url = `${backendUrl}/activities/search${boundsString}${searchString}`;

    const apiRes = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!apiRes.ok) {
        console.error("[getActivityStarts]", apiRes.status, await apiRes.text());
        return [];
    }

    const data: ActivityStart[] = await apiRes.json();

    return data;
};

export default getActivityStarts;
