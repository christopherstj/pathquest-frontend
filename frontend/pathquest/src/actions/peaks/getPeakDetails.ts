"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import Activity from "@/typeDefs/Activity";
import Challenge from "@/typeDefs/Challenge";
import Peak from "@/typeDefs/Peak";
import ServerActionResult from "@/typeDefs/ServerActionResult";
import Summit from "@/typeDefs/Summit";

const backendUrl = getBackendUrl();

const getPeakDetails = async (
    peakId: string
): Promise<
    ServerActionResult<{
        peak: Peak;
        publicSummits: Summit[];
        challenges: Challenge[];
        activities?: Activity[];
    }>
> => {
    const session = await useAuth();
    const token = session ? await getGoogleIdToken() : null;

    const apiRes = await fetch(`${backendUrl}/peaks/${peakId}`, {
        method: "GET",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!apiRes.ok) {
        console.error(await apiRes.text());
        return {
            success: false,
            error: "Failed to fetch peak details",
        };
    }

    const data = await apiRes.json();

    return {
        success: true,
        data,
    };
};

export default getPeakDetails;
