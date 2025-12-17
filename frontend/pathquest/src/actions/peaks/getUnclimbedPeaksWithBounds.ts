"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import Peak from "@/typeDefs/Peak";

const backendUrl = getBackendUrl();

const getUnclimbedPeaksWithBounds = async (
    bounds?: {
        northwest: [number, number];
        southeast: [number, number];
    },
    search?: string,
    showSummittedPeaks?: boolean
): Promise<Peak[]> => {
    const session = await useAuth();

    const token = await getGoogleIdToken();

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[getUnclimbedPeaksWithBounds] No token available - cannot make authenticated request");
        return [];
    }

    const searchString = search ? `&search=${encodeURIComponent(search)}` : "";

    const showSummitted = showSummittedPeaks ? "&showSummittedPeaks=true" : "";

    const url = bounds
        ? `${backendUrl}/peaks/summits/unclimbed?northWestLat=${bounds.northwest[0]}&northWestLng=${bounds.northwest[1]}&southEastLat=${bounds.southeast[0]}&southEastLng=${bounds.southeast[1]}${searchString}${showSummitted}`
        : `${backendUrl}/peaks/summits/unclimbed?${searchString}${showSummitted}`;

    const apiRes = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!apiRes.ok) {
        console.error("[getUnclimbedPeaksWithBounds]", apiRes.status, await apiRes.text());
        return [];
    }

    const data: Peak[] = await apiRes.json();

    return data;
};

export default getUnclimbedPeaksWithBounds;
