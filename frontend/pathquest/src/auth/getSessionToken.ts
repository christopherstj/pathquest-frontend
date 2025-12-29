"use server";

import { cookies } from "next/headers";

/**
 * Gets the NextAuth session token from cookies.
 * 
 * NextAuth stores the JWT session token in a cookie:
 * - Production (HTTPS): `__Secure-next-auth.session-token`
 * - Development (HTTP): `next-auth.session-token`
 * 
 * This token is verified by pathquest-api using the shared JWT_SECRET.
 */
const getSessionToken = async (): Promise<string | null> => {
    const cookieStore = await cookies();
    
    // Try secure cookie first (production/HTTPS)
    const secureToken = cookieStore.get("__Secure-next-auth.session-token")?.value;
    if (secureToken) {
        return secureToken;
    }
    
    // Fall back to non-secure cookie (development/HTTP)
    const devToken = cookieStore.get("next-auth.session-token")?.value;
    if (devToken) {
        return devToken;
    }
    
    return null;
};

export default getSessionToken;

