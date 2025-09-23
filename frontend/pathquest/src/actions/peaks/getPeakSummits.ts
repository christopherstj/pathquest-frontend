"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import PeakSummit from "@/typeDefs/PeakSummit";

const getPeakSummits = async (): Promise<PeakSummit[]> => {
    const session = await useAuth();

    if (!session) {
        return [];
    }

    const userId = session.user.id ?? "";

    const token = await getGoogleIdToken();

    const backendUrl = getBackendUrl();

    const apiRes = await fetch(
        `${backendUrl}/peaks/summits/${userId}?requestingUserId=${userId}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!apiRes.ok) {
        console.error(await apiRes.text());
        return [];
    }

    const data: PeakSummit[] = await apiRes.json();

    return data.sort(
        (a, b) => (b.ascents.length ?? 0) - (a.ascents.length ?? 0)
    );
};

export default getPeakSummits;
