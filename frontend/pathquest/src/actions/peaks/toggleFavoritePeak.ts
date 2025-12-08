"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";

const toggleFavoritePeak = async (
    peakId: string,
    newValue: boolean
): Promise<boolean> => {
    const session = await useAuth();

    if (!session) {
        return false;
    }

    const backendUrl = getBackendUrl();

    const token = await getGoogleIdToken();

    const response = await fetch(`${backendUrl}/peaks/favorite`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            newValue,
            peakId,
        }),
    });

    if (!response.ok) {
        console.error(await response.text());
        return false;
    } else {
        return true;
    }
};

export default toggleFavoritePeak;
