"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";

const backendUrl = getBackendUrl();

const getIsUserSubscribed = async (userId: string) => {
    // Always generate token for Google IAM authentication (required at infrastructure level)
    const idToken = await getGoogleIdToken().catch((err) => {
        console.error("[getIsUserSubscribed] Failed to get Google ID token:", err);
        return null;
    });

    if (!idToken && process.env.NODE_ENV !== "development") {
        console.error("[getIsUserSubscribed] No token available - cannot make authenticated request");
        return false;
    }

    const response = await fetch(
        `${backendUrl}/users/${userId}/is-subscribed`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
            },
        }
    );

    if (!response.ok) {
        console.error(await response.text());
        return false;
    }

    const data = await response.json();
    return data.isSubscribed as boolean;
};

export default getIsUserSubscribed;
