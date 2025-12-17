"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import Activity from "@/typeDefs/Activity";
import Challenge from "@/typeDefs/Challenge";
import Peak from "@/typeDefs/Peak";
import ServerActionResult from "@/typeDefs/ServerActionResult";
import Summit from "@/typeDefs/Summit";

const backendUrl = getBackendUrl();

const getPeakDetails = async (
    peakId: string
): Promise<
    ServerActionResult<{
        peak: Peak;
        publicSummits: Summit[];
        challenges: Challenge[];
        activities?: Activity[];
    }>
> => {
    // Try to get session, but don't fail during static generation (cookies/headers not available)
    // During static generation, getServerSession() will throw DYNAMIC_SERVER_USAGE
    // We catch it and return null, allowing static pages to be generated without user context
    let session = null;
    try {
        session = await useAuth();
    } catch (error: any) {
        // During static generation, useAuth() throws DYNAMIC_SERVER_USAGE - that's expected
        // We'll just use public data without user headers
        if (error?.digest !== "DYNAMIC_SERVER_USAGE") {
            // Only log if it's not the expected static generation error
            console.warn("[getPeakDetails] Failed to get session:", error);
        }
        session = null;
    }
    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getGoogleIdToken().catch(() => null);

    const apiRes = await fetch(`${backendUrl}/peaks/${peakId}`, {
        method: "GET",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            // Pass user info via headers for backend auth (especially in dev)
            ...(session?.user?.id ? { "x-user-id": session.user.id } : {}),
            ...(session?.user?.email ? { "x-user-email": session.user.email } : {}),
            ...(session?.user?.name ? { "x-user-name": session.user.name } : {}),
        },
    });

    if (!apiRes.ok) {
        console.error(await apiRes.text());
        return {
            success: false,
            error: "Failed to fetch peak details",
        };
    }

    const data = await apiRes.json();

    return {
        success: true,
        data,
    };
};

export default getPeakDetails;
