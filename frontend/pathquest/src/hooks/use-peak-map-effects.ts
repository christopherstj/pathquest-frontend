"use client";

import { useEffect, useCallback } from "react";
import { useMapStore } from "@/providers/MapProvider";
import convertPeaksToGeoJSON from "@/helpers/convertPeaksToGeoJSON";
import convertActivitiesToGeoJSON from "@/helpers/convertActivitiesToGeoJSON";
import { waitForMapSource, waitForMapSources, clearMapSource, clearMapSources } from "@/lib/map/waitForMapSource";
import Peak from "@/typeDefs/Peak";
import Activity from "@/typeDefs/Activity";

interface UsePeakMapEffectsOptions {
    peak: Peak | null | undefined;
    activities?: Activity[] | null;
    flyToOnLoad?: boolean;
    padding?: { top: number; bottom: number; left: number; right: number };
}

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
                padding: padding,
                essential: true,
            });
        }
    }, [peak?.location_coords, map, flyToOnLoad, padding]);

    // Set selected peak on map with larger icon
    useEffect(() => {
        if (!map || !peak) return;

        const setSelectedPeakSource = async () => {
            const peaksSource = await waitForMapSource(map, "selectedPeaks");
            if (peaksSource) {
                peaksSource.setData(convertPeaksToGeoJSON([peak]));
            }
        };

        setSelectedPeakSource();

        return () => {
            clearMapSource(map, "selectedPeaks");
        };
    }, [map, peak]);

    // Display activity GPX lines on the map
    useEffect(() => {
        if (!map || !activities || activities.length === 0) return;

        const setActivitiesOnMap = async () => {
            const sources = await waitForMapSources(map, ["activities", "activityStarts"]);
            if (sources.activities && sources.activityStarts) {
                const [lineStrings, starts] = convertActivitiesToGeoJSON(activities);
                sources.activities.setData(lineStrings);
                sources.activityStarts.setData(starts);
            }
        };

        setActivitiesOnMap();

        return () => {
            clearMapSources(map, ["activities", "activityStarts"]);
        };
    }, [map, activities]);

    // Manual fly to peak function
    const flyToPeak = useCallback(() => {
        if (peak?.location_coords && map) {
            map.flyTo({
                center: peak.location_coords,
                zoom: 14,
                padding: padding,
                essential: true,
            });
        }
    }, [peak?.location_coords, map, padding]);

    return { flyToPeak };
}


