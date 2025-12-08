"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";

const backendUrl = getBackendUrl();

const deleteUser = async () => {
    const session = await useAuth();

    const id = session?.user?.id;

    const idToken = await getGoogleIdToken();

    const response = await fetch(`${backendUrl}/users/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${idToken}`,
        },
    });

    if (!response.ok) {
        console.error(await response.text());
        return false;
    }

    return true;
};

export default deleteUser;
