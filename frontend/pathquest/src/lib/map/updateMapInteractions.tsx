const updateMapInteractions = (
    map: mapboxgl.Map,
    interactions: {
        action: string;
        layer: string;
        callback: (e: mapboxgl.MapMouseEvent) => void;
    }[]
) => {
    interactions.forEach(({ action, layer, callback }) => {
        map.on(action, layer, callback);
    });
};

export default updateMapInteractions;
