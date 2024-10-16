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

    const url = search
        ? `${backendUrl}/peaks?page=${page}&perPage=${perPage}&search=${search}`
        : `${backendUrl}/peaks?page=${page}&perPage=${perPage}`;

    const response = await fetch(url, {
        cache: "no-cache",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        console.error(await response.text());
        return [];
    } else {
        return await response.json();
    }
};

export default getPeaks;
