"use server";

import { useAuth } from "@/auth/useAuth";
import getSessionToken from "@/auth/getSessionToken";

/**
 * Gets auth headers for API requests.
 * 
 * Uses the NextAuth session JWT token for authentication.
 * The backend verifies this token using the shared JWT_SECRET.
 * 
 * Safe for static generation - will return null session during build time.
 */
const getAuthHeaders = async (): Promise<{
    headers: Record<string, string>;
    session: Awaited<ReturnType<typeof useAuth>>;
}> => {
    // Get session for user context (used by caller, not for auth headers)
    const session = await useAuth();
    
    // Get the NextAuth session token from cookies
    const token = await getSessionToken();

    const headers: Record<string, string> = {};

    // Include Bearer token if available
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    } else if (process.env.NODE_ENV !== "development") {
        // Log warning if no token in production
        console.warn("[getAuthHeaders] No session token available - user may not be authenticated");
    }

    return { headers, session };
};

export default getAuthHeaders;
