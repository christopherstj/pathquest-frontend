"use server";
import getSessionToken from "@/auth/getSessionToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";

const backendUrl = getBackendUrl();

export type DeletePhotoResult = {
    success: boolean;
    error?: string;
};

const deletePhoto = async (photoId: string): Promise<DeletePhotoResult> => {
    const session = await useAuth();

    if (!session) {
        return {
            success: false,
            error: "Unauthorized",
        };
    }

    const token = await getSessionToken().catch((err) => {
        console.error("[deletePhoto] Failed to get session token:", err);
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
        await endpoints.deletePhoto(client, photoId);
        return { success: true };
    } catch (err: any) {
        console.error("[deletePhoto] Error:", err?.bodyText ?? err);
        return {
            success: false,
            error: err?.message ?? "Failed to delete photo",
        };
    }
};

export default deletePhoto;

