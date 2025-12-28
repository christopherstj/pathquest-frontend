"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
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

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[createUser] Failed to get Google ID token:", err);
        return null;
    });

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[createUser] No token available - cannot make authenticated request");
        return {
            success: false,
            error: "Authentication token not available",
        };
    }

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
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
