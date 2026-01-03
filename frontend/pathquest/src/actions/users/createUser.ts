"use server";
import getSessionToken from "@/auth/getSessionToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { ServerActionResult, StravaCreds, User } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

const createUser = async (
    user: {
        id: string | number;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    },
    stravaCreds: StravaCreds
): Promise<ServerActionResult<User>> => {
    if (!user) {
        return {
            success: false,
            error: "Unauthorized",
        };
    }

    // Try to get session token if available, but don't require it
    // The /api/auth/signup endpoint is PUBLIC and doesn't require authentication
    // During initial signup, there's no session yet so token will be null - that's expected
    const token = await getSessionToken().catch((err) => {
        // This is expected during signup - user isn't authenticated yet
        console.log("[createUser] No session token available (expected during signup)");
        return null;
    });

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            // Only include auth header if we have a token (for checking existing users)
            if (token) headers.Authorization = `Bearer ${token}`;
            return headers;
        },
    });

    // Check if user already exists
    try {
        const existingUser = await endpoints.getUser(client, user.id.toString(), { cache: "no-cache" } as any);
        return {
            success: true,
            data: existingUser,
        };
    } catch (err: any) {
        // User doesn't exist, create them
        if (err?.statusCode !== 404) {
            console.error("[createUser] Error checking existing user:", err?.bodyText ?? err);
        }
    }

    try {
        const result = await endpoints.createUser(client, {
            id: user.id,
            name: user.name,
            email: user.email,
            pic: user.image,
            stravaCreds,
        }, { cache: "no-cache" } as any);
        return {
            success: true,
            data: result.user,
        };
    } catch (err: any) {
        console.error("[createUser]", err?.bodyText ?? err);
        return {
            success: false,
            error: "Failed to create user",
        };
    }
};

export default createUser;
