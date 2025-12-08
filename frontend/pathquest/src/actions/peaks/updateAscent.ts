"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import AscentDetail from "@/typeDefs/AscentDetail";

const backendUrl = getBackendUrl();

const updateAscent = async (
    ascent: AscentDetail
): Promise<{
    success: boolean;
    error?: string;
}> => {
    const session = await useAuth();

    if (!session) {
        return {
            success: false,
            error: "Unauthorized",
        };
    }

    const token = await getGoogleIdToken();

    const userId = session.user.id;

    const url = `${backendUrl}/peaks/ascent/${ascent.id}`;

    const res = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ascent }),
    });

    if (!res.ok) {
        console.error(await res.text());
        return {
            success: false,
            error: res.statusText,
        };
    }

    return {
        success: true,
    };
};

export default updateAscent;
