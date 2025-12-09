"use server";

import getBackendUrl from "@/helpers/getBackendUrl";
import getAuthHeaders from "@/helpers/getAuthHeaders";

const backendUrl = getBackendUrl();

const deleteChallengeFavorite = async (challengeId: string) => {
    const { headers, session } = await getAuthHeaders();

    if (!session) {
        return {
            success: false,
            error: "Unauthorized",
        };
    }

    const url = `${backendUrl}/challenges/favorite/${challengeId}`;

    const res = await fetch(url, {
        method: "DELETE",
        headers,
    });

    if (!res.ok) {
        console.error(await res.text());
        return {
            success: false,
            error: res.statusText,
        };
    }

    return {
        success: true,
    };
};

export default deleteChallengeFavorite;
