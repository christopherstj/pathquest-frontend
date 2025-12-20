"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import ServerActionResult from "@/typeDefs/ServerActionResult";

const backendUrl = getBackendUrl();

export interface ImportStatus {
    totalActivities: number;
    processedActivities: number;
    pendingActivities: number;
    skippedActivities: number;
    summitsFound: number;
    percentComplete: number;
    estimatedHoursRemaining: number | null;
    status: "not_started" | "processing" | "complete";
    message: string;
}

const getImportStatus = async (): Promise<ServerActionResult<ImportStatus>> => {
    const session = await useAuth();

    const id = session?.user?.id;

    if (!id) {
        return { success: false, error: "User not authenticated" };
    }

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const idToken = await getGoogleIdToken().catch((err) => {
        console.error("[getImportStatus] Failed to get Google ID token:", err);
        return null;
    });

    if (!idToken && process.env.NODE_ENV !== "development") {
        return {
            success: false,
            error: "Authentication token not available",
        };
    }

    const res = await fetch(`${backendUrl}/users/${id}/import-status`, {
        method: "GET",
        headers: {
            ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        cache: "no-store",
    });

    if (!res.ok) {
        return {
            success: false,
            error: "Failed to fetch import status",
        };
    }

    const data: ImportStatus = await res.json();

    return { success: true, data };
};

export default getImportStatus;

