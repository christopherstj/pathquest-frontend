"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { User } from "@/typeDefs/User";
import { redirect } from "next/navigation";

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

    const token = await getGoogleIdToken();

    const apiRes = await fetch(
        `${backendUrl}/user/${requestedUserId}?requestingUserId=${id}`,
        {
            method: "GET",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );

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
