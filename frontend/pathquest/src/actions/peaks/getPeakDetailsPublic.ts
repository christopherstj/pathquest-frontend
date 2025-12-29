"use server";
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
 * No authentication is needed - the API endpoint is public.
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
    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => ({}), // No auth needed for public endpoint
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
