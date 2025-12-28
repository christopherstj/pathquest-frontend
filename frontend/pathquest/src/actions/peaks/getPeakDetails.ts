"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { Activity, Challenge, Peak, ServerActionResult, Summit } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

/**
 * Gets peak details with user-specific data (authenticated).
 * 
 * NOTE: This function uses useAuth() which accesses cookies/headers.
 * Do NOT use this during static generation (ISR) - use getPeakDetailsPublic() instead.
 * This is for runtime use in overlays and client components.
 */
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
    // Get session for user-specific data (activities, favorites, etc.)
    const session = await useAuth();
    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getGoogleIdToken().catch(() => null);

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            if (session?.user?.id) headers["x-user-id"] = session.user.id;
            if (session?.user?.email) headers["x-user-email"] = session.user.email;
            if (session?.user?.name) headers["x-user-name"] = encodeURIComponent(session.user.name);
            return headers;
        },
    });

    try {
        const data = await endpoints.getPeakDetails(client, peakId);
        return {
            success: true,
            data,
        };
    } catch (err: any) {
        console.error("Error fetching peak details:", err?.bodyText ?? err);
        return {
            success: false,
            error: "Failed to fetch peak details",
        };
    }
};

export default getPeakDetails;
