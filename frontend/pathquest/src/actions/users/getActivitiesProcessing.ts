"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import ServerActionResult from "@/typeDefs/ServerActionResult";

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
    const idToken = await getGoogleIdToken().catch((err) => {
        console.error("[getActivitiesProcessing] Failed to get Google ID token:", err);
        return null;
    });

    if (!idToken && process.env.NODE_ENV !== "development") {
        return {
            success: false,
            error: "Authentication token not available",
        };
    }

    const res = await fetch(`${backendUrl}/users/${id}/activities-processing`, {
        method: "GET",
        headers: {
            ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
    });

    if (!res.ok) {
        return {
            success: false,
            error: "Failed to fetch activities processing count",
        };
    }

    const data: { numProcessing: number } = await res.json();

    return { success: true, data: data.numProcessing };
};

export default getActivitiesProcessing;
