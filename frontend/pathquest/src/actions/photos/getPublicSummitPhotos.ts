"use server";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { SummitType, PublicSummitPhotosResponse } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

export type GetPublicSummitPhotosParams = {
    summitType: SummitType;
    summitId: string;
    limit?: number;
};

export type GetPublicSummitPhotosResult = {
    success: boolean;
    data?: PublicSummitPhotosResponse;
    error?: string;
};

/**
 * Get public photos for a specific summit (community gallery).
 * No authentication required - returns only photos from public summits by public users.
 */
const getPublicSummitPhotos = async (
    params: GetPublicSummitPhotosParams
): Promise<GetPublicSummitPhotosResult> => {
    const client = createApiClient({
        baseUrl: backendUrl,
    });

    try {
        const data = await endpoints.getPublicSummitPhotos(client, {
            summitType: params.summitType,
            summitId: params.summitId,
            limit: params.limit,
        });
        return { success: true, data };
    } catch (err: any) {
        console.error("[getPublicSummitPhotos] Error:", err?.bodyText ?? err);
        return {
            success: false,
            error: err?.message ?? "Failed to get public summit photos",
        };
    }
};

export default getPublicSummitPhotos;

