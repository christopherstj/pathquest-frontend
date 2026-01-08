"use server";
import getSessionToken from "@/auth/getSessionToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { SummitType, PhotoUploadUrlResponse } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

export type GetPhotoUploadUrlParams = {
    summitType: SummitType;
    summitId: string;
    filename?: string;
};

export type GetPhotoUploadUrlResult = {
    success: boolean;
    data?: PhotoUploadUrlResponse;
    error?: string;
};

const getPhotoUploadUrl = async (
    params: GetPhotoUploadUrlParams
): Promise<GetPhotoUploadUrlResult> => {
    const session = await useAuth();

    if (!session) {
        return {
            success: false,
            error: "Unauthorized",
        };
    }

    const token = await getSessionToken().catch((err) => {
        console.error("[getPhotoUploadUrl] Failed to get session token:", err);
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
        const data = await endpoints.getPhotoUploadUrl(client, {
            summitType: params.summitType,
            summitId: params.summitId,
            contentType: "image/jpeg",
            filename: params.filename,
        });
        return { success: true, data };
    } catch (err: any) {
        console.error("[getPhotoUploadUrl] Error:", err?.bodyText ?? err);
        return {
            success: false,
            error: err?.message ?? "Failed to get upload URL",
        };
    }
};

export default getPhotoUploadUrl;

