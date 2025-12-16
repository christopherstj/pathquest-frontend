"use client";

import { useEffect, useMemo, useCallback } from "react";
import { useMapStore } from "@/providers/MapProvider";
import { setPeaksSearchDisabled } from "@/helpers/peaksSearchState";
import convertPeaksToGeoJSON from "@/helpers/convertPeaksToGeoJSON";
import Peak from "@/typeDefs/Peak";
import Challenge from "@/typeDefs/Challenge";
import mapboxgl from "mapbox-gl";

interface UseChallengeMapEffectsOptions {
    challenge: Challenge | null | undefined;
    peaks?: Peak[] | null;
    padding?: { top: number; bottom: number; left: number; right: number };
}

const MAX_ATTEMPTS = 10;
const RETRY_DELAY = 300;

/**
 * Hook to handle map effects when viewing a challenge detail.
 * - Disables general peaks search
 * - Shows challenge peaks on the map
 * - Fits map to challenge bounds
 */
export function useChallengeMapEffects({
    challenge,
    peaks,
    padding = { top: 100, bottom: 100, left: 50, right: 400 },
}: UseChallengeMapEffectsOptions) {
    const map = useMapStore((state) => state.map);
    const setDisablePeaksSearch = useMapStore((state) => state.setDisablePeaksSearch);

    // Calculate bounds of all peaks
    const bounds = useMemo(() => {
        if (!peaks || peaks.length === 0) return null;

        const peakCoords = peaks
            .filter((p) => p.location_coords)
            .map((p) => p.location_coords as [number, number]);

        if (peakCoords.length === 0) return null;

        const lngLat = new mapboxgl.LngLatBounds();
        peakCoords.forEach((coord) => {
            lngLat.extend(coord);
        });

        return lngLat;
    }, [peaks]);

    // Disable peaks search when challenge detail opens
    useEffect(() => {
        if (!challenge) return;

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
    }, [challenge, setDisablePeaksSearch, map]);

    // Fit map to challenge bounds
    useEffect(() => {
        if (bounds && map) {
            map.fitBounds(bounds, {
                padding,
                maxZoom: 12,
            });
        } else if (challenge?.location_coords && map) {
            map.flyTo({
                center: challenge.location_coords,
                zoom: 10,
                essential: true,
            });
        }
    }, [bounds, challenge?.location_coords, map, padding]);

    // Show challenge peaks on the map
    useEffect(() => {
        if (!map || !peaks || peaks.length === 0) return;

        const setChallengePeaksOnMap = async () => {
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

        setChallengePeaksOnMap();

        // Cleanup: clear selected peaks
        return () => {
            if (!map) return;

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
    }, [map, peaks]);

    // Show challenge on map function
    const showOnMap = useCallback(() => {
        if (bounds && map) {
            map.fitBounds(bounds, {
                padding,
                maxZoom: 12,
            });
        }
    }, [bounds, map, padding]);

    return { bounds, showOnMap };
}


