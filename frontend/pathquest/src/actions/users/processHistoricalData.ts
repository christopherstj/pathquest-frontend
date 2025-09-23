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

    const token = await getGoogleIdToken();

    const historicalRes = await fetch(`${backendUrl}/historical-data`, {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            userId: user.id.toString(),
        }),
    });

    if (!historicalRes.ok) {
        console.error(await historicalRes.text());
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
