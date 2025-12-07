"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import ServerActionResult from "@/typeDefs/ServerActionResult";

const backendUrl = getBackendUrl();

const updateUser = async (updateData: {
    name?: string;
    email?: string;
    pic?: string;
}): Promise<ServerActionResult> => {
    const session = await useAuth();

    const id = session?.user?.id;

    if (!id) {
        return {
            success: false,
            error: "Not authenticated",
        };
    }

    const token = await getGoogleIdToken();

    const apiRes = await fetch(`${backendUrl}/user/${id}`, {
        method: "PUT",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
    });

    if (!apiRes.ok) {
        console.error(await apiRes.text());
        return {
            success: false,
            error: apiRes.statusText,
        };
    }
    return {
        success: true,
    };
};

export default updateUser;
