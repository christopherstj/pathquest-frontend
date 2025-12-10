"use server";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import getGoogleIdToken from "@/auth/getGoogleIdToken";

const backendUrl = getBackendUrl();

const deleteAscent = async (
    ascentId: string
): Promise<{ success: boolean; error?: string }> => {
    const session = await useAuth();

    if (!session) {
        return { success: false, error: "Unauthorized" };
    }

    const token = await getGoogleIdToken().catch(() => null);
    const userId = session.user?.id;

    const url = `${backendUrl}/peaks/ascent/${ascentId}`;

    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(process.env.NODE_ENV === "development" && userId
                ? { "x-user-id": userId }
                : {}),
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(errorText);
        return { success: false, error: errorText };
    }

    return { success: true };
};

export default deleteAscent;
