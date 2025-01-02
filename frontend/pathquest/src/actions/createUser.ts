"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { revalidatePath } from "next/cache";

const backendUrl = getBackendUrl();

const createUser = async (user?: {
    id: string | number;
    name?: string | null;
    email?: string | null;
    image?: string | null;
}): Promise<{
    success: boolean;
    error?: string;
}> => {
    if (!user) {
        return {
            success: false,
            error: "Unauthorized",
        };
    }

    const token = await getGoogleIdToken();

    const userRes = await fetch(`${backendUrl}/user`, {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            id: user.id,
        }),
    });

    if (!userRes.ok) {
        console.error(await userRes.text());
        return {
            success: false,
            error: "Failed to check user",
        };
    }

    const { userFound } = await userRes.json();

    console.log(userFound);

    if (!userFound) {
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
            return {
                success: false,
                error: "Failed to create user",
            };
        } else {
            revalidatePath(`${backendUrl}/user`);
            return {
                success: true,
            };
        }
    } else {
        return {
            success: true,
        };
    }
};

export default createUser;
