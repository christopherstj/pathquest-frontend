"use server";
import getSessionToken from "@/auth/getSessionToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { SummitType, SummitPhotosResponse } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

export type GetSummitPhotosParams = {
    summitType: SummitType;
    summitId: string;
};

export type GetSummitPhotosResult = {
    success: boolean;
    data?: SummitPhotosResponse;
    error?: string;
};

const getSummitPhotos = async (
    params: GetSummitPhotosParams
): Promise<GetSummitPhotosResult> => {
    const session = await useAuth();

    if (!session) {
        return {
            success: false,
            error: "Unauthorized",
        };
    }

    const token = await getSessionToken().catch((err) => {
        console.error("[getSummitPhotos] Failed to get session token:", err);
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

    try {
        const data = await endpoints.getSummitPhotos(client, {
            summitType: params.summitType,
            summitId: params.summitId,
        });
        return { success: true, data };
    } catch (err: any) {
        console.error("[getSummitPhotos] Error:", err?.bodyText ?? err);
        return {
            success: false,
            error: err?.message ?? "Failed to get summit photos",
        };
    }
};

export default getSummitPhotos;

