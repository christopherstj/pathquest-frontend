import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";

const convertUnclimbedPeaksToGEOJson = (
    unclimbedPeaks: UnclimbedPeak[]
): GeoJSON.FeatureCollection => {
    const geoJson: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: unclimbedPeaks.map((peak) => ({
            type: "Feature",
            properties: {
                ...peak,
            },
            geometry: {
                type: "Point",
                coordinates: [peak.Long, peak.Lat],
            },
        })),
    };

    return geoJson;
};

export default convertUnclimbedPeaksToGEOJson;
