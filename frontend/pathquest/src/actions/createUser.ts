"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { User } from "@/typeDefs/User";

const backendUrl = getBackendUrl();

const createUser = async (): Promise<User | null> => {
    const session = await useAuth();

    const user = session?.user;

    if (!user) {
        return null;
    }

    const token = await getGoogleIdToken();

    const apiRes = await fetch(`${backendUrl}/signup`, {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            id: user.id.toString(),
            name: user.name,
            email: null,
            pic: user.image ?? null,
        }),
    });

    if (!apiRes.ok) {
        console.error(await apiRes.text());
        return null;
    } else {
        return await apiRes.json();
    }
};

export default createUser;
