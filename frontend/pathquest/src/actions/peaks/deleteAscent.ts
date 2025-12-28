"use server";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { createApiClient, endpoints } from "@pathquest/shared/api";

const backendUrl = getBackendUrl();

const deleteAscent = async (
    ascentId: string
): Promise<{ success: boolean; error?: string }> => {
    const session = await useAuth();

    if (!session) {
        return { success: false, error: "Unauthorized" };
    }

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[deleteAscent] Failed to get Google ID token:", err);
        return null;
    });
    const userId = session.user?.id;

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            if (process.env.NODE_ENV === "development" && userId) headers["x-user-id"] = userId;
            return headers;
        },
    });

    try {
        await endpoints.deleteAscent(client, ascentId);
    } catch (err: any) {
        const bodyText = err?.bodyText ? String(err.bodyText) : undefined;
        console.error(bodyText ?? err);
        return { success: false, error: bodyText ?? "Failed to delete ascent" };
    }

    return { success: true };
};

export default deleteAscent;
