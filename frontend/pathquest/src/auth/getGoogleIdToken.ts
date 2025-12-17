import { getVercelOidcToken } from "@vercel/oidc";
import { ExternalAccountClient } from "google-auth-library";
import jwt from "jsonwebtoken";

// In-memory cache instead of process.env (which is read-only at runtime)
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

export const getNewToken = async () => {
    // Read env vars inside the function, not at module level
    // This ensures they're available in Next.js 16 server contexts
    const GCP_PROJECT_NUMBER = process.env.GCP_PROJECT_NUMBER;
    const GCP_SERVICE_ACCOUNT_EMAIL = process.env.GCP_SERVICE_ACCOUNT_EMAIL;
    const GCP_WORKLOAD_IDENTITY_POOL_ID = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID;
    const GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID =
        process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID;

    if (!GCP_PROJECT_NUMBER || !GCP_SERVICE_ACCOUNT_EMAIL || !GCP_WORKLOAD_IDENTITY_POOL_ID || !GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID) {
        console.error("Missing GCP environment variables for Google ID token generation");
        return null;
    }

    const authClient = ExternalAccountClient.fromJSON({
        type: "external_account",
        audience: `//iam.googleapis.com/projects/${GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${GCP_WORKLOAD_IDENTITY_POOL_ID}/providers/${GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID}`,
        subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
        token_url: "https://sts.googleapis.com/v1/token",
        service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
        subject_token_supplier: {
            getSubjectToken: getVercelOidcToken,
        },
    });

    if (!authClient) {
        return null;
    }

    const { token } = await authClient.getAccessToken();

    const idTokenRes = await fetch(
        `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${GCP_SERVICE_ACCOUNT_EMAIL}:generateIdToken`,
        {
            method: "POST",
            headers: {
                "Content-Type": "text/json; charset=utf-8",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                audience: `https://pathquest-api.app`,
            }),
        }
    );

    const { token: idToken }: { token: string } = await idTokenRes.json();

    return idToken;
};

const getGoogleIdToken = async () => {
    if (process.env.NODE_ENV === "development") {
        return "";
    }

    // Check cached token
    if (cachedToken && tokenExpiry > Date.now()) {
        console.log("returning cached token");
        return cachedToken;
    }

    // Get new token
    const newToken = await getNewToken();

    if (newToken) {
        // Decode and cache with expiry
        const decodedToken = jwt.decode(newToken) as { exp: number } | null;
        if (decodedToken?.exp) {
            cachedToken = newToken;
            // Set expiry to 5 minutes before actual expiry for safety
            tokenExpiry = decodedToken.exp * 1000 - 5 * 60 * 1000;
        }
        return newToken;
    }

    return null;
};

export default getGoogleIdToken;
