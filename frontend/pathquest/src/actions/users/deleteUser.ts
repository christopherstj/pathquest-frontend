"use server";
import getAuthHeaders from "@/helpers/getAuthHeaders";
import getBackendUrl from "@/helpers/getBackendUrl";

const backendUrl = getBackendUrl();

const deleteUser = async () => {
    const { headers, session } = await getAuthHeaders();

    // @ts-expect-error - id is added in session callback
    const id = session?.user?.id;

    if (!id) {
        return false;
    }

    const response = await fetch(`${backendUrl}/users/${id}`, {
        method: "DELETE",
        headers,
    });

    if (!response.ok) {
        console.error(await response.text());
        return false;
    }

    return true;
};

export default deleteUser;
