"use server";

import { useAuth } from "@/auth/useAuth";
import getGoogleIdToken from "@/auth/getGoogleIdToken";

/**
 * Gets auth headers for API requests.
 * Always includes both header-based auth (x-user-* headers) and Bearer token.
 * The backend will use whichever is available - headers take priority.
 * This ensures auth works in both development (headers) and production (token).
 */
const getAuthHeaders = async (): Promise<{
    headers: Record<string, string>;
    session: Awaited<ReturnType<typeof useAuth>>;
}> => {
    const session = await useAuth();
    const token = session ? await getGoogleIdToken() : null;

    const headers: Record<string, string> = {};

    if (session?.user) {
        // Always include header-based auth (works in dev, ignored in prod if token present)
        // @ts-expect-error - id is added in session callback
        if (session.user.id) {
            // @ts-expect-error - id is added in session callback
            headers["x-user-id"] = session.user.id;
        }
        if (session.user.email) {
            headers["x-user-email"] = session.user.email;
        }
        if (session.user.name) {
            headers["x-user-name"] = session.user.name;
        }
    }

    // Also include Bearer token (used in production)
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    return { headers, session };
};

export default getAuthHeaders;





