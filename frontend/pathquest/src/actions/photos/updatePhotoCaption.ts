"use server";
import getSessionToken from "@/auth/getSessionToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";

const backendUrl = getBackendUrl();

export type UpdatePhotoCaptionParams = {
    photoId: string;
    caption: string | null;
};

export type UpdatePhotoCaptionResult = {
    success: boolean;
    error?: string;
};

const updatePhotoCaption = async (
    params: UpdatePhotoCaptionParams
): Promise<UpdatePhotoCaptionResult> => {
    const session = await useAuth();

    if (!session) {
        return {
            success: false,
            error: "Unauthorized",
        };
    }

    const token = await getSessionToken().catch((err) => {
        console.error("[updatePhotoCaption] Failed to get session token:", err);
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
        await endpoints.updatePhotoCaption(client, {
            photoId: params.photoId,
            caption: params.caption,
        });
        return { success: true };
    } catch (err: any) {
        console.error("[updatePhotoCaption] Error:", err?.bodyText ?? err);
        return {
            success: false,
            error: err?.message ?? "Failed to update photo caption",
        };
    }
};

export default updatePhotoCaption;

