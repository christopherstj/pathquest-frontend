import mapboxgl from "mapbox-gl";
import { getMapboxToken } from "./getMapboxToken";

const initiateMap = (
    mapContainerRef: React.MutableRefObject<any>,
    mapRef: React.MutableRefObject<mapboxgl.Map | null>,
    center: [number, number],
    isSatellite: boolean = false,
    zoom: number = 8,
    bounds: mapboxgl.LngLatBoundsLike | null = null,
    addMarkers?: (map: mapboxgl.Map) => void
) => {
    mapboxgl.accessToken = getMapboxToken();
    mapRef.current = new mapboxgl.Map({
        style: isSatellite
            ? "mapbox://styles/mapbox/standard-satellite"
            : "mapbox://styles/mapbox/outdoors-v12",
        container: mapContainerRef.current,
        ...(bounds ? { bounds } : { center, zoom }),
    });

    if (addMarkers) {
        mapRef.current.on("load", () => addMarkers(mapRef.current!));
    }
};

export default initiateMap;
