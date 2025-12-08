import searchPeaks from "@/actions/peaks/searchPeaks";
import Peak from "@/typeDefs/Peak";
import convertPeaksToGEOJson from "./convertPeaksToGeoJSON";

export type GetNewDataResult =
    | { status: "noMap" | "noBounds" | "zoomedOut"; count: 0 }
    | { status: "ok"; count: number };

const clearPeaksSource = (map: mapboxgl.Map) => {
    const source = map.getSource("peaks") as mapboxgl.GeoJSONSource | undefined;
    if (source) {
        source.setData({
            type: "FeatureCollection",
            features: [],
        });
    }
};

const getNewData = async (
    search: string,
    limitResultsToBbox: boolean,
    setPeaks: (peaks: Peak[]) => void,
    map: mapboxgl.Map | null,
    peakFilter?: (peak: Peak) => boolean
): Promise<GetNewDataResult> => {
    if (!map) return { status: "noMap", count: 0 };

    const bounds = map.getBounds();

    if (!bounds) return { status: "noBounds", count: 0 };

    const nw = bounds.getNorthWest();
    const se = bounds.getSouthEast();

    const zoom = map.getZoom();

    if (zoom < 6) {
        setPeaks([]);
        clearPeaksSource(map);
        return { status: "zoomedOut", count: 0 };
    }

    try {
        const peaks = await searchPeaks(
            limitResultsToBbox ? nw.lat.toString() : undefined,
            limitResultsToBbox ? nw.lng.toString() : undefined,
            limitResultsToBbox ? se.lat.toString() : undefined,
            limitResultsToBbox ? se.lng.toString() : undefined,
            search,
            undefined,
            undefined,
            "true"
        );

        const filtered = peakFilter ? peaks.filter(peakFilter) : peaks;
        setPeaks(filtered);

        const source = map.getSource("peaks") as
            | mapboxgl.GeoJSONSource
            | undefined;
        if (source) {
            source.setData(convertPeaksToGEOJson(filtered));
        }

        return { status: "ok", count: filtered.length };
    } catch (error) {
        console.error(error);
        setPeaks([]);
        clearPeaksSource(map);
        return { status: "ok", count: 0 };
    }
};

export default getNewData;
