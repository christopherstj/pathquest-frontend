"use server";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { PeakPhotosResponse } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

export type GetPeakPhotosParams = {
    peakId: string;
    /** ISO timestamp cursor for pagination. Omit for first page. */
    cursor?: string;
    /** Max photos per page (default 20, max 100). */
    limit?: number;
};

export type GetPeakPhotosResult = {
    success: boolean;
    data?: PeakPhotosResponse;
    error?: string;
};

/**
 * Get public photos for a peak (community gallery) with cursor-based pagination.
 * No authentication required - returns only public photos.
 */
const getPeakPhotos = async (
    params: GetPeakPhotosParams
): Promise<GetPeakPhotosResult> => {
    const client = createApiClient({
        baseUrl: backendUrl,
    });

    try {
        const data = await endpoints.getPeakPhotos(client, {
            peakId: params.peakId,
            cursor: params.cursor,
            limit: params.limit,
        });
        return { success: true, data };
    } catch (err: any) {
        console.error("[getPeakPhotos] Error:", err?.bodyText ?? err);
        return {
            success: false,
            error: err?.message ?? "Failed to get peak photos",
        };
    }
};

export default getPeakPhotos;

