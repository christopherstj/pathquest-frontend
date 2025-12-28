"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { Challenge, Peak, ServerActionResult, Summit } from "@pathquest/shared/types";

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
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[getPeakDetailsPublic] Failed to get Google ID token:", err);
        return null;
    });

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            return headers;
        },
    });

    let data: { peak: Peak; publicSummits: Summit[]; challenges: Challenge[] };
    try {
        data = await endpoints.getPeakDetailsPublic(
            client,
            peakId,
            // Next.js-only fetch options for ISR caching.
            { next: { revalidate: 86400 } } as any
        );
    } catch (err: any) {
        console.error("[getPeakDetailsPublic]", err?.bodyText ?? err);
        return { success: false, error: "Failed to fetch peak details" };
    }

    return {
        success: true,
        data,
    };
};

export default getPeakDetailsPublic;

