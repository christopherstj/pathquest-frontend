"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { useAuth } from "@/auth/useAuth";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";

const backendUrl = getBackendUrl();

const getFavoriteChallenges = async (): Promise<ChallengeProgress[]> => {
    const session = await useAuth();

    if (!session) {
        return [];
    }

    const userId = session.user.id;

    const token = await getGoogleIdToken();

    const response = await fetch(
        `${backendUrl}/challenges/search?userId=${userId}&type=in-progress,not-started&favoritesOnly=true`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        console.error(await response.text());
        return [];
    }

    return response.json();
};

export default getFavoriteChallenges;
