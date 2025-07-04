"use server";
import { useAuth } from "@/auth/useAuth";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import UserChallengeFavorite from "@/typeDefs/UserChallengeFavorite";

const backendUrl = getBackendUrl();

const updateChallengeFavorite = async (
    challengeId: string,
    newPrivacy: boolean
): Promise<{
    success: boolean;
    error?: string;
}> => {
    const session = await useAuth();

    if (!session) {
        return {
            success: false,
            error: "Unauthorized",
        };
    }

    const token = await getGoogleIdToken();

    const userId = session.user?.id;

    const body: UserChallengeFavorite = {
        challengeId,
        userId,
        isPublic: newPrivacy,
    };

    const url = `${backendUrl}/challenges/favorite`;

    const res = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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

export default updateChallengeFavorite;
