"use server";
import { useAuth } from "@/auth/useAuth";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";

const backendUrl = getBackendUrl();

const deleteChallengeFavorite = async (challengeId: string) => {
    const session = await useAuth();

    if (!session) {
        return {
            success: false,
            error: "Unauthorized",
        };
    }

    const token = await getGoogleIdToken();

    const url = `${backendUrl}/challenges/favorite/${challengeId}`;

    const res = await fetch(url, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
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
