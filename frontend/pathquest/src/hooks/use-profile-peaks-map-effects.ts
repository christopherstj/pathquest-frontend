"use client";

import { useEffect } from "react";
import { useMapStore } from "@/providers/MapProvider";
import { setPeaksSearchDisabled } from "@/helpers/peaksSearchState";
import convertPeaksToGeoJSON from "@/helpers/convertPeaksToGeoJSON";
import Peak from "@/typeDefs/Peak";
import mapboxgl from "mapbox-gl";

interface UseProfilePeaksMapEffectsOptions {
    peaks: Peak[] | null;
    isActive: boolean;
}

const MAX_ATTEMPTS = 10;
const RETRY_DELAY = 300;

/**
 * Hook to handle map effects when viewing the Profile Peaks tab.
 * - Disables general peaks search
 * - Shows user's peaks on the map via selectedPeaks source
 * - Clears regular peaks source
 * - Re-enables search and clears selectedPeaks when inactive
 * 
 * Note: Map padding is controlled by MapBackground based on drawer height, not here.
 */
export function useProfilePeaksMapEffects({
    peaks,
    isActive,
}: UseProfilePeaksMapEffectsOptions) {
    const map = useMapStore((state) => state.map);
    const setDisablePeaksSearch = useMapStore((state) => state.setDisablePeaksSearch);

    // Disable peaks search when Profile Peaks tab is active
    useEffect(() => {
        if (!isActive) return;

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

            // Trigger peaks refresh when tab becomes inactive
            // Note: Don't reset map padding here - it's controlled by MapBackground based on drawer height
            if (map) {
                setTimeout(() => {
                    map.fire("moveend");
                }, 50);
            }
        };
    }, [isActive, setDisablePeaksSearch, map]);

    // Show user peaks on the map
    useEffect(() => {
        if (!map || !isActive || !peaks || peaks.length === 0) {
            // Clear selectedPeaks when inactive or no peaks
            if (!isActive && map) {
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
            }
            return;
        }

        const setProfilePeaksOnMap = async () => {
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

        setProfilePeaksOnMap();

        // Cleanup: clear selected peaks when inactive or peaks change
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
    }, [map, peaks, isActive]);
}

