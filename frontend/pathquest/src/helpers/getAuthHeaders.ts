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
        if (session.user.id) {
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

    console.log("[getAuthHeaders] Token is null:", token === null);
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    } else if (session && process.env.NODE_ENV !== "development") {
        // Log warning if we have a session but no token in production
        console.warn("[getAuthHeaders] Session present but no token available - API requests may fail");
    }

    return { headers, session };
};

export default getAuthHeaders;





