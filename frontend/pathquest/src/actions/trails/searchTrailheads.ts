"use server";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";

const backendUrl = getBackendUrl();

const searchTrailheads = async (
    nwLat: string,
    nwLng: string,
    seLat: string,
    seLng: string
) => {
    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => ({}),
    });

    try {
        return await endpoints.searchTrailheads(client, {
            nwLat,
            nwLng,
            seLat,
            seLng,
        });
    } catch (err: any) {
        console.error("[searchTrailheads]", err?.bodyText ?? err);
        return { type: "FeatureCollection" as const, features: [] };
    }
};

export default searchTrailheads;
