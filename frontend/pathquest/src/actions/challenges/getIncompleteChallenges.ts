"use server";

import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { useAuth } from "@/auth/useAuth";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";

const backendUrl = getBackendUrl();

const getIncompleteChallenges = async (): Promise<ChallengeProgress[]> => {
    const session = await useAuth();

    if (!session) {
        return [];
    }

    const token = await getGoogleIdToken();

    const response = await fetch(`${backendUrl}/challenges/incomplete`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        console.error(await response.text());
        return [];
    }

    return response.json();
};

export default getIncompleteChallenges;
