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

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[toggleFavoritePeak] No token available - cannot make authenticated request");
        return false;
    }

    const response = await fetch(`${backendUrl}/peaks/favorite`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
            newValue,
            peakId,
        }),
    });

    if (!response.ok) {
        console.error("[toggleFavoritePeak]", response.status, await response.text());
        return false;
    } else {
        return true;
    }
};

export default toggleFavoritePeak;
