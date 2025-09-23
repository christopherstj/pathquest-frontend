"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import ServerActionResult from "@/typeDefs/ServerActionResult";

const backendUrl = getBackendUrl();

const getActivitiesProcessing = async (): Promise<
    ServerActionResult<number>
> => {
    const session = await useAuth();

    const id = session?.user?.id;

    if (!id) {
        return { success: false, error: "User not authenticated" };
    }

    const idToken = await getGoogleIdToken();

    const res = await fetch(`${backendUrl}/user/${id}/activities-processing`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${idToken}`,
        },
    });

    if (!res.ok) {
        return {
            success: false,
            error: "Failed to fetch activities processing count",
        };
    }

    const data: { numProcessing: number } = await res.json();

    return { success: true, data: data.numProcessing };
};

export default getActivitiesProcessing;
