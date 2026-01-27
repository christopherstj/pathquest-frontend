import { fetchLocalJson } from "./api";
import type { UnifiedSearchResponse, UnifiedSearchParams } from "@pathquest/shared/types";

export const unifiedSearchClient = async (
    params: UnifiedSearchParams
): Promise<UnifiedSearchResponse> => {
    const urlParams = new URLSearchParams();

    urlParams.set("q", params.query);
    
    if (params.lat !== undefined) {
        urlParams.set("lat", String(params.lat));
    }
    if (params.lng !== undefined) {
        urlParams.set("lng", String(params.lng));
    }
    if (params.bounds) {
        urlParams.set("bounds", params.bounds.join(","));
    }
    if (params.limit !== undefined) {
        urlParams.set("limit", String(params.limit));
    }
    if (params.includePeaks !== undefined) {
        urlParams.set("includePeaks", String(params.includePeaks));
    }
    if (params.includeChallenges !== undefined) {
        urlParams.set("includeChallenges", String(params.includeChallenges));
    }

    return fetchLocalJson<UnifiedSearchResponse>("/api/search", urlParams);
};

export default unifiedSearchClient;
