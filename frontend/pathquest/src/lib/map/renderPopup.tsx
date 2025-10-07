import mapboxgl from "mapbox-gl";
import React from "react";
import { createRoot } from "react-dom/client";

const renderPopup = (
    map: mapboxgl.Map | null,
    coordinates: [number, number],
    Popup: React.ReactNode
) => {
    if (!map) return;

    const container = document.createElement("div");
    const root = createRoot(container);

    root.render(Popup);

    new mapboxgl.Popup({ offset: 25 })
        .setLngLat(coordinates as [number, number])
        .setDOMContent(container)
        .addTo(map);
};

export default renderPopup;
