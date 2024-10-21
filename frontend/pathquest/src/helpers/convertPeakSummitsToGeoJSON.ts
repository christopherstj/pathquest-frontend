import PeakSummit from "@/typeDefs/PeakSummit";
import peakMarker from "@/public/images/peak-marker.svg";
import Peak from "@/typeDefs/Peak";

const convertPeakSummitsToGeoJSON = (
    peakSummits: PeakSummit[]
): GeoJSON.GeoJSON => {
    return {
        type: "FeatureCollection",
        features: peakSummits.map((peak) => ({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [peak.Long, peak.Lat],
            },
            properties: {
                ...peak,
            },
        })),
    };
};

export default convertPeakSummitsToGeoJSON;
