"use client";

import { useEffect, useCallback, useRef } from "react";
import { useMapStore } from "@/providers/MapProvider";
import convertPeaksToGeoJSON from "@/helpers/convertPeaksToGeoJSON";
import convertActivitiesToGeoJSON from "@/helpers/convertActivitiesToGeoJSON";
import { waitForMapSource, waitForMapSources, clearMapSources } from "@/lib/map/waitForMapSource";
import Activity from "@/typeDefs/Activity";
import Peak from "@/typeDefs/Peak";
import mapboxgl from "mapbox-gl";

interface UseActivityMapEffectsOptions {
    activity: Activity | null | undefined;
    peakSummits?: Peak[] | null;
    hoverCoords?: [number, number] | null;
    flyToOnLoad?: boolean;
}

/**
 * Hook to handle map effects when viewing an activity detail.
 * - Displays the activity GPX line on the map
 * - Shows large markers for summitted peaks
 * - Handles hover marker from elevation profile
 * - Handles hover highlighting of peaks from summit list (via mapStore.hoveredPeakId)
 * - Fits map bounds to activity route
 * 
 * Note: Map padding is controlled by MapBackground based on drawer height, not here.
 */
export function useActivityMapEffects({
    activity,
    peakSummits,
    hoverCoords,
    flyToOnLoad = true,
}: UseActivityMapEffectsOptions) {
    const map = useMapStore((state) => state.map);
    const hoveredPeakId = useMapStore((state) => state.hoveredPeakId);
    const setHoveredPeakId = useMapStore((state) => state.setHoveredPeakId);
    const previousHoveredPeakIdRef = useRef<string | null>(null);
    const previousPeakSummitsRef = useRef<Peak[] | null>(null);
    const hasFittedBoundsRef = useRef(false);
    const previousActivityIdRef = useRef<string | null>(null);

    // Fit map to activity bounds on load (only once per activity)
    useEffect(() => {
        if (!activity?.coords || !map || !flyToOnLoad) return;
        if (activity.coords.length === 0) return;

        // Check if this is a different activity
        const currentActivityId = activity.id;
        if (previousActivityIdRef.current !== currentActivityId) {
            // New activity, reset the fitBounds flag
            hasFittedBoundsRef.current = false;
            previousActivityIdRef.current = currentActivityId;
        }

        // Only fit bounds once per activity
        if (hasFittedBoundsRef.current) return;

        // Calculate bounds from coordinates
        const bounds = new mapboxgl.LngLatBounds();
        activity.coords.forEach((coord) => {
            bounds.extend(coord as [number, number]);
        });

        map.fitBounds(bounds, {
            maxZoom: 14,
        });

        hasFittedBoundsRef.current = true;
    }, [activity?.coords, activity?.id, map, flyToOnLoad]);

    // Display activity GPX line on the map
    useEffect(() => {
        if (!map || !activity) return;

        const setActivityOnMap = async () => {
            const sources = await waitForMapSources(map, ["activities", "activityStarts"]);
            if (sources.activities && sources.activityStarts) {
                const [lineStrings, starts] = convertActivitiesToGeoJSON([activity]);
                sources.activities.setData(lineStrings);
                sources.activityStarts.setData(starts);
            }
        };

        setActivityOnMap();

        return () => {
            clearMapSources(map, ["activities", "activityStarts"]);
        };
    }, [map, activity]);

    // Show peak markers for summitted peaks
    useEffect(() => {
        if (!map) return;

        // Check if peakSummits has actually changed by comparing peak IDs
        const currentPeakIds = peakSummits?.map(p => p.id).sort().join(',') ?? '';
        const previousPeakIds = previousPeakSummitsRef.current?.map(p => p.id).sort().join(',') ?? '';
        
        // Only update if the peak IDs have changed
        if (currentPeakIds === previousPeakIds && previousPeakSummitsRef.current !== null) {
            return;
        }

        if (!peakSummits || peakSummits.length === 0) {
            // Only clear peaks if we're actually viewing an activity (not a peak/challenge)
            if (activity) {
                const peaksSource = map.getSource("selectedPeaks") as mapboxgl.GeoJSONSource | undefined;
                if (peaksSource) {
                    try {
                        peaksSource.setData({
                            type: "FeatureCollection",
                            features: [],
                        });
                    } catch (error) {
                        console.debug("Failed to clear selectedPeaks:", error);
                    }
                }
            }
            previousPeakSummitsRef.current = null;
            return;
        }

        const setPeaksOnMap = async () => {
            const peaksSource = await waitForMapSource(map, "selectedPeaks");
            if (peaksSource) {
                peaksSource.setData(convertPeaksToGeoJSON(peakSummits));
                previousPeakSummitsRef.current = peakSummits;
            }
        };

        setPeaksOnMap();

        // Cleanup: clear peaks when unmounting (only if viewing an activity)
        return () => {
            if (!map || !activity) return;

            try {
                const peaksSource = map.getSource("selectedPeaks") as mapboxgl.GeoJSONSource | undefined;
                if (peaksSource) {
                    peaksSource.setData({
                        type: "FeatureCollection",
                        features: [],
                    });
                }
                previousPeakSummitsRef.current = null;
            } catch (error) {
                console.debug("Failed to cleanup selectedPeaks map source:", error);
            }
        };
    }, [map, peakSummits, activity]);

    // Handle hover marker from elevation profile
    useEffect(() => {
        if (!map) return;

        const setHoverMarker = async () => {
            // Check if activityHover source exists, if not we might need to create it
            let hoverSource = map.getSource("activityHover") as mapboxgl.GeoJSONSource | undefined;
            
            // If source doesn't exist and we have hover coords, try to add it
            if (!hoverSource && hoverCoords) {
                try {
                    map.addSource("activityHover", {
                        type: "geojson",
                        data: {
                            type: "FeatureCollection",
                            features: [],
                        },
                    });

                    map.addLayer({
                        id: "activityHover",
                        type: "circle",
                        source: "activityHover",
                        paint: {
                            "circle-radius": 8,
                            "circle-color": "#3d6b47", // Primary green color
                            "circle-stroke-width": 3,
                            "circle-stroke-color": "#1a1a1a", // Dark background
                        },
                    });

                    hoverSource = map.getSource("activityHover") as mapboxgl.GeoJSONSource | undefined;
                } catch (error) {
                    // Source might already exist, try to get it again
                    hoverSource = map.getSource("activityHover") as mapboxgl.GeoJSONSource | undefined;
                }
            }

            if (hoverSource) {
                if (hoverCoords) {
                    hoverSource.setData({
                        type: "FeatureCollection",
                        features: [{
                            type: "Feature",
                            geometry: {
                                type: "Point",
                                coordinates: hoverCoords,
                            },
                            properties: {},
                        }],
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

    // Handle hover highlighting of peaks from summit list using feature-state
    useEffect(() => {
        if (!map) return;

        const source = map.getSource("selectedPeaks");
        if (!source) return;

        // Clear previous hover state
        if (previousHoveredPeakIdRef.current) {
            try {
                map.setFeatureState(
                    { source: "selectedPeaks", id: previousHoveredPeakIdRef.current },
                    { hover: false }
                );
            } catch (error) {
                // Feature may no longer exist, ignore
            }
        }

        // Set new hover state
        if (hoveredPeakId) {
            try {
                map.setFeatureState(
                    { source: "selectedPeaks", id: hoveredPeakId },
                    { hover: true }
                );
            } catch (error) {
                console.debug("Failed to set hover state for peak:", hoveredPeakId, error);
            }
        }

        // Update ref for next render
        previousHoveredPeakIdRef.current = hoveredPeakId ?? null;
    }, [map, hoveredPeakId]);

    // Cleanup hover source, feature states, and map padding on unmount
    useEffect(() => {
        return () => {
            // Clear hoveredPeakId in store on unmount
            setHoveredPeakId(null);

            if (!map) return;

            try {
                // Clear any remaining hover state on map
                if (previousHoveredPeakIdRef.current) {
                    map.setFeatureState(
                        { source: "selectedPeaks", id: previousHoveredPeakIdRef.current },
                        { hover: false }
                    );
                }

                if (map.getLayer("activityHover")) {
                    map.removeLayer("activityHover");
                }
                if (map.getSource("activityHover")) {
                    map.removeSource("activityHover");
                }

                // Trigger peaks refresh when panel closes
                // Note: Don't reset map padding here - it's controlled by MapBackground based on drawer height
                setTimeout(() => {
                    map.fire("moveend");
                }, 50);
            } catch (error) {
                console.debug("Failed to cleanup activityHover map source:", error);
            }
        };
    }, [map, setHoveredPeakId]);

    // Manual fly to activity function
    const flyToActivity = useCallback(() => {
        if (!activity?.coords || !map || activity.coords.length === 0) return;

        const bounds = new mapboxgl.LngLatBounds();
        activity.coords.forEach((coord) => {
            bounds.extend(coord as [number, number]);
        });

        map.fitBounds(bounds, {
            maxZoom: 14,
        });
    }, [activity?.coords, map]);

    return { flyToActivity };
}

