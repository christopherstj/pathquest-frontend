"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { ActivityStart } from "@/typeDefs/ActivityStart";

const backendUrl = getBackendUrl();

const searchNearestActivities = async (
    lat: number,
    lng: number,
    page: number,
    search?: string
): Promise<ActivityStart[]> => {
    const session = await useAuth();

    if (!session) {
        return [];
    }

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[searchNearestActivities] Failed to get Google ID token:", err);
        return null;
    });
    const userId = session.user?.id;

    const url = search
        ? `${backendUrl}/activities/search/nearest?lat=${lat}&lng=${lng}&page=${page}&search=${search}`
        : `${backendUrl}/activities/search/nearest?lat=${lat}&lng=${lng}&page=${page}`;

    const response = await fetch(url, {
        cache: "no-cache",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            // Pass user identity via headers for backend auth (works in both dev and prod)
            ...(userId ? { "x-user-id": userId } : {}),
            ...(session?.user?.email ? { "x-user-email": session.user.email } : {}),
            ...(session?.user?.name ? { "x-user-name": encodeURIComponent(session.user.name) } : {}),
        },
    });

    if (!response.ok) {
        console.error(await response.text());
        return [];
    } else {
        return await response.json();
    }
};

export default searchNearestActivities;
