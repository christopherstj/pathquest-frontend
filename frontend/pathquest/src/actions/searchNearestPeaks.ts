"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import Peak from "@/typeDefs/Peak";

const backendUrl = getBackendUrl();

const searchNearestPeaks = async (
    lat: number,
    lng: number,
    page: number,
    search?: string
): Promise<Peak[]> => {
    const session = await useAuth();

    if (!session) {
        return [];
    }

    const token = await getGoogleIdToken();

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[searchNearestPeaks] No token available - cannot make authenticated request");
        return [];
    }

    const url = search
        ? `${backendUrl}/peaks/search/nearest?lat=${lat}&lng=${lng}&page=${page}&search=${search}`
        : `${backendUrl}/peaks/search/nearest?lat=${lat}&lng=${lng}&page=${page}`;

    const response = await fetch(url, {
        cache: "no-cache",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!response.ok) {
        console.error("[searchNearestPeaks]", response.status, await response.text());
        return [];
    } else {
        return await response.json();
    }
};

export default searchNearestPeaks;
