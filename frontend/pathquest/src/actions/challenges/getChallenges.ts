"use server";

import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import Challenge from "@/typeDefs/Challenge";

const getChallenges = async (
    page: number,
    perPage: number,
    search?: string
): Promise<Challenge[]> => {
    const backendUrl = getBackendUrl();

    const session = await useAuth();
    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getGoogleIdToken().catch(() => null);

    const url = search
        ? `${backendUrl}/challenges?page=${page}&perPage=${perPage}&search=${search}`
        : `${backendUrl}/challenges?page=${page}&perPage=${perPage}`;

    const response = await fetch(url, {
        cache: "no-cache",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
