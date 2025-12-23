import mapboxgl from "mapbox-gl";
import React from "react";
import { createRoot } from "react-dom/client";

/**
 * Renders a React component inside a Mapbox popup at the given coordinates.
 * Returns the popup instance so callers can close/remove it later.
 */
const renderPopup = (
    map: mapboxgl.Map | null,
    coordinates: [number, number],
    Popup: React.ReactNode
): mapboxgl.Popup | null => {
    if (!map) return null;

    const container = document.createElement("div");
    const root = createRoot(container);

    root.render(Popup);

    // No close "X" in the top-right (popup closes on map click instead)
    const popup = new mapboxgl.Popup({ offset: 16, closeButton: false, closeOnClick: true })
        .setLngLat(coordinates)
        .setDOMContent(container)
        .addTo(map);

    return popup;
};

export default renderPopup;
