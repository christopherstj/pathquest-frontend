"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { revalidatePath } from "next/cache";
import { createApiClient, endpoints } from "@pathquest/shared/api";

const backendUrl = getBackendUrl();

const reprocessActivity = async (
    activityId: string
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
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[reprocessActivity] Failed to get Google ID token:", err);
        return null;
    });

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[reprocessActivity] No token available - cannot make authenticated request");
        return {
            success: false,
            error: "Authentication token not available",
        };
    }

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            return headers;
        },
    });

    try {
        await endpoints.reprocessActivity(client, activityId);
    } catch (err: any) {
        console.error("[reprocessActivity]", err?.bodyText ?? err);
        return { success: false, error: err?.message ?? "Failed to reprocess activity" };
    }

    revalidatePath(`/activities/${activityId}`);

    return {
        success: true,
    };
};

export default reprocessActivity;
