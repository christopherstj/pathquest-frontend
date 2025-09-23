"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";

const backendUrl = getBackendUrl();

const getIsFavorited = async (peakId: string): Promise<boolean> => {
    const session = await useAuth();

    if (!session) {
        return false;
    }

    const userId = session.user.id;

    const idToken = await getGoogleIdToken();

    const response = await fetch(
        `${backendUrl}/peaks/favorite?peakId=${peakId}&userId=${userId}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
        }
    );

    if (!response.ok) {
        console.error(await response.text());
        return false;
    } else {
        const data = await response.json();
        console.log(data);
        return data.isFavorited;
    }
};

export default getIsFavorited;
