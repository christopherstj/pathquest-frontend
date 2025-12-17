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

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[getRecentSummits] No token available - cannot make authenticated request");
        return null;
    }

    const peaksUrl = `${backendUrl}/peaks/summits/recent`;

    const peaksRes = await fetch(peaksUrl, {
        method: "GET",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!peaksRes.ok) {
        console.error("[getRecentSummits]", peaksRes.status, await peaksRes.text());
        return null;
    }

    const peaks = await peaksRes.json();

    return peaks;
};

export default getRecentSummits;
