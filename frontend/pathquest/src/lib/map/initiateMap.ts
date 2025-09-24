import mapboxgl from "mapbox-gl";

const initiateMap = (
    mapContainerRef: React.MutableRefObject<any>,
    mapRef: React.MutableRefObject<mapboxgl.Map | null>,
    center: [number, number],
    zoom: number = 8,
    addMarkers?: () => void
) => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
    mapRef.current = new mapboxgl.Map({
        style: "mapbox://styles/mapbox/outdoors-v12",
        container: mapContainerRef.current,
        center,
        zoom,
    });

    if (addMarkers) {
        mapRef.current.on("load", addMarkers);
    }
};

export default initiateMap;
