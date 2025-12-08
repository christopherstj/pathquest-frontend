import { fetchLocalJson } from "./api";
import Peak from "@/typeDefs/Peak";

type SearchPeaksOptions = {
    search?: string;
    bounds?: {
        nw: { lat: number; lng: number };
        se: { lat: number; lng: number };
    };
    page?: string;
    perPage?: string;
    showSummitted?: boolean;
};

export const searchPeaksClient = async (
    options: SearchPeaksOptions
): Promise<Peak[]> => {
    const params = new URLSearchParams();

    if (options.search) params.set("search", options.search);
    if (options.page) params.set("page", options.page);
    if (options.perPage) params.set("perPage", options.perPage);
    if (options.showSummitted) params.set("showSummittedPeaks", "true");

    if (options.bounds) {
        params.set("northWestLat", options.bounds.nw.lat.toString());
        params.set("northWestLng", options.bounds.nw.lng.toString());
        params.set("southEastLat", options.bounds.se.lat.toString());
        params.set("southEastLng", options.bounds.se.lng.toString());
    }

    return fetchLocalJson<Peak[]>("/api/search/peaks", params);
};

export default searchPeaksClient;

