import { getVercelOidcToken } from "@vercel/functions/oidc";
import { ExternalAccountClient } from "google-auth-library";
import jwt from "jsonwebtoken";

const GCP_PROJECT_NUMBER = process.env.GCP_PROJECT_NUMBER;
const GCP_SERVICE_ACCOUNT_EMAIL = process.env.GCP_SERVICE_ACCOUNT_EMAIL;
const GCP_WORKLOAD_IDENTITY_POOL_ID = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID;
const GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID =
    process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID;

export const getNewToken = async () => {
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
    const existingToken = process.env.GOOGLE_ID_TOKEN ?? "";

    if (existingToken !== "") {
        const decodedToken = jwt.decode(existingToken) as { exp: number };

        if (decodedToken.exp * 1000 >= Date.now()) {
            console.log("returning existing token");
            return existingToken;
        } else {
            const newToken = await getNewToken();

            if (newToken) {
                process.env.GOOGLE_ID_TOKEN = newToken;
                return newToken;
            } else {
                return null;
            }
        }
    } else {
        const newToken = await getNewToken();

        if (newToken) {
            process.env.GOOGLE_ID_TOKEN = newToken;
            return newToken;
        } else {
            return null;
        }
    }
};

export default getGoogleIdToken;
