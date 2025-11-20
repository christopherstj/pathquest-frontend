type MapState = {
    is3D: boolean;
    isSatellite: boolean;
    pitch: number;
    bearing: number;
};

const getMapStateFromURL = (params: URLSearchParams): MapState => {
    return {
        is3D: params.get("3d") === "true",
        isSatellite: params.get("satellite") === "true",
        pitch: parseFloat(params.get("pitch") || "0"),
        bearing: parseFloat(params.get("bearing") || "0"),
    };
};

export default getMapStateFromURL;
