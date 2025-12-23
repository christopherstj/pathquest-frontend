"use client";

import { useEffect } from "react";
import { useMapStore } from "@/providers/MapProvider";
import { setPeaksSearchDisabled } from "@/helpers/peaksSearchState";
import convertPeaksToGeoJSON from "@/helpers/convertPeaksToGeoJSON";
import { waitForMapSource, clearMapSource } from "@/lib/map/waitForMapSource";
import Peak from "@/typeDefs/Peak";
import mapboxgl from "mapbox-gl";

interface UseProfilePeaksMapEffectsOptions {
    peaks: Peak[] | null;
    isActive: boolean;
}

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
                clearMapSource(map, "selectedPeaks");
            }
            return;
        }

        const setProfilePeaksOnMap = async () => {
            const selectedPeaksSource = await waitForMapSource(map, "selectedPeaks", { maxAttempts: 10 });
            if (selectedPeaksSource) {
                selectedPeaksSource.setData(convertPeaksToGeoJSON(peaks));
            }

            // Move selectedPeaks layer to the top
            if (map.getLayer("selectedPeaks")) {
                map.moveLayer("selectedPeaks");
            }
        };

        setProfilePeaksOnMap();

        return () => {
            clearMapSource(map, "selectedPeaks");
        };
    }, [map, peaks, isActive]);
}

