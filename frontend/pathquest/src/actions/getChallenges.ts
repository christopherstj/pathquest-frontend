"use server";

import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import Challenge from "@/typeDefs/Challenge";

const getChallenges = async (
    page: number,
    perPage: number,
    search?: string
): Promise<Challenge[]> => {
    const backendUrl = getBackendUrl();

    const token = await getGoogleIdToken();

    const url = search
        ? `${backendUrl}/challenges?page=${page}&perPage=${perPage}&search=${search}`
        : `${backendUrl}/challenges?page=${page}&perPage=${perPage}`;

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

export default getChallenges;
