"use server";
import getAuthHeaders from "@/helpers/getAuthHeaders";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { ServerActionResult } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

interface UpdateUserData {
    name?: string;
    email?: string;
    pic?: string;
    city?: string;
    state?: string;
    country?: string;
    location_coords?: [number, number] | null;
    update_description?: boolean;
    is_public?: boolean;
}

const updateUser = async (updateData: UpdateUserData): Promise<ServerActionResult> => {
    const { headers, session } = await getAuthHeaders();

    const id = session?.user?.id;

    if (!id) {
        return {
            success: false,
            error: "Not authenticated",
        };
    }

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => headers,
    });

    try {
        await endpoints.updateUser(client, id, updateData, { cache: "no-cache" } as any);
        return {
            success: true,
        };
    } catch (err: any) {
        console.error("[updateUser]", err?.bodyText ?? err);
        return {
            success: false,
            error: err?.statusCode === 404 ? "User not found" : "Error updating user",
        };
    }
};

export default updateUser;
