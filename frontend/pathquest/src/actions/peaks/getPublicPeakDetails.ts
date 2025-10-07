"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import Peak from "@/typeDefs/Peak";
import ServerActionResult from "@/typeDefs/ServerActionResult";

const backendUrl = getBackendUrl();

const getPublicPeakDetails = async (
    peakId: string
): Promise<ServerActionResult<Peak>> => {
    const token = await getGoogleIdToken();

    const apiRes = await fetch(`${backendUrl}/peaks/${peakId}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!apiRes.ok) {
        console.error(await apiRes.text());
        return {
            success: false,
            error: "Failed to fetch peak details",
        };
    }

    const { peak } = await apiRes.json();

    return {
        success: true,
        data: peak as Peak,
    };
};

export default getPublicPeakDetails;
