"use client";

import { useEffect, useMemo, useCallback, useRef } from "react";
import { useMapStore } from "@/providers/MapProvider";
import { setPeaksSearchDisabled } from "@/helpers/peaksSearchState";
import convertPeaksToGeoJSON from "@/helpers/convertPeaksToGeoJSON";
import Peak from "@/typeDefs/Peak";
import Challenge from "@/typeDefs/Challenge";
import mapboxgl from "mapbox-gl";

interface UseChallengeMapEffectsOptions {
    challenge: Challenge | null | undefined;
    peaks?: Peak[] | null;
}

const MAX_ATTEMPTS = 10;
const RETRY_DELAY = 300;

/**
 * Hook to handle map effects when viewing a challenge detail.
 * - Disables general peaks search
 * - Shows challenge peaks on the map
 * - Fits map to challenge bounds (only once on initial load)
 * 
 * Note: Map padding is controlled by MapBackground based on drawer height, not here.
 */
export function useChallengeMapEffects({
    challenge,
    peaks,
}: UseChallengeMapEffectsOptions) {
    const map = useMapStore((state) => state.map);
    const setDisablePeaksSearch = useMapStore((state) => state.setDisablePeaksSearch);
    
    // Track if we've already performed the initial fitBounds
    const hasFitBoundsRef = useRef(false);
    // Track the challenge ID to reset fitBounds when viewing a different challenge
    const lastChallengeIdRef = useRef<string | null>(null);

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

            // Trigger peaks refresh when panel closes
            // Note: Don't reset map padding here - it's controlled by MapBackground based on drawer height
            if (map) {
                setTimeout(() => {
                    map.fire("moveend");
                }, 50);
            }
        };
    }, [challenge, setDisablePeaksSearch, map]);

    // Fit map to challenge bounds (only once on initial load, not on every zoom/pan)
    useEffect(() => {
        // Reset fitBounds flag when viewing a different challenge
        if (challenge?.id !== lastChallengeIdRef.current) {
            hasFitBoundsRef.current = false;
            lastChallengeIdRef.current = challenge?.id ?? null;
        }

        // Only fit bounds once per challenge
        if (hasFitBoundsRef.current) return;
        
        if (bounds && map) {
            hasFitBoundsRef.current = true;
            map.fitBounds(bounds, {
                maxZoom: 12,
            });
        } else if (challenge?.location_coords && map) {
            hasFitBoundsRef.current = true;
            map.flyTo({
                center: challenge.location_coords,
                zoom: 10,
                essential: true,
            });
        }
    }, [bounds, challenge?.id, challenge?.location_coords, map]);

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
                maxZoom: 12,
            });
        }
    }, [bounds, map]);

    return { bounds, showOnMap };
}


