"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { useAuth } from "@/auth/useAuth";

const backendUrl = getBackendUrl();

const getActivityCoords = async (
    activityId: string
): Promise<{
    coords: [number, number][];
} | null> => {
    const session = await useAuth();

    if (!session) {
        return null;
    }

    const token = await getGoogleIdToken();

    const coordsUrl = `${backendUrl}/activities/${activityId}/coords`;

    const coordsRes = await fetch(coordsUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!coordsRes.ok) {
        console.error(await coordsRes.text());
        return null;
    }

    const coords = await coordsRes.json();

    return coords;
};

export default getActivityCoords;
