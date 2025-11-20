import Peak from "@/typeDefs/Peak";

const convertPeaksToGeoJSON = (peaks: Peak[]): GeoJSON.GeoJSON => {
    return {
        type: "FeatureCollection",
        features: peaks.map((peak) => ({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: peak.location_coords || [0, 0],
            },
            properties: {
                ...peak,
            },
        })),
    };
};

export default convertPeaksToGeoJSON;
