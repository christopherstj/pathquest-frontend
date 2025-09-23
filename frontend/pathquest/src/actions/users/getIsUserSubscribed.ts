"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";

const backendUrl = getBackendUrl();

const getIsUserSubscribed = async (userId: string) => {
    const idToken = await getGoogleIdToken();

    const response = await fetch(
        `${backendUrl}/users/${userId}/is-subscribed`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
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
