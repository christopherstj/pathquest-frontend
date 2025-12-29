"use server";
import getSessionToken from "@/auth/getSessionToken";
import getBackendUrl from "@/helpers/getBackendUrl";

const backendUrl = getBackendUrl();

const createUserInterest = async (email: string) => {
    // Always generate token for Google IAM authentication (required at infrastructure level)
    const idToken = await getSessionToken().catch((err) => {
        console.error("[createUserInterest] Failed to get Google ID token:", err);
        return null;
    });

    if (!idToken && process.env.NODE_ENV !== "development") {
        console.error("[createUserInterest] No token available - cannot make authenticated request");
        return false;
    }

    const response = await fetch(`${backendUrl}/auth/user-interest`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        console.error(await response.text());
        return false;
    }

    return true;
};

export default createUserInterest;
