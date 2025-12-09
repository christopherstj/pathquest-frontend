"use server";

import getBackendUrl from "@/helpers/getBackendUrl";
import getAuthHeaders from "@/helpers/getAuthHeaders";

const backendUrl = getBackendUrl();

const addChallengeFavorite = async (
    challengeId: string
): Promise<{
    success: boolean;
    error?: string;
}> => {
    const { headers, session } = await getAuthHeaders();

    if (!session) {
        return {
            success: false,
            error: "Unauthorized",
        };
    }

    const body = {
        challengeId,
    };

    const url = `${backendUrl}/challenges/favorite`;

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        body: JSON.stringify(body),
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

export default addChallengeFavorite;
