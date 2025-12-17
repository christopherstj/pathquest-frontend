"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";

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

    const historicalRes = await fetch(`${backendUrl}/historical-data`, {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
            userId: user.id.toString(),
        }),
    });

    if (!historicalRes.ok) {
        console.error("[processHistoricalData]", historicalRes.status, await historicalRes.text());
        return {
            success: false,
            error: "Failed to process historical data",
        };
    }

    return {
        success: true,
    };
};

export default processHistoricalData;
