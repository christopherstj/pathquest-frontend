const clearCoords = (map: mapboxgl.Map | null) => {
    (map?.getSource("activities") as mapboxgl.GeoJSONSource).setData({
        type: "FeatureCollection",
        features: [],
    });
};

export default clearCoords;
