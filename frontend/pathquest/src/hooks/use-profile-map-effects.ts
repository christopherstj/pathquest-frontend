"use client";

import { useEffect, useMemo, useCallback } from "react";
import { useMapStore } from "@/providers/MapProvider";
import { setPeaksSearchDisabled } from "@/helpers/peaksSearchState";
import convertPeaksToGeoJSON from "@/helpers/convertPeaksToGeoJSON";
import Peak from "@/typeDefs/Peak";
import mapboxgl from "mapbox-gl";

interface UseProfileMapEffectsOptions {
    userId: string | null | undefined;
    peaks?: Peak[] | null;
    padding?: { top: number; bottom: number; left: number; right: number };
}

const MAX_ATTEMPTS = 10;
const RETRY_DELAY = 300;

/**
 * Hook to handle map effects when viewing a user profile.
 * - Disables general peaks search
 * - Shows all user's summited peaks on the map
 * - Fits map to bounds of all peaks
 * 
 * Based on useChallengeMapEffects pattern.
 */
export function useProfileMapEffects({
    userId,
    peaks,
    padding = { top: 100, bottom: 100, left: 50, right: 400 },
}: UseProfileMapEffectsOptions) {
    const map = useMapStore((state) => state.map);
    const setDisablePeaksSearch = useMapStore((state) => state.setDisablePeaksSearch);

    // Calculate bounds of all peaks
    const bounds = useMemo(() => {
        if (!peaks || peaks.length === 0) return null;

        const peakCoords = peaks
            .filter((p) => p.location_coords && Array.isArray(p.location_coords) && p.location_coords.length === 2)
            .map((p) => p.location_coords as [number, number]);

        if (peakCoords.length === 0) return null;

        try {
            const lngLat = new mapboxgl.LngLatBounds();
            peakCoords.forEach((coord) => {
                if (coord && coord[0] != null && coord[1] != null) {
                    lngLat.extend(coord);
                }
            });

            return lngLat;
        } catch (error) {
            console.debug("Failed to create bounds:", error);
            return null;
        }
    }, [peaks]);

    // Disable peaks search when profile opens
    useEffect(() => {
        if (!userId) return;

        // Set both the module-level flag (immediate) and store flag
        setPeaksSearchDisabled(true);
        setDisablePeaksSearch(true);

        // Clear the peaks source to remove any already-loaded peaks
        if (map) {
            const peaksSource = map.getSource("peaks") as mapboxgl.GeoJSONSource | undefined;
            if (peaksSource) {
                peaksSource.setData({
                    type: "FeatureCollection",
                    features: [],
                });
            }
        }

        return () => {
            setPeaksSearchDisabled(false);
            setDisablePeaksSearch(false);

            // Reset map padding and trigger peaks refresh when panel closes
            if (map) {
                map.setPadding({ top: 0, bottom: 0, left: 0, right: 0 });
                setTimeout(() => {
                    map.fire("moveend");
                }, 50);
            }
        };
    }, [userId, setDisablePeaksSearch, map]);

    // Fit map to peaks bounds
    useEffect(() => {
        if (bounds && map) {
            try {
                // Check if bounds are valid before calling fitBounds
                if (bounds.getNorth && bounds.getSouth && bounds.getEast && bounds.getWest) {
                    const north = bounds.getNorth();
                    const south = bounds.getSouth();
                    const east = bounds.getEast();
                    const west = bounds.getWest();
                    
                    // Ensure bounds are valid (not NaN and have valid range)
                    if (
                        !isNaN(north) && !isNaN(south) && !isNaN(east) && !isNaN(west) &&
                        north !== south && east !== west
                    ) {
                        map.fitBounds(bounds, {
                            padding,
                            maxZoom: 10,
                        });
                    }
                }
            } catch (error) {
                console.debug("Failed to fit bounds:", error);
            }
        }
    }, [bounds, map, padding]);

    // Show user peaks on the map
    useEffect(() => {
        if (!map || !peaks || peaks.length === 0) return;

        const setUserPeaksOnMap = async () => {
            let selectedPeaksSource = map.getSource("selectedPeaks") as mapboxgl.GeoJSONSource | undefined;
            let attempts = 0;

            while (!selectedPeaksSource && attempts < MAX_ATTEMPTS) {
                attempts++;
                await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
                selectedPeaksSource = map.getSource("selectedPeaks") as mapboxgl.GeoJSONSource | undefined;
            }

            if (selectedPeaksSource) {
                selectedPeaksSource.setData(convertPeaksToGeoJSON(peaks));
            }

            // Move selectedPeaks layer to the top
            if (map.getLayer("selectedPeaks")) {
                map.moveLayer("selectedPeaks");
            }
        };

        setUserPeaksOnMap();

        // Cleanup: clear selected peaks (only if viewing a profile)
        return () => {
            if (!map || !userId) return;

            try {
                const selectedPeaksSource = map.getSource("selectedPeaks") as mapboxgl.GeoJSONSource | undefined;
                if (selectedPeaksSource) {
                    selectedPeaksSource.setData({
                        type: "FeatureCollection",
                        features: [],
                    });
                }
            } catch (error) {
                console.debug("Failed to cleanup selectedPeaks map source:", error);
            }
        };
    }, [map, peaks, userId]);

    // Show peaks on map function
    const showOnMap = useCallback(() => {
        if (bounds && map) {
            try {
                // Check if bounds are valid before calling fitBounds
                if (bounds.getNorth && bounds.getSouth && bounds.getEast && bounds.getWest) {
                    const north = bounds.getNorth();
                    const south = bounds.getSouth();
                    const east = bounds.getEast();
                    const west = bounds.getWest();
                    
                    // Ensure bounds are valid (not NaN and have valid range)
                    if (
                        !isNaN(north) && !isNaN(south) && !isNaN(east) && !isNaN(west) &&
                        north !== south && east !== west
                    ) {
                        map.fitBounds(bounds, {
                            padding,
                            maxZoom: 10,
                        });
                    }
                }
            } catch (error) {
                console.debug("Failed to fit bounds:", error);
            }
        }
    }, [bounds, map, padding]);

    return { bounds, showOnMap };
}

