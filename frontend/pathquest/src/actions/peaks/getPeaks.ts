"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import Peak from "@/typeDefs/Peak";

const getPeaks = async (
    page: number,
    perPage: number,
    search?: string
): Promise<Peak[]> => {
    const backendUrl = getBackendUrl();

    const token = await getGoogleIdToken();

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[getPeaks] No token available - cannot make authenticated request");
        return [];
    }

    const url = search
        ? `${backendUrl}/peaks?page=${page}&perPage=${perPage}&search=${search}`
        : `${backendUrl}/peaks?page=${page}&perPage=${perPage}`;

    const response = await fetch(url, {
        cache: "no-cache",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!response.ok) {
        console.error("[getPeaks]", response.status, await response.text());
        return [];
    } else {
        return await response.json();
    }
};

export default getPeaks;
