"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { useAuth } from "@/auth/useAuth";

const backendUrl = getBackendUrl();

const getActivityCoords = async (
    activityId: string
): Promise<{
    coords: [number, number][];
} | null> => {
    const session = await useAuth();

    if (!session) {
        return null;
    }

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[getActivityCoords] Failed to get Google ID token:", err);
        return null;
    });

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[getActivityCoords] No token available - cannot make authenticated request");
        return null;
    }

    const coordsUrl = `${backendUrl}/activities/${activityId}/coords`;

    const userId = session?.user?.id;

    const coordsRes = await fetch(coordsUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            // Pass user identity via headers for backend auth (works in both dev and prod)
            ...(userId ? { "x-user-id": userId } : {}),
            ...(session?.user?.email ? { "x-user-email": session.user.email } : {}),
            ...(session?.user?.name ? { "x-user-name": encodeURIComponent(session.user.name) } : {}),
        },
    });

    if (!coordsRes.ok) {
        console.error("[getActivityCoords]", coordsRes.status, await coordsRes.text());
        return null;
    }

    const coords = await coordsRes.json();

    return coords;
};

export default getActivityCoords;
