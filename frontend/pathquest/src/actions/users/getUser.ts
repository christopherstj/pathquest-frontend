"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import User from "@/typeDefs/User";

const backendUrl = getBackendUrl();

const getUser = async (
    userId: string | null = null
): Promise<{
    userFound: boolean;
    user?: User;
    error?: string;
}> => {
    const session = await useAuth();

    const id = session?.user?.id;

    const requestedUserId = userId || id;

    if (!requestedUserId) {
        return {
            userFound: false,
            error: "No user id found",
        };
    }

    const token = session ? await getGoogleIdToken() : null;

    const apiRes = await fetch(`${backendUrl}/users/${requestedUserId}`, {
        method: "GET",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!apiRes.ok) {
        console.error(await apiRes.text());
        return {
            userFound: false,
            error: apiRes.statusText,
        };
    } else {
        const user: User = await apiRes.json();

        console.log("Fetched user:", user);

        return {
            userFound: true,
            user,
        };
    }
};

export default getUser;
