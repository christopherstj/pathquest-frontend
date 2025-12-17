"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";

const backendUrl = getBackendUrl();

const getIsFavorited = async (peakId: string): Promise<boolean> => {
    const session = await useAuth();

    if (!session) {
        return false;
    }

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const idToken = await getGoogleIdToken().catch((err) => {
        console.error("[getIsPeakFavorited] Failed to get Google ID token:", err);
        return null;
    });

    if (!idToken && process.env.NODE_ENV !== "development") {
        console.error("[getIsPeakFavorited] No token available - cannot make authenticated request");
        return false;
    }

    const response = await fetch(`${backendUrl}/peaks/favorite?peakId=${peakId}`, {
        method: "GET",
        headers: {
            ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
    });

    if (!response.ok) {
        console.error(await response.text());
        return false;
    } else {
        const data = await response.json();
        console.log(data);
        return data.isFavorited;
    }
};

export default getIsFavorited;
