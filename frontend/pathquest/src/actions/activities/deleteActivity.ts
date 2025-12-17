"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

    const url = `${backendUrl}/activities/${activityId}`;

    const res = await fetch(url, {
        method: "DELETE",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!res.ok) {
        console.error("[deleteActivity]", res.status, await res.text());
        return;
    }

    revalidatePath("/app/activities");
    redirect("/app/activities");
};

export default deleteActivity;
