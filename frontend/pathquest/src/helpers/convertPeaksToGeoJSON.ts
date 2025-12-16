import Peak from "@/typeDefs/Peak";

const convertPeaksToGeoJSON = (peaks: Peak[]): GeoJSON.FeatureCollection => {
    return {
        type: "FeatureCollection",
        features: peaks.map((peak) => ({
            type: "Feature" as const,
            // Feature ID is required for Mapbox setFeatureState to work
            id: peak.id,
            geometry: {
                type: "Point" as const,
                coordinates: peak.location_coords || [0, 0],
            },
            properties: {
                ...peak,
            },
        })),
    };
};

export default convertPeaksToGeoJSON;
