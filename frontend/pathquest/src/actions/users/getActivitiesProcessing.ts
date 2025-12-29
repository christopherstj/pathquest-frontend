"use server";
import getSessionToken from "@/auth/getSessionToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { ServerActionResult } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

const getActivitiesProcessing = async (): Promise<
    ServerActionResult<number>
> => {
    const session = await useAuth();

    const id = session?.user?.id;

    if (!id) {
        return { success: false, error: "User not authenticated" };
    }

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const idToken = await getSessionToken().catch((err) => {
        console.error("[getActivitiesProcessing] Failed to get Google ID token:", err);
        return null;
    });

    if (!idToken && process.env.NODE_ENV !== "development") {
        return {
            success: false,
            error: "Authentication token not available",
        };
    }

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (idToken) headers.Authorization = `Bearer ${idToken}`;
            return headers;
        },
    });

    try {
        const data = await endpoints.getActivitiesProcessing(client, id);
        return { success: true, data: data.numProcessing };
    } catch (err: any) {
        console.error("[getActivitiesProcessing]", err?.bodyText ?? err);
        return {
            success: false,
            error: "Failed to fetch activities processing count",
        };
    }
};

export default getActivitiesProcessing;
