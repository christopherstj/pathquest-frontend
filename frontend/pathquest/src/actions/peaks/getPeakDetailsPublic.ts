"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import Challenge from "@/typeDefs/Challenge";
import Peak from "@/typeDefs/Peak";
import ServerActionResult from "@/typeDefs/ServerActionResult";
import Summit from "@/typeDefs/Summit";

const backendUrl = getBackendUrl();

/**
 * Gets peak details for PUBLIC/STATIC pages only (SEO, metadata, static generation).
 * 
 * This function does NOT use useAuth() or access cookies/headers, making it safe
 * for static generation (ISR) without triggering DYNAMIC_SERVER_USAGE errors.
 * 
 * For authenticated peak details (with user-specific data), use getPeakDetails() instead.
 */
const getPeakDetailsPublic = async (
    peakId: string
): Promise<
    ServerActionResult<{
        peak: Peak;
        publicSummits: Summit[];
        challenges: Challenge[];
    }>
> => {
    // Get token for Google IAM authentication (required at infrastructure level)
    // No user headers - this is public-only data for static generation
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[getPeakDetailsPublic] Failed to get Google ID token:", err);
        return null;
    });

    const apiRes = await fetch(`${backendUrl}/peaks/${peakId}`, {
        method: "GET",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            // No x-user-* headers - this is public-only data
        },
        // Cache for ISR
        next: { revalidate: 86400 },
    });

    if (!apiRes.ok) {
        console.error("[getPeakDetailsPublic]", await apiRes.text());
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

export default getPeakDetailsPublic;

