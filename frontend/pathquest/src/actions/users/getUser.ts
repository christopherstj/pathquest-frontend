"use server";
import getAuthHeaders from "@/helpers/getAuthHeaders";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { User } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

const getUser = async (
    userId: string | null = null
): Promise<{
    userFound: boolean;
    user?: User;
    error?: string;
}> => {
    const { headers, session } = await getAuthHeaders();

    const id = session?.user?.id;

    const requestedUserId = userId || id;

    if (!requestedUserId) {
        return {
            userFound: false,
            error: "No user id found",
        };
    }

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => headers,
    });

    try {
        const user = await endpoints.getUser(client, requestedUserId, { cache: "no-cache" } as any);
        return {
            userFound: true,
            user,
        };
    } catch (err: any) {
        console.error("[getUser]", err?.bodyText ?? err);
        return {
            userFound: false,
            error: err?.statusCode === 404 ? "User not found" : "Error fetching user",
        };
    }
};

export default getUser;
