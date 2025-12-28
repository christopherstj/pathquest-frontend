"use server";
import getAuthHeaders from "@/helpers/getAuthHeaders";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";

const backendUrl = getBackendUrl();

const deleteUser = async () => {
    const { headers, session } = await getAuthHeaders();

    const id = session?.user?.id;

    if (!id) {
        return false;
    }

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => headers,
    });

    try {
        await endpoints.deleteUser(client, id);
        return true;
    } catch (err: any) {
        console.error("[deleteUser]", err?.bodyText ?? err);
        return false;
    }
};

export default deleteUser;
