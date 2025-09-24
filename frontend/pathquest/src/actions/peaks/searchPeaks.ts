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

    const userId = session?.user.id ?? "";

    const token = await getGoogleIdToken();

    const url = new URL(`${backendUrl}/peaks/search`);

    if (northWestLat) url.searchParams.append("northWestLat", northWestLat);
    if (northWestLng) url.searchParams.append("northWestLng", northWestLng);
    if (southEastLat) url.searchParams.append("southEastLat", southEastLat);
    if (southEastLng) url.searchParams.append("southEastLng", southEastLng);
    if (search) url.searchParams.append("search", search);
    if (page) url.searchParams.append("page", page);
    if (perPage) url.searchParams.append("perPage", perPage);
    if (userId) url.searchParams.append("userId", userId);
    if (showSummittedPeaks)
        url.searchParams.append("showSummittedPeaks", showSummittedPeaks);

    const apiRes = await fetch(url.toString(), {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
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
