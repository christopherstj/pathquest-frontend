"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";

const backendUrl = getBackendUrl();

const getPublicPeakDetails = async (peakId: string): Promise<any> => {
    const token = await getGoogleIdToken();

    const apiRes = await fetch(`${backendUrl}/public/peak/${peakId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
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

    return await apiRes.json();
};

export default getPublicPeakDetails;
