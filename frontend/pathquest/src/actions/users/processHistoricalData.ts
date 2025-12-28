"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";

const backendUrl = getBackendUrl();

const processHistoricalData = async (): Promise<{
    success: boolean;
    error?: string;
}> => {
    const session = await useAuth();

    const user = session?.user;

    if (!user) {
        return {
            success: false,
            error: "Unauthorized",
        };
    }

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[processHistoricalData] Failed to get Google ID token:", err);
        return null;
    });

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[processHistoricalData] No token available - cannot make authenticated request");
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
        await endpoints.processHistoricalData(client, user.id.toString(), { cache: "no-cache" } as any);
        return {
            success: true,
        };
    } catch (err: any) {
        console.error("[processHistoricalData]", err?.bodyText ?? err);
        return {
            success: false,
            error: "Failed to process historical data",
        };
    }
};

export default processHistoricalData;
