"use server";
import getSessionToken from "@/auth/getSessionToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { PhotoCompleteResponse } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

export type CompletePhotoUploadParams = {
    photoId: string;
    width?: number;
    height?: number;
    takenAt?: string;
};

export type CompletePhotoUploadResult = {
    success: boolean;
    data?: PhotoCompleteResponse;
    error?: string;
};

const completePhotoUpload = async (
    params: CompletePhotoUploadParams
): Promise<CompletePhotoUploadResult> => {
    const session = await useAuth();

    if (!session) {
        return {
            success: false,
            error: "Unauthorized",
        };
    }

    const token = await getSessionToken().catch((err) => {
        console.error("[completePhotoUpload] Failed to get session token:", err);
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
        const data = await endpoints.completePhotoUpload(client, {
            photoId: params.photoId,
            width: params.width,
            height: params.height,
            takenAt: params.takenAt,
        });
        return { success: true, data };
    } catch (err: any) {
        console.error("[completePhotoUpload] Error:", err?.bodyText ?? err);
        return {
            success: false,
            error: err?.message ?? "Failed to complete photo upload",
        };
    }
};

export default completePhotoUpload;

