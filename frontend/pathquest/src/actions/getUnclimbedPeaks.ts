"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";

const getUnclimbedPeaks = async (): Promise<UnclimbedPeak[]> => {
    const session = await useAuth();

    if (!session) {
        return [];
    }

    const userId = session.user.id ?? "";

    const token = await getGoogleIdToken();

    const backendUrl = getBackendUrl();

    const apiRes = await fetch(`${backendUrl}/peaks/summits/unclimbed`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            userId,
        }),
    });

    if (!apiRes.ok) {
        console.error(await apiRes.text());
        return [];
    }

    const data: UnclimbedPeak[] = await apiRes.json();

    return data;
};

export default getUnclimbedPeaks;
