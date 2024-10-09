"use server";

import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";

const testApi = async () => {
    const session = await useAuth();

    if (!session) {
        return null;
    }

    const token = getGoogleIdToken();

    const apiRes = await fetch("https://pathquest-api.app/", {
        method: "GET",
        cache: "no-cache",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await apiRes.json();

    return data;
};

export default testApi;
