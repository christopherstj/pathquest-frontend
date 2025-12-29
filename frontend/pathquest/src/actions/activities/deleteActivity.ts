"use server";
import getSessionToken from "@/auth/getSessionToken";
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

    // Get the NextAuth session token from cookies
    const token = await getSessionToken();

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
