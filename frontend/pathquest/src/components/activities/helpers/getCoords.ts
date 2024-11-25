import getActvitiyCoords from "@/actions/getActivityCoords";

const getCoords = async (activityId: string, map: mapboxgl.Map | null) => {
    const coords = await getActvitiyCoords(activityId);

    if (!coords) {
        return;
    }

    (map?.getSource("activities") as mapboxgl.GeoJSONSource).setData({
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: coords.coords.map((c) => [c[1], c[0]]),
                },
                properties: {
                    id: activityId,
                },
            },
        ],
    });
};

export default getCoords;
