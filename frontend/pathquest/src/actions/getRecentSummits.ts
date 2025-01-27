"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import ManualPeakSummit from "@/typeDefs/ManualPeakSummit";
import Peak from "@/typeDefs/Peak";

const backendUrl = getBackendUrl();

const getRecentSummits = async (): Promise<
    (Peak & ManualPeakSummit)[] | null
> => {
    const session = await useAuth();

    if (!session) {
        return null;
    }

    const token = await getGoogleIdToken();

    const userId = session.user.id;

    const peaksUrl = `${backendUrl}/peaks/summits/recent?userId=${userId}`;

    const peaksRes = await fetch(peaksUrl, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!peaksRes.ok) {
        console.error(await peaksRes.text());
        return null;
    }

    const peaks = await peaksRes.json();

    return peaks;
};

export default getRecentSummits;
