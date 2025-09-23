"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import ServerActionResult from "@/typeDefs/ServerActionResult";
import { User } from "@/typeDefs/User";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const backendUrl = getBackendUrl();

const createUser = async (
    user: {
        id: string | number;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    },
    stravaCreds: {
        accessToken?: string;
        refreshToken?: string;
        providerAccountId: string;
        expiresAt?: number;
    }
): Promise<ServerActionResult<User>> => {
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

    const { userFound, user: userObject } = await userRes.json();

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
                stravaCreds,
            }),
        });

        if (!apiRes.ok) {
            console.error(await apiRes.text());
            return {
                success: false,
                error: "Failed to create user",
            };
        } else {
            const newUser = (await apiRes.json()).user;
            revalidatePath(`${backendUrl}/user`);
            return {
                success: true,
                data: newUser,
            };
        }
    } else {
        return {
            success: true,
            data: userObject,
        };
    }
};

export default createUser;
