"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { ServerActionResult } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

export type ImportStatus = {
    totalActivities: number;
    processedActivities: number;
    pendingActivities: number;
    skippedActivities: number;
    summitsFound: number;
    percentComplete: number;
    estimatedHoursRemaining: number | null;
    status: "not_started" | "processing" | "complete";
    message: string;
};

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

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (idToken) headers.Authorization = `Bearer ${idToken}`;
            return headers;
        },
    });

    try {
        const data = await endpoints.getImportStatus(client, id, { cache: "no-store" } as any);
        return { success: true, data };
    } catch (err: any) {
        console.error("[getImportStatus]", err?.bodyText ?? err);
        return {
            success: false,
            error: "Failed to fetch import status",
        };
    }
};

export default getImportStatus;

