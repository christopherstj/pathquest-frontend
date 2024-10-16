"use server";
import getBackendUrl from "@/helpers/getBackendUrl";
import Peak from "@/typeDefs/Peak";

const getPeaks = async (
    page: number,
    perPage: number,
    search?: string
): Promise<Peak[]> => {
    const backendUrl = getBackendUrl();
    const url = search
        ? `${backendUrl}/peaks?page=${page}&perPage=${perPage}&search=${search}`
        : `${backendUrl}/peaks?page=${page}&perPage=${perPage}`;

    console.log(url);

    const response = await fetch(url, {
        cache: "no-cache",
    });

    if (!response.ok) {
        console.error(await response.text());
        return [];
    } else {
        return await response.json();
    }
};

export default getPeaks;
