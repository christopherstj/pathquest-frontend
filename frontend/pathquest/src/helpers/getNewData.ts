import searchPeaks from "@/actions/peaks/searchPeaks";
import Peak from "@/typeDefs/Peak";
import convertPeaksToGEOJson from "./convertPeaksToGeoJSON";

const getNewData = async (
    search: string,
    limitResultsToBbox: boolean,
    setPeaks: (peaks: Peak[]) => void,
    map: mapboxgl.Map | null,
    peakFilter?: (peak: Peak) => boolean
) => {
    if (!map) return;

    const bounds = map.getBounds();

    if (!bounds) return;

    const nw = bounds.getNorthWest();
    const se = bounds.getSouthEast();

    const zoom = map.getZoom();

    if (zoom < 6) {
        // Too far out to get meaningful data
        setPeaks([]);
        map.getSource("peaks") &&
            (map.getSource("peaks") as mapboxgl.GeoJSONSource).setData({
                type: "FeatureCollection",
                features: [],
            });
        return;
    }

    const unclimbedPeaks = await searchPeaks(
        limitResultsToBbox ? nw.lat.toString() : undefined,
        limitResultsToBbox ? nw.lng.toString() : undefined,
        limitResultsToBbox ? se.lat.toString() : undefined,
        limitResultsToBbox ? se.lng.toString() : undefined,
        search,
        undefined,
        undefined,
        "true"
    );

    if (peakFilter) {
        const filteredPeaks = unclimbedPeaks.filter(peakFilter);

        setPeaks(filteredPeaks);

        map.getSource("peaks") &&
            (map.getSource("peaks") as mapboxgl.GeoJSONSource).setData(
                convertPeaksToGEOJson(filteredPeaks)
            );
    } else {
        setPeaks(unclimbedPeaks);
        map.getSource("peaks") &&
            (map.getSource("peaks") as mapboxgl.GeoJSONSource).setData(
                convertPeaksToGEOJson(unclimbedPeaks)
            );
    }
};

export default getNewData;
