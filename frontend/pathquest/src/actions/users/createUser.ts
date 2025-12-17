"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import ServerActionResult from "@/typeDefs/ServerActionResult";
import { StravaCreds } from "@/typeDefs/StravaCreds";
import User from "@/typeDefs/User";
import { revalidatePath } from "next/cache";

const backendUrl = getBackendUrl();

const createUser = async (
    user: {
        id: string | number;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    },
    stravaCreds: StravaCreds
): Promise<ServerActionResult<User>> => {
    if (!user) {
        return {
            success: false,
            error: "Unauthorized",
        };
    }

    const token = await getGoogleIdToken();

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[createUser] No token available - cannot make authenticated request");
        return {
            success: false,
            error: "Authentication token not available",
        };
    }

    const existingRes = await fetch(`${backendUrl}/users/${user.id}`, {
        method: "GET",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (existingRes.ok) {
        const existingUser = await existingRes.json();
        return {
            success: true,
            data: existingUser,
        };
    }

    const apiRes = await fetch(`${backendUrl}/auth/signup`, {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
        console.error("[createUser]", apiRes.status, await apiRes.text());
        return {
            success: false,
            error: "Failed to create user",
        };
    } else {
        const newUser = (await apiRes.json()).user;
        return {
            success: true,
            data: newUser,
        };
    }
};

export default createUser;
