"use server";
import getSessionToken from "@/auth/getSessionToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { AscentDetail } from "@pathquest/shared/types";

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

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getSessionToken().catch((err) => {
        console.error("[updateAscent] Failed to get Google ID token:", err);
        return null;
    });
    const userId = session.user.id;

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            return headers;
        },
    });

    try {
        await endpoints.updateAscent(client, ascent);
    } catch (err: any) {
        console.error(err?.bodyText ?? err);
        return { success: false, error: err?.message ?? "Failed to update ascent" };
    }

    return {
        success: true,
    };
};

export default updateAscent;
