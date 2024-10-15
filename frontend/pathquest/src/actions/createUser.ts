"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { User } from "@/typeDefs/User";

const backendUrl = getBackendUrl();

const createUser = async (): Promise<{
    success: boolean;
    error?: string;
}> => {
    const session = await useAuth();

    const user = session?.user;

    if (!user) {
        return {
            success: false,
            error: "Unauthorized",
        };
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
        return {
            success: false,
            error: "Failed to create user",
        };
    } else {
        const historicalRes = await fetch(`${backendUrl}/historical-data`, {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                userId: user.id.toString(),
            }),
        });

        if (!historicalRes.ok) {
            console.error(await historicalRes.text());
            return {
                success: false,
                error: "Failed to trigger historical data",
            };
        } else {
            return {
                success: true,
            };
        }
    }
};

export default createUser;
