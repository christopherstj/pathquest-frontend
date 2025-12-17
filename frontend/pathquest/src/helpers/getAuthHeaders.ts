"use server";

import { useAuth } from "@/auth/useAuth";
import getGoogleIdToken from "@/auth/getGoogleIdToken";

/**
 * Gets auth headers for API requests.
 * Always includes both header-based auth (x-user-* headers) and Bearer token.
 * The backend will use whichever is available - headers take priority.
 * This ensures auth works in both development (headers) and production (token).
 * 
 * Safe for static generation - will return null session during build time.
 */
const getAuthHeaders = async (): Promise<{
    headers: Record<string, string>;
    session: Awaited<ReturnType<typeof useAuth>>;
}> => {
    // Get session for user identity headers
    // NOTE: This function should only be called at runtime, NOT during static generation
    // For static pages (ISR), use the "Public" variants of actions instead
    const session = await useAuth();
    // Always generate token for Google IAM authentication (required at infrastructure level)
    // User identity is passed via x-user-* headers for application-level auth
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[getAuthHeaders] Failed to get Google ID token:", err);
        return null;
    });

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
            // URL-encode name to handle emojis and non-ASCII characters (HTTP headers must be ASCII)
            headers["x-user-name"] = encodeURIComponent(session.user.name);
        }
    }

    // Also include Bearer token (used in production)

    console.log("[getAuthHeaders] Token is null:", token === null);
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    } else if (process.env.NODE_ENV !== "development") {
        // Log warning if token generation failed in production (Google IAM will reject requests)
        console.warn("[getAuthHeaders] No token available in production - API requests will fail Google IAM authentication");
    }

    return { headers, session };
};

export default getAuthHeaders;





