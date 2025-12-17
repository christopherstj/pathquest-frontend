"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import Peak from "@/typeDefs/Peak";

const backendUrl = getBackendUrl();

const searchPeaks = async (
    northWestLat?: string,
    northWestLng?: string,
    southEastLat?: string,
    southEastLng?: string,
    search?: string,
    page?: string,
    perPage?: string,
    showSummittedPeaks?: string
): Promise<Peak[]> => {
    const session = await useAuth();
    // Always generate token for Google IAM authentication (required at infrastructure level)
    // User identity is passed via x-user-* headers for application-level auth
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[searchPeaks] Failed to get Google ID token:", err);
        return null;
    });

    const url = new URL(`${backendUrl}/peaks/search`);

    if (northWestLat) url.searchParams.append("northWestLat", northWestLat);
    if (northWestLng) url.searchParams.append("northWestLng", northWestLng);
    if (southEastLat) url.searchParams.append("southEastLat", southEastLat);
    if (southEastLng) url.searchParams.append("southEastLng", southEastLng);
    if (search) url.searchParams.append("search", search);
    if (page) url.searchParams.append("page", page);
    if (perPage) url.searchParams.append("perPage", perPage);
    if (showSummittedPeaks)
        url.searchParams.append("showSummittedPeaks", showSummittedPeaks);

    const apiRes = await fetch(url.toString(), {
        method: "GET",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            // Pass user info via headers for backend auth (especially in dev)
            ...(session?.user?.id ? { "x-user-id": session.user.id } : {}),
            ...(session?.user?.email ? { "x-user-email": session.user.email } : {}),
            ...(session?.user?.name ? { "x-user-name": encodeURIComponent(session.user.name) } : {}),
        },
    });

    if (!apiRes.ok) {
        console.error(await apiRes.text());
        return [];
    }

    const data: Peak[] = await apiRes.json();

    return data;
};

export default searchPeaks;
