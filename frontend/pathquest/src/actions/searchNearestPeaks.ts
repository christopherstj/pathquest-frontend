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

    const url = search
        ? `${backendUrl}/peaks/search/nearest?lat=${lat}&lng=${lng}&page=${page}&search=${search}`
        : `${backendUrl}/peaks/search/nearest?lat=${lat}&lng=${lng}&page=${page}`;

    const response = await fetch(url, {
        cache: "no-cache",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        console.error(await response.text());
        return [];
    } else {
        return await response.json();
    }
};

export default searchNearestPeaks;
