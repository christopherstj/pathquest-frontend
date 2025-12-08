"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { useAuth } from "@/auth/useAuth";
import Peak from "@/typeDefs/Peak";

const backendUrl = getBackendUrl();

const getFavoritePeaks = async (): Promise<Peak[]> => {
    const session = await useAuth();

    if (!session) {
        return [];
    }

    const token = await getGoogleIdToken();

    const response = await fetch(`${backendUrl}/peaks/summits/favorites`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            userId: session.user.id,
        }),
    });

    if (!response.ok) {
        console.error(await response.text());
        return [];
    }

    return response.json();
};

export default getFavoritePeaks;
