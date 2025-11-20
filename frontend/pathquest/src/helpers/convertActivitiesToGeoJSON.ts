import Activity from "@/typeDefs/Activity";

const convertActivitiesToGeoJSON = (
    activities: Activity[]
): [GeoJSON.GeoJSON, GeoJSON.GeoJSON] => {
    const lineStrings: GeoJSON.GeoJSON = {
        type: "FeatureCollection",
        features: activities.map((a) => ({
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: a.coords as [number, number][],
            },
            properties: {
                id: a.id,
            },
        })),
    };

    const starts: GeoJSON.GeoJSON = {
        type: "FeatureCollection",
        features: activities.map((a) => ({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: a.start_coords,
            },
            properties: {
                id: a.id,
            },
        })),
    };

    return [lineStrings, starts];
};

export default convertActivitiesToGeoJSON;
