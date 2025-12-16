"use client";

import { useEffect, useCallback } from "react";
import { useMapStore } from "@/providers/MapProvider";
import convertPeaksToGeoJSON from "@/helpers/convertPeaksToGeoJSON";
import convertActivitiesToGeoJSON from "@/helpers/convertActivitiesToGeoJSON";
import Peak from "@/typeDefs/Peak";
import Activity from "@/typeDefs/Activity";
import mapboxgl from "mapbox-gl";

interface UsePeakMapEffectsOptions {
    peak: Peak | null | undefined;
    activities?: Activity[] | null;
    flyToOnLoad?: boolean;
    padding?: { top: number; bottom: number; left: number; right: number };
}

const MAX_ATTEMPTS = 5;
const RETRY_DELAY = 300;

/**
 * Hook to handle map effects when viewing a peak detail.
 * - Sets the selected peak on the map (larger marker)
 * - Displays activity GPX lines
 * - Flies to the peak location
 */
export function usePeakMapEffects({
    peak,
    activities,
    flyToOnLoad = true,
    padding,
}: UsePeakMapEffectsOptions) {
    const map = useMapStore((state) => state.map);

    // Fly to peak location
    useEffect(() => {
        if (peak?.location_coords && map && flyToOnLoad) {
            map.flyTo({
                center: peak.location_coords,
                zoom: 13,
                pitch: 50,
                bearing: 20,
                padding: padding,
                essential: true,
            });
        }
    }, [peak?.location_coords, map, flyToOnLoad, padding]);

    // Set selected peak on map with larger icon
    useEffect(() => {
        if (!map || !peak) return;

        const setSelectedPeakSource = async () => {
            let peaksSource = map.getSource("selectedPeaks") as mapboxgl.GeoJSONSource | undefined;
            let attempts = 0;

            while (!peaksSource && attempts < MAX_ATTEMPTS) {
                attempts++;
                await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
                peaksSource = map.getSource("selectedPeaks") as mapboxgl.GeoJSONSource | undefined;
            }

            if (peaksSource) {
                peaksSource.setData(convertPeaksToGeoJSON([peak]));
            }
        };

        setSelectedPeakSource();

        // Cleanup: clear selected peak when unmounting
        return () => {
            if (!map) return;

            try {
                const peaksSource = map.getSource("selectedPeaks") as mapboxgl.GeoJSONSource | undefined;
                if (peaksSource) {
                    peaksSource.setData({
                        type: "FeatureCollection",
                        features: [],
                    });
                }
            } catch (error) {
                console.debug("Failed to cleanup selectedPeaks map source:", error);
            }
        };
    }, [map, peak]);

    // Display activity GPX lines on the map
    useEffect(() => {
        if (!map || !activities || activities.length === 0) return;

        const setActivitiesOnMap = async () => {
            let activitiesSource = map.getSource("activities") as mapboxgl.GeoJSONSource | undefined;
            let activityStartsSource = map.getSource("activityStarts") as mapboxgl.GeoJSONSource | undefined;
            let attempts = 0;

            while ((!activitiesSource || !activityStartsSource) && attempts < MAX_ATTEMPTS) {
                attempts++;
                await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
                activitiesSource = map.getSource("activities") as mapboxgl.GeoJSONSource | undefined;
                activityStartsSource = map.getSource("activityStarts") as mapboxgl.GeoJSONSource | undefined;
            }

            if (activitiesSource && activityStartsSource) {
                const [lineStrings, starts] = convertActivitiesToGeoJSON(activities);
                activitiesSource.setData(lineStrings);
                activityStartsSource.setData(starts);
            }
        };

        setActivitiesOnMap();

        // Cleanup: clear activities when unmounting
        return () => {
            if (!map) return;

            try {
                const activitiesSource = map.getSource("activities") as mapboxgl.GeoJSONSource | undefined;
                const activityStartsSource = map.getSource("activityStarts") as mapboxgl.GeoJSONSource | undefined;

                if (activitiesSource) {
                    activitiesSource.setData({
                        type: "FeatureCollection",
                        features: [],
                    });
                }
                if (activityStartsSource) {
                    activityStartsSource.setData({
                        type: "FeatureCollection",
                        features: [],
                    });
                }
            } catch (error) {
                console.debug("Failed to cleanup activities map source:", error);
            }
        };
    }, [map, activities]);

    // Manual fly to peak function
    const flyToPeak = useCallback(() => {
        if (peak?.location_coords && map) {
            map.flyTo({
                center: peak.location_coords,
                zoom: 14,
                pitch: 60,
                bearing: 30,
                padding: padding,
                essential: true,
            });
        }
    }, [peak?.location_coords, map, padding]);

    return { flyToPeak };
}


