"use client";

import { useEffect, useRef, useCallback } from "react";
import { useMapStore } from "@/providers/MapProvider";
import mapboxgl from "mapbox-gl";

interface UsePeakHoverMapEffectsOptions {
    /** Coordinates of the currently hovered peak [lng, lat] */
    hoverCoords?: [number, number] | null;
}

/**
 * Hook to handle map hover effects when hovering over peak rows in discovery lists.
 * Creates/updates a `peakHover` map source and layer to show a dot marker at peak coordinates.
 * Similar to activityHover in use-activity-map-effects.ts
 */
export function usePeakHoverMapEffects({ hoverCoords }: UsePeakHoverMapEffectsOptions = {}) {
    const map = useMapStore((state) => state.map);
    const sourceCreatedRef = useRef(false);

    // Handle hover marker from peak row hover
    useEffect(() => {
        if (!map) return;

        const setHoverMarker = async () => {
            // Check if peakHover source exists
            let hoverSource = map.getSource("peakHover") as mapboxgl.GeoJSONSource | undefined;

            // If source doesn't exist and we have hover coords, create it
            if (!hoverSource && hoverCoords) {
                try {
                    map.addSource("peakHover", {
                        type: "geojson",
                        data: {
                            type: "FeatureCollection",
                            features: [],
                        },
                    });

                    map.addLayer({
                        id: "peakHover",
                        type: "circle",
                        source: "peakHover",
                        paint: {
                            "circle-radius": 10,
                            "circle-color": "#d66ba0", // Amber accent color
                            "circle-stroke-width": 2,
                            "circle-stroke-color": "#ffffff", // White border for visibility
                            "circle-opacity": 0.9,
                        },
                    });

                    sourceCreatedRef.current = true;
                    hoverSource = map.getSource("peakHover") as mapboxgl.GeoJSONSource | undefined;
                } catch (error) {
                    // Source might already exist, try to get it again
                    hoverSource = map.getSource("peakHover") as mapboxgl.GeoJSONSource | undefined;
                }
            }

            if (hoverSource) {
                if (hoverCoords) {
                    hoverSource.setData({
                        type: "FeatureCollection",
                        features: [
                            {
                                type: "Feature",
                                geometry: {
                                    type: "Point",
                                    coordinates: hoverCoords,
                                },
                                properties: {},
                            },
                        ],
                    });
                } else {
                    hoverSource.setData({
                        type: "FeatureCollection",
                        features: [],
                    });
                }
            }
        };

        setHoverMarker();
    }, [map, hoverCoords]);

    // Cleanup hover source on unmount
    useEffect(() => {
        return () => {
            if (!map) return;

            try {
                // Clear the data first
                const hoverSource = map.getSource("peakHover") as mapboxgl.GeoJSONSource | undefined;
                if (hoverSource) {
                    hoverSource.setData({
                        type: "FeatureCollection",
                        features: [],
                    });
                }

                // Only remove if we created it
                if (sourceCreatedRef.current) {
                    if (map.getLayer("peakHover")) {
                        map.removeLayer("peakHover");
                    }
                    if (map.getSource("peakHover")) {
                        map.removeSource("peakHover");
                    }
                    sourceCreatedRef.current = false;
                }
            } catch (error) {
                console.debug("Failed to cleanup peakHover map source:", error);
            }
        };
    }, [map]);

    // Clear hover on unmount
    const clearHover = useCallback(() => {
        if (!map) return;

        try {
            const hoverSource = map.getSource("peakHover") as mapboxgl.GeoJSONSource | undefined;
            if (hoverSource) {
                hoverSource.setData({
                    type: "FeatureCollection",
                    features: [],
                });
            }
        } catch (error) {
            console.debug("Failed to clear peakHover:", error);
        }
    }, [map]);

    return { clearHover };
}

