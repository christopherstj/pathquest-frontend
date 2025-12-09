"use server";

import getBackendUrl from "@/helpers/getBackendUrl";
import getAuthHeaders from "@/helpers/getAuthHeaders";
import Activity from "@/typeDefs/Activity";
import Challenge from "@/typeDefs/Challenge";
import Peak from "@/typeDefs/Peak";
import ServerActionResult from "@/typeDefs/ServerActionResult";

const backendUrl = getBackendUrl();

const getPublicChallengeDetails = async (
    challengeId: string | number
): Promise<
    ServerActionResult<{
        challenge: Challenge;
        peaks: Peak[];
        activityCoords?: {
            id: string;
            coords: Activity["coords"];
        }[];
    }>
> => {
    const { headers } = await getAuthHeaders();

    const apiRes = await fetch(`${backendUrl}/challenges/${challengeId}/details`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
    });

    if (!apiRes.ok) {
        console.error("Failed to fetch challenge details:", await apiRes.text());
        return {
            success: false,
            error: "Failed to fetch challenge details",
        };
    }

    const data = await apiRes.json();

    return {
        success: true,
        data,
    };
};

export default getPublicChallengeDetails;
