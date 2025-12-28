"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createApiClient, endpoints } from "@pathquest/shared/api";

const backendUrl = getBackendUrl();

const deleteActivity = async (activityId: string) => {
    const session = await useAuth();

    if (!session) {
        return;
    }

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[deleteActivity] Failed to get Google ID token:", err);
        return null;
    });

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[deleteActivity] No token available - cannot make authenticated request");
        return;
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
        await endpoints.deleteActivity(client, activityId);
    } catch (err: any) {
        console.error("[deleteActivity]", err?.bodyText ?? err);
        return;
    }

    revalidatePath("/app/activities");
    redirect("/app/activities");
};

export default deleteActivity;
