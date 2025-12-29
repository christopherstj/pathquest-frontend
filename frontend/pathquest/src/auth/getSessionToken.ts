"use server";

import { cookies } from "next/headers";

/**
 * Gets the NextAuth session token from cookies.
 * 
 * NextAuth stores the JWT session token in a cookie:
 * - Production (HTTPS): `__Secure-next-auth.session-token`
 * - Development (HTTP): `next-auth.session-token`
 * 
 * NextAuth v4 may chunk large cookies (e.g., `.0`, `.1`, `.2` suffixes).
 * This function handles both single and chunked cookies.
 * 
 * This token is verified by pathquest-api using the shared NEXTAUTH_SECRET.
 */
const getSessionToken = async (): Promise<string | null> => {
    const cookieStore = await cookies();
    
    // Debug: list all cookie names
    const allCookies = cookieStore.getAll();
    const sessionCookies = allCookies.filter(c => c.name.includes('session') || c.name.includes('next-auth'));
    console.log(`[getSessionToken] Found ${sessionCookies.length} session-related cookies:`, sessionCookies.map(c => c.name));
    
    // Try to get the token - check both secure (HTTPS) and non-secure (HTTP) variants
    const cookieNames = [
        "__Secure-next-auth.session-token",
        "next-auth.session-token",
    ];
    
    for (const baseName of cookieNames) {
        // First try the non-chunked version
        const singleCookie = cookieStore.get(baseName)?.value;
        if (singleCookie) {
            console.log(`[getSessionToken] Found ${baseName}, length: ${singleCookie.length}`);
            return singleCookie;
        }
        
        // Try chunked version (NextAuth chunks large tokens)
        const chunks: string[] = [];
        let chunkIndex = 0;
        while (true) {
            const chunkCookie = cookieStore.get(`${baseName}.${chunkIndex}`)?.value;
            if (!chunkCookie) break;
            chunks.push(chunkCookie);
            chunkIndex++;
        }
        
        if (chunks.length > 0) {
            const assembled = chunks.join("");
            console.log(`[getSessionToken] Assembled ${chunks.length} chunks for ${baseName}, total length: ${assembled.length}`);
            return assembled;
        }
    }
    
    console.log("[getSessionToken] No session token found in cookies");
    return null;
};

export default getSessionToken;

