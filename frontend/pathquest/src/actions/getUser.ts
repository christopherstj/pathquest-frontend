"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";

const backendUrl = getBackendUrl();

const getUser = async (): Promise<{
    userFound: boolean;
    user?: any;
    error?: string;
}> => {
    const session = await useAuth();

    const id = session?.user?.id;

    if (!id) {
        return {
            userFound: false,
            error: "No user id found",
        };
    }

    const token = await getGoogleIdToken();

    const apiRes = await fetch(`${backendUrl}/user`, {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            id,
        }),
    });

    if (!apiRes.ok) {
        console.error(await apiRes.text());
        return {
            userFound: false,
            error: apiRes.statusText,
        };
    } else {
        return await apiRes.json();
    }
};

export default getUser;
