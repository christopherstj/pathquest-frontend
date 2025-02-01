"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";

const backendUrl = getBackendUrl();

const searchNearestPeaks = async (
    lat: number,
    lng: number,
    page: number,
    search?: string
): Promise<UnclimbedPeak[]> => {
    const session = await useAuth();

    if (!session) {
        return [];
    }

    const token = await getGoogleIdToken();

    const userId = session.user?.id;

    const url = search
        ? `${backendUrl}/peaks/search/nearest?userId=${userId}&lat=${lat}&lng=${lng}&page=${page}&search=${search}`
        : `${backendUrl}/peaks/search/nearest?userId=${userId}&lat=${lat}&lng=${lng}&page=${page}`;

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
