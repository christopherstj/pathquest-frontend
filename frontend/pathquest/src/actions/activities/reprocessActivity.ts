"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { revalidatePath } from "next/cache";

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

    const token = await getGoogleIdToken();

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[reprocessActivity] No token available - cannot make authenticated request");
        return {
            success: false,
            error: "Authentication token not available",
        };
    }

    const res = await fetch(`${backendUrl}/activities/reprocess`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
            activityId,
        }),
    });

    if (!res.ok) {
        console.error("[reprocessActivity]", res.status, await res.text());
        return {
            success: false,
            error: res.statusText,
        };
    }

    revalidatePath(`/activities/${activityId}`);

    return {
        success: true,
    };
};

export default reprocessActivity;
