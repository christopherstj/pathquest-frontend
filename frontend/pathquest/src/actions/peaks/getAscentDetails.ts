"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import Ascent from "@/typeDefs/Ascent";
import AscentDetail from "@/typeDefs/AscentDetail";
import PeakSummit from "@/typeDefs/PeakSummit";

const backendUrl = getBackendUrl();

const getAscentDetails = async (
    ascentId: string
): Promise<{
    ascent: AscentDetail;
    peak: PeakSummit;
} | null> => {
    const session = await useAuth();

    if (!session) {
        return null;
    }

    const userId = session.user?.id;

    const token = await getGoogleIdToken();

    const url = `${backendUrl}/peaks/ascent/${ascentId}?userId=${userId}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        console.error(await response.text());
        return null;
    }

    return await response.json();
};

export default getAscentDetails;
