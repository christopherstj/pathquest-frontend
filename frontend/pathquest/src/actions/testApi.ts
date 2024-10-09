"use server";

import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";

const testApi = async () => {
    const session = await useAuth();

    if (!session) {
        return null;
    }

    const token = await getGoogleIdToken();

    const apiRes = await fetch("https://pathquest-api.app/", {
        method: "GET",
        cache: "no-cache",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!apiRes.ok) {
        return null;
    }

    return await apiRes.json();
};

export default testApi;
