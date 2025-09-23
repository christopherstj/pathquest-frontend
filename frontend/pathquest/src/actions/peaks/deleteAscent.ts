"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";

const backendUrl = getBackendUrl();

const deleteAscent = async (
    ascentId: string
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

    const userId = session.user.id;

    const token = await getGoogleIdToken();

    const res = await fetch(
        `${backendUrl}/peaks/ascent/${ascentId}?userId=${userId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

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

export default deleteAscent;
