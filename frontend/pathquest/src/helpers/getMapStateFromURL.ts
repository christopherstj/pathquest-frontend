type MapState = {
    is3D: boolean;
    isSatellite: boolean;
    pitch: number;
    bearing: number;
    center: [number, number] | null; // [lng, lat]
    zoom: number | null;
};

const getMapStateFromURL = (params: URLSearchParams): MapState => {
    const lat = params.get("lat");
    const lng = params.get("lng");
    const zoom = params.get("z");

    return {
        is3D: params.get("3d") === "true",
        isSatellite: params.get("satellite") === "true",
        pitch: parseFloat(params.get("pitch") || "0"),
        bearing: parseFloat(params.get("bearing") || "0"),
        center: lat && lng ? [parseFloat(lng), parseFloat(lat)] : null,
        zoom: zoom ? parseFloat(zoom) : null,
    };
};

export default getMapStateFromURL;
export type { MapState };
