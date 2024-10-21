"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";

const backendUrl = getBackendUrl();

const getUnclimbedPeaksWithBounds = async (bounds: {
    northwest: [number, number];
    southeast: [number, number];
}): Promise<UnclimbedPeak[]> => {
    const session = await useAuth();

    if (!session) {
        return [];
    }

    const userId = session.user.id ?? "";

    const token = await getGoogleIdToken();

    const url = `${backendUrl}/peaks/summits/unclimbed?userId=${userId}&northWestLat=${bounds.northwest[0]}&northWestLng=${bounds.northwest[1]}&southEastLat=${bounds.southeast[0]}&southEastLng=${bounds.southeast[1]}`;

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

    const data: UnclimbedPeak[] = await apiRes.json();

    return data;
};

export default getUnclimbedPeaksWithBounds;
