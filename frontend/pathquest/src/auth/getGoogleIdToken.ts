"use server";

import { getVercelOidcToken } from "@vercel/oidc";
import { ExternalAccountClient } from "google-auth-library";
import jwt from "jsonwebtoken";

// In-memory cache instead of process.env (which is read-only at runtime)
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Generates a new Google ID token using Vercel OIDC federation.
 * This token is used to authenticate requests to the pathquest-api on Google Cloud Run.
 */
export const getNewToken = async (): Promise<string | null> => {
    console.log("[getNewToken] Starting token generation...");

    try {
        // Read env vars inside the function, not at module level
        // This ensures they're available in Next.js 16 server contexts
        const GCP_PROJECT_NUMBER = process.env.GCP_PROJECT_NUMBER;
        const GCP_SERVICE_ACCOUNT_EMAIL = process.env.GCP_SERVICE_ACCOUNT_EMAIL;
        const GCP_WORKLOAD_IDENTITY_POOL_ID = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID;
        const GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID =
            process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID;

        // Log which environment variables are missing for debugging
        const missingVars: string[] = [];
        if (!GCP_PROJECT_NUMBER) missingVars.push("GCP_PROJECT_NUMBER");
        if (!GCP_SERVICE_ACCOUNT_EMAIL) missingVars.push("GCP_SERVICE_ACCOUNT_EMAIL");
        if (!GCP_WORKLOAD_IDENTITY_POOL_ID) missingVars.push("GCP_WORKLOAD_IDENTITY_POOL_ID");
        if (!GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID) missingVars.push("GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID");

        if (missingVars.length > 0) {
            console.error(`[getNewToken] FAILED: Missing GCP environment variables: ${missingVars.join(", ")}`);
            return null;
        }

        console.log("[getNewToken] All GCP env vars present, creating auth client...");

        // Wrap getVercelOidcToken to add logging
        const wrappedGetVercelOidcToken = async () => {
            console.log("[getNewToken] Calling getVercelOidcToken...");
            try {
                const oidcToken = await getVercelOidcToken();
                if (!oidcToken) {
                    console.error("[getNewToken] getVercelOidcToken returned null/undefined/empty");
                } else {
                    console.log(`[getNewToken] getVercelOidcToken returned token (length: ${oidcToken.length})`);
                }
                return oidcToken;
            } catch (oidcError) {
                console.error("[getNewToken] getVercelOidcToken threw an error:", oidcError);
                throw oidcError;
            }
        };

        const authClient = ExternalAccountClient.fromJSON({
            type: "external_account",
            audience: `//iam.googleapis.com/projects/${GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${GCP_WORKLOAD_IDENTITY_POOL_ID}/providers/${GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID}`,
            subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
            token_url: "https://sts.googleapis.com/v1/token",
            service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
            subject_token_supplier: {
                getSubjectToken: wrappedGetVercelOidcToken,
            },
        });

        if (!authClient) {
            console.error("[getNewToken] FAILED: ExternalAccountClient.fromJSON returned null/undefined");
            return null;
        }

        console.log("[getNewToken] Getting access token from Google STS...");
        const accessTokenResult = await authClient.getAccessToken();
        const { token: accessToken } = accessTokenResult;

        if (!accessToken) {
            console.error("[getNewToken] FAILED: getAccessToken returned null/undefined token");
            return null;
        }

        console.log("[getNewToken] Access token obtained, generating ID token...");

        const idTokenUrl = `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${GCP_SERVICE_ACCOUNT_EMAIL}:generateIdToken`;
        const idTokenRes = await fetch(idTokenUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                audience: `https://pathquest-api.app`,
            }),
        });

        if (!idTokenRes.ok) {
            const errorText = await idTokenRes.text().catch(() => "Unable to read error response");
            console.error(`[getNewToken] FAILED: generateIdToken HTTP ${idTokenRes.status}: ${errorText}`);
            return null;
        }

        let responseData: { token?: string };
        try {
            responseData = await idTokenRes.json();
        } catch (jsonError) {
            console.error("[getNewToken] FAILED: Invalid JSON response from generateIdToken", jsonError);
            return null;
        }

        const { token: idToken } = responseData;

        if (!idToken || typeof idToken !== "string") {
            console.error("[getNewToken] FAILED: Response missing 'token' field or invalid type", responseData);
            return null;
        }

        console.log("[getNewToken] SUCCESS: ID token generated successfully");
        return idToken;
    } catch (error) {
        console.error("[getNewToken] FAILED: Unexpected error during token generation:", error);
        return null;
    }
};

/**
 * Gets a Google ID token for authenticating API requests.
 * Uses caching to avoid regenerating tokens on every request.
 * Returns empty string in development (API allows unauthenticated requests in dev).
 */
const getGoogleIdToken = async (): Promise<string | null> => {
    if (process.env.NODE_ENV === "development") {
        console.log("[getGoogleIdToken] Development mode - returning empty string");
        return "";
    }

    // Check cached token
    if (cachedToken && tokenExpiry > Date.now()) {
        const remainingMs = tokenExpiry - Date.now();
        console.log(`[getGoogleIdToken] Returning cached token (expires in ${Math.round(remainingMs / 1000)}s)`);
        return cachedToken;
    }

    console.log("[getGoogleIdToken] No valid cached token, generating new one...");

    // Get new token
    try {
        const newToken = await getNewToken();

        if (newToken) {
            // Decode and cache with expiry
            const decodedToken = jwt.decode(newToken) as { exp: number } | null;
            if (decodedToken?.exp) {
                cachedToken = newToken;
                // Set expiry to 5 minutes before actual expiry for safety
                tokenExpiry = decodedToken.exp * 1000 - 5 * 60 * 1000;
                const expiresIn = Math.round((tokenExpiry - Date.now()) / 1000);
                console.log(`[getGoogleIdToken] SUCCESS: New token cached (expires in ${expiresIn}s)`);
            } else {
                console.warn("[getGoogleIdToken] WARNING: Could not decode token expiry, not caching");
            }
            return newToken;
        }

        console.error("[getGoogleIdToken] FAILED: getNewToken returned null");
        return null;
    } catch (error) {
        console.error("[getGoogleIdToken] FAILED: Error getting new token:", error);
        return null;
    }
};

export default getGoogleIdToken;
