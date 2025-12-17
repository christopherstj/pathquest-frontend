"use server";
import getAuthHeaders from "@/helpers/getAuthHeaders";
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
    const { headers, session } = await getAuthHeaders();

    const id = session?.user?.id;

    const requestedUserId = userId || id;

    if (!requestedUserId) {
        return {
            userFound: false,
            error: "No user id found",
        };
    }

    const apiRes = await fetch(`${backendUrl}/users/${requestedUserId}`, {
        method: "GET",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
            ...headers,
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

        return {
            userFound: true,
            user,
        };
    }
};

export default getUser;
