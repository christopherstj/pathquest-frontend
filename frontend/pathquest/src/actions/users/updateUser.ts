"use server";
import getAuthHeaders from "@/helpers/getAuthHeaders";
import getBackendUrl from "@/helpers/getBackendUrl";
import ServerActionResult from "@/typeDefs/ServerActionResult";

const backendUrl = getBackendUrl();

interface UpdateUserData {
    name?: string;
    email?: string;
    pic?: string;
    city?: string;
    state?: string;
    country?: string;
    location_coords?: [number, number] | null;
    update_description?: boolean;
    is_public?: boolean;
}

const updateUser = async (updateData: UpdateUserData): Promise<ServerActionResult> => {
    const { headers, session } = await getAuthHeaders();

    // @ts-expect-error - id is added in session callback
    const id = session?.user?.id;

    if (!id) {
        return {
            success: false,
            error: "Not authenticated",
        };
    }

    const apiRes = await fetch(`${backendUrl}/users/${id}`, {
        method: "PUT",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
            ...headers,
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
