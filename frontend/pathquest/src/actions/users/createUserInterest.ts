"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";

const backendUrl = getBackendUrl();

const createUserInterest = async (email: string) => {
    const idToken = await getGoogleIdToken();

    const response = await fetch(`${backendUrl}/user-interest`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
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
