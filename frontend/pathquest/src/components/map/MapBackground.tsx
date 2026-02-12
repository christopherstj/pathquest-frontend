"use client";

import React, { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMapStore } from "@/providers/MapProvider";
import getNewData from "@/helpers/getNewData";
import { useRouter, useSearchParams } from "next/navigation";
import { searchChallengesClient } from "@/lib/client/searchChallengesClient";
import { useRouterRef } from "@/hooks/use-stable-ref";
import { useMapPadding } from "@/hooks/use-map-padding";
import getMapStateFromURL from "@/helpers/getMapStateFromURL";
import updateMapURL from "@/helpers/updateMapURL";
import getTrueMapCenter from "@/helpers/getTrueMapCenter";
import { getMapboxToken } from "@/lib/map/getMapboxToken";
import { useInitialMapLocation } from "@/hooks/use-initial-map-location";
import renderPopup from "@/lib/map/renderPopup";
import { PeakMarkerPopup } from "@/components/map/PeakMarkerPopup";

// Debounce utility function
const debounce = <T extends (...args: any[]) => any>(
    fn: T,
    delay: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<T>) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

// Default map center (Boulder, CO)
const DEFAULT_CENTER: [number, number] = [-105.2705, 40.015];
const DEFAULT_ZOOM = 11;
const DEFAULT_PITCH_2D = 0;
const DEFAULT_PITCH_3D = 45;
const DEFAULT_BEARING = 0;

// Minimum zoom level for searching peaks/challenges
const MIN_SEARCH_ZOOM = 7;

const MapBackground = () => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapInitialized = useRef(false);
    const setMap = useMapStore((state) => state.setMap);
    const setVisiblePeaks = useMapStore((state) => state.setVisiblePeaks);
    const setVisibleChallenges = useMapStore((state) => state.setVisibleChallenges);
    const setIsZoomedOutTooFar = useMapStore((state) => state.setIsZoomedOutTooFar);
    const map = useMapStore((state) => state.map);
    const isSatellite = useMapStore((state) => state.isSatellite);
    const setIsSatellite = useMapStore((state) => state.setIsSatellite);
    const is3D = useMapStore((state) => state.is3D);
    const router = useRouter();
    const searchParams = useSearchParams();
    const isInitialStyleSet = useRef(false);
    const isInitial3DSet = useRef(false);
    // Initialize as false to suppress URL writes until location is resolved
    const isUserInteraction = useRef(false);
    // Track if we've already handled location resolution
    const hasResolvedLocation = useRef(false);
    
    // Get initial map location with fallback chain:
    // URL params → browser geolocation → IP geolocation → default (Boulder)
    // Note: User profile location_coords could be passed here if UserProvider is added to layout
    const initialLocation = useInitialMapLocation();
    
    // Use refs for callbacks to avoid them being dependencies
    const routerRef = useRouterRef(router);
    const setMapRef = useRef(setMap);
    const setVisiblePeaksRef = useRef(setVisiblePeaks);
    const setVisibleChallengesRef = useRef(setVisibleChallenges);
    const setIsZoomedOutTooFarRef = useRef(setIsZoomedOutTooFar);
    
    // Active popup ref - allows closing previous popup when a new one is opened
    const activePopupRef = useRef<mapboxgl.Popup | null>(null);
    
    // Ref to track is3D state for use in map initialization and effects
    const is3DRef = useRef(is3D);
    
    // Keep store function refs up to date
    useEffect(() => {
        setMapRef.current = setMap;
        setVisiblePeaksRef.current = setVisiblePeaks;
        setVisibleChallengesRef.current = setVisibleChallenges;
        setIsZoomedOutTooFarRef.current = setIsZoomedOutTooFar;
        is3DRef.current = is3D;
    });

    // Map padding based on UI layout (mobile drawer / desktop panel)
    useMapPadding({ map });

    const fetchVisibleChallenges = useCallback(async (mapInstance: mapboxgl.Map) => {
        // Don't search when zoomed out too far (prevents massive result sets)
        const zoom = mapInstance.getZoom();
        if (zoom < MIN_SEARCH_ZOOM) {
            setVisibleChallengesRef.current([]);
            return;
        }

        const bounds = mapInstance.getBounds();
        if (!bounds) return;

        const nw = bounds.getNorthWest();
        const se = bounds.getSouthEast();

        try {
            const challenges = await searchChallengesClient({
                bounds: {
                    nw: { lat: nw.lat, lng: nw.lng },
                    se: { lat: se.lat, lng: se.lng },
                },
            });
            setVisibleChallengesRef.current(challenges);
        } catch (error) {
            console.error("Failed to fetch visible challenges:", error);
            setVisibleChallengesRef.current([]);
        }
    }, []);

    /**
     * Opens a peak marker popup for the given feature.
     * Closes any previously open popup first.
     * Extracts peak data from feature.properties and renders PeakMarkerPopup.
     */
    const openPeakPopup = useCallback((feature: mapboxgl.MapboxGeoJSONFeature, mapInstance: mapboxgl.Map) => {
        const props = feature.properties;
        const id = props?.id;
        if (!id) return;

        const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number];

        // Mapbox feature properties can be strings; normalize to numbers where needed
        const name = props?.name as string | undefined;
        const elevationRaw = props?.elevation;
        const publicSummitsRaw = props?.public_summits;
        // User summits can come from summits, summit_count, or ascents (already normalized in convertPeaksToGeoJSON)
        const userSummitsRaw = props?.summits ?? props?.summit_count;

        const elevation = elevationRaw != null ? Number(elevationRaw) : undefined;
        const publicSummits = publicSummitsRaw != null ? Number(publicSummitsRaw) : undefined;
        const userSummits = userSummitsRaw != null ? Number(userSummitsRaw) : undefined;

        // Location fields
        const county = props?.county as string | undefined;
        const state = props?.state as string | undefined;
        const country = props?.country as string | undefined;

        // Challenge info
        const numChallengesRaw = props?.num_challenges;
        const numChallenges = numChallengesRaw != null ? Number(numChallengesRaw) : undefined;

        // Close any existing popup
        activePopupRef.current?.remove();

        // Render new popup
        activePopupRef.current = renderPopup(
            mapInstance,
            coords,
            <PeakMarkerPopup
                name={name}
                elevation={Number.isFinite(elevation) ? elevation : undefined}
                county={county}
                state={state}
                country={country}
                publicSummits={Number.isFinite(publicSummits) ? publicSummits : undefined}
                userSummits={Number.isFinite(userSummits) ? userSummits : undefined}
                numChallenges={Number.isFinite(numChallenges) ? numChallenges : undefined}
                onDetails={() => {
                    activePopupRef.current?.remove();
                    routerRef.current.push(`/peaks/${id}`);
                }}
            />
        );
    }, [routerRef]);

    useEffect(() => {
        // Skip the initial render - only apply style changes after user interaction
        if (!map) return;
        if (!isInitialStyleSet.current) {
            isInitialStyleSet.current = true;
            return;
        }
        
        map.setStyle(
            isSatellite
                ? "mapbox://styles/mapbox/satellite-streets-v12"
                : "mapbox://styles/mapbox/outdoors-v12"
        );
    }, [isSatellite, map]);

    // Toggle 3D terrain when is3D state changes
    useEffect(() => {
        if (!map) return;

        // Skip initial render to avoid overriding URL pitch
        if (!isInitial3DSet.current) {
            isInitial3DSet.current = true;
            return;
        }

        // Wait for style to be loaded before modifying sources/layers
        if (!map.isStyleLoaded()) {
            // If style isn't loaded yet, wait for it
            const handleStyleLoad = () => {
                applyTerrainSettings();
            };
            map.once('style.load', handleStyleLoad);
            return () => {
                map.off('style.load', handleStyleLoad);
            };
        }
        
        applyTerrainSettings();
        
        function applyTerrainSettings() {
            if (!map) return;
            // Ensure DEM source exists
            if (!map.getSource('mapbox-dem')) {
                map.addSource('mapbox-dem', {
                    'type': 'raster-dem',
                    'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
                    'tileSize': 512,
                    'maxzoom': 14
                });
            }
            
            if (is3D) {
                // Enable 3D terrain
                map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
                
                // Add sky layer if not present
                if (!map.getLayer('sky')) {
                    map.addLayer({
                        'id': 'sky',
                        'type': 'sky',
                        'paint': {
                            'sky-type': 'atmosphere',
                            'sky-atmosphere-sun': [0.0, 0.0],
                            'sky-atmosphere-sun-intensity': 15
                        }
                    });
                }
                
                // Animate to 3D pitch
                map.easeTo({ pitch: DEFAULT_PITCH_3D, duration: 500 });
            } else {
                // Disable 3D terrain
                map.setTerrain(null);
                
                // Remove sky layer if present
                if (map.getLayer('sky')) {
                    map.removeLayer('sky');
                }
                
                // Animate to flat pitch
                map.easeTo({ pitch: DEFAULT_PITCH_2D, duration: 500 });
            }
        }
    }, [is3D, map]);

    // Handle flying to resolved location after location hook completes
    // This runs once after the location fallback chain resolves
    useEffect(() => {
        if (!map || initialLocation.isLoading || hasResolvedLocation.current) return;
        
        hasResolvedLocation.current = true;
        
        // If we got location from URL, it's already set - no need to fly
        // For all other sources, fly to the resolved location
        if (initialLocation.source !== "url") {
            // Suppress URL write during the fly animation
            isUserInteraction.current = false;
            map.flyTo({
                center: initialLocation.center,
                zoom: initialLocation.zoom,
                pitch: DEFAULT_PITCH_2D, // Default to 2D
                essential: true,
            });
        } else {
            // URL source - enable user interactions immediately
            isUserInteraction.current = true;
        }
    }, [map, initialLocation]);

    const fetchPeaks = useCallback(async () => {
        if (!map) return;
        await getNewData(
            "", // search
            true, // limitResultsToBbox
            setVisiblePeaksRef.current, // Update store with visible peaks
            map
        );
        fetchVisibleChallenges(map);
    }, [map, fetchVisibleChallenges]);

    useEffect(() => {
        // Prevent double initialization (React Strict Mode or re-renders)
        if (mapInitialized.current || !mapContainer.current) return;
        mapInitialized.current = true;

        // Read initial map state from URL
        const mapState = getMapStateFromURL(searchParams);
        const initialCenter = mapState.center ?? DEFAULT_CENTER;
        const initialZoom = mapState.zoom ?? DEFAULT_ZOOM;
        const initialPitch = mapState.pitch || DEFAULT_PITCH_2D; // Default to 2D (flat)
        const initialBearing = mapState.bearing || DEFAULT_BEARING;
        const initialSatellite = mapState.isSatellite;

        // Set satellite state from URL
        if (initialSatellite) {
            setIsSatellite(true);
        }

        mapboxgl.accessToken = getMapboxToken();
        // Ensure container is empty before Mapbox initializes
        mapContainer.current.replaceChildren();

        const newMap = new mapboxgl.Map({
            container: mapContainer.current,
            style: initialSatellite 
                ? "mapbox://styles/mapbox/satellite-streets-v12"
                : "mapbox://styles/mapbox/outdoors-v12",
            center: initialCenter,
            zoom: initialZoom,
            pitch: initialPitch,
            bearing: initialBearing,
            antialias: true, // For 3D terrain
            projection: { name: 'globe' } as any
        });

        newMap.on("style.load", () => {
            // Add terrain DEM source (needed for both 2D contours and 3D terrain)
            if (!newMap.getSource('mapbox-dem')) {
                newMap.addSource('mapbox-dem', {
                    'type': 'raster-dem',
                    'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
                    'tileSize': 512,
                    'maxzoom': 14
                });
            }
            
            // Only enable 3D terrain and sky layer if is3D is true
            if (is3DRef.current) {
                newMap.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
                
                // Add Sky layer for atmosphere
                if (!newMap.getLayer('sky')) {
                    newMap.addLayer({
                        'id': 'sky',
                        'type': 'sky',
                        'paint': {
                            'sky-type': 'atmosphere',
                            'sky-atmosphere-sun': [0.0, 0.0],
                            'sky-atmosphere-sun-intensity': 15
                        }
                    });
                }
            }

            // Peaks Source
            if (!newMap.getSource("peaks")) {
                newMap.addSource("peaks", {
                    type: "geojson",
                    data: {
                        type: "FeatureCollection",
                        features: []
                    },
                    cluster: true,
                    clusterMaxZoom: 12,
                    clusterRadius: 50
                });
            }

            // Peaks Clusters
            if (!newMap.getLayer("peaks-clusters")) {
                newMap.addLayer({
                    id: "peaks-clusters",
                    type: "circle",
                    source: "peaks",
                    filter: ["has", "point_count"],
                    paint: {
                        "circle-color": "#3b5d43", // forest
                        "circle-radius": [
                            "step",
                            ["get", "point_count"],
                            20,
                            100,
                            30,
                            750,
                            40
                        ],
                        "circle-opacity": 0.75,
                        "circle-stroke-width": 2,
                        "circle-stroke-color": "#e8dfc9"
                    }
                });
            }

            if (!newMap.getLayer("cluster-count")) {
                newMap.addLayer({
                    id: "cluster-count",
                    type: "symbol",
                    source: "peaks",
                    filter: ["has", "point_count"],
                    layout: {
                        "text-field": "{point_count_abbreviated}",
                        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                        "text-size": 12
                    },
                    paint: {
                        "text-color": "#f6f1e4"
                    }
                });
            }

            // Unclustered Peaks (Individual Points)
            // Uses properties.summits for summit-based coloring (blue=summited, green=unsummited)
            if (!newMap.getLayer("peaks-point")) {
                newMap.addLayer({
                    id: "peaks-point",
                    type: "circle",
                    source: "peaks",
                    filter: ["!", ["has", "point_count"]],
                    paint: {
                        // Summit-based color: blue if summited, green otherwise
                        "circle-color": [
                            "case",
                            [">", ["coalesce", ["get", "summits"], 0], 0],
                            "#5b9bd5", // Summited: sky blue
                            "#4d7a57"  // Not summited: muted green
                        ],
                        "circle-radius": 7,
                        "circle-stroke-width": 2,
                        "circle-stroke-color": "#e8dfc9",
                        "circle-opacity": 0.85
                    }
                });
            }

            // Invisible hitbox layer for more reliable clicking on small dots (especially with pitch/terrain)
            // This does not affect visuals but increases the interactive target size.
            if (!newMap.getLayer("peaks-point-hitbox")) {
                newMap.addLayer({
                    id: "peaks-point-hitbox",
                    type: "circle",
                    source: "peaks",
                    filter: ["!", ["has", "point_count"]],
                    paint: {
                        "circle-radius": 14,
                        "circle-color": "rgba(0,0,0,0)",
                        "circle-stroke-width": 0,
                        "circle-opacity": 1
                    }
                });
            }

            // Activities Source (for GPX lines from user activities)
            // Added FIRST so it renders below peak markers
            if (!newMap.getSource("activities")) {
                newMap.addSource("activities", {
                    type: "geojson",
                    data: {
                        type: "FeatureCollection",
                        features: []
                    }
                });
            }

            // Activities Layer (line for GPX tracks)
            if (!newMap.getLayer("activities")) {
                newMap.addLayer({
                    id: "activities",
                    type: "line",
                    source: "activities",
                    paint: {
                        "line-color": "#c9915a",
                        "line-width": 3,
                        "line-opacity": 0.85
                    },
                    layout: {
                        "line-cap": "round",
                        "line-join": "round"
                    }
                });
            }

            // Activity Starts Source (for start point markers)
            if (!newMap.getSource("activityStarts")) {
                newMap.addSource("activityStarts", {
                    type: "geojson",
                    data: {
                        type: "FeatureCollection",
                        features: []
                    }
                });
            }

            // Activity Starts Layer (circle for start points)
            if (!newMap.getLayer("activityStarts")) {
                newMap.addLayer({
                    id: "activityStarts",
                    type: "circle",
                    source: "activityStarts",
                    paint: {
                        "circle-color": "#22c55e",
                        "circle-radius": 6,
                        "circle-stroke-width": 2,
                        "circle-stroke-color": "#ffffff",
                        "circle-opacity": 0.9
                    }
                });
            }

            // Selected Peaks Source (for challenge detail, peak detail, activity detail - displays with larger icons)
            // Added AFTER activities so peaks render on top of GPX tracks
            if (!newMap.getSource("selectedPeaks")) {
                newMap.addSource("selectedPeaks", {
                    type: "geojson",
                    data: {
                        type: "FeatureCollection",
                        features: []
                    },
                    // promoteId allows setFeatureState to work with string IDs from feature properties
                    promoteId: "id"
                });
            }

            // Selected Peaks Layer (larger markers for highlighted peaks)
            // Uses properties.summits for summit-based coloring (blue=summited, green=unsummited)
            // Hover/selection only affects stroke and radius, NOT fill color
            if (!newMap.getLayer("selectedPeaks")) {
                newMap.addLayer({
                    id: "selectedPeaks",
                    type: "circle",
                    source: "selectedPeaks",
                    paint: {
                        // Fill color is STRICTLY blue/green based on summit status
                        // (hover does NOT change fill color per unified styling rule)
                        "circle-color": [
                            "case",
                            [">", ["coalesce", ["get", "summits"], 0], 0],
                            "#5b9bd5", // Summited: sky blue
                            "#4d7a57"  // Not summited: muted green
                        ],
                        // Radius matches discovery peaks size (7px), only increases on hover
                        "circle-radius": [
                            "case",
                            ["boolean", ["feature-state", "hover"], false],
                            10, // Hover: larger
                            7   // Default: match discovery peaks size
                        ],
                        // Stroke color changes on hover (accent ring)
                        "circle-stroke-color": [
                            "case",
                            ["boolean", ["feature-state", "hover"], false],
                            "#d66ba0", // Hover: pink/amber accent ring
                            "#e8dfc9"  // Default: parchment
                        ],
                        // Stroke width increases on hover
                        "circle-stroke-width": [
                            "case",
                            ["boolean", ["feature-state", "hover"], false],
                            4,  // Hover: thicker ring
                            3   // Default
                        ],
                        "circle-opacity": 0.95
                    }
                });
            }

            // Invisible hitbox for selected peaks as well (keeps click behavior consistent and reliable)
            if (!newMap.getLayer("selectedPeaks-hitbox")) {
                newMap.addLayer({
                    id: "selectedPeaks-hitbox",
                    type: "circle",
                    source: "selectedPeaks",
                    paint: {
                        "circle-radius": 14,
                        "circle-color": "rgba(0,0,0,0)",
                        "circle-stroke-width": 0,
                        "circle-opacity": 1
                    }
                });
            }
            
            // Trigger initial fetch
            // We need to wait for map to be ready, which style.load implies, 
            // but fetching logic uses map instance which is set in state later? 
            // Actually getNewData uses the map instance passed to it.
            // We can call it here using newMap.
            getNewData("", true, setVisiblePeaksRef.current, newMap);
            fetchVisibleChallenges(newMap);
        });

        // Interactions - click opens popup, not direct navigation
        // Use hitbox layers so clicks are reliable even with small dots / pitch / 3D terrain.
        newMap.on("click", "peaks-point-hitbox", (e) => {
            const feature = e.features?.[0];
            if (feature) {
                openPeakPopup(feature, newMap);
            }
        });

        newMap.on("click", "peaks-clusters", (e) => {
            const features = newMap.queryRenderedFeatures(e.point, {
                layers: ["peaks-clusters"]
            });
            const clusterId = features[0].properties?.cluster_id;
            const source = newMap.getSource("peaks") as mapboxgl.GeoJSONSource;
            source.getClusterExpansionZoom(clusterId, (err, zoom) => {
                if (err || zoom === null || zoom === undefined) return;
                
                // Mark as programmatic navigation
                isUserInteraction.current = false;
                const coordinates = (features[0].geometry as any).coordinates;
                newMap.easeTo({
                    center: coordinates,
                    zoom: zoom,
                    essential: true
                });
            });
        });

        newMap.on("mouseenter", "peaks-point-hitbox", () => {
            newMap.getCanvas().style.cursor = "pointer";
        });
        newMap.on("mouseleave", "peaks-point-hitbox", () => {
            newMap.getCanvas().style.cursor = "";
        });

        // Selected peaks interactions (for challenge/activity/profile detail views)
        // Click opens popup with peak info; Details button navigates
        newMap.on("click", "selectedPeaks-hitbox", (e) => {
            const feature = e.features?.[0];
            if (feature) {
                openPeakPopup(feature, newMap);
            }
        });
        newMap.on("mouseenter", "selectedPeaks-hitbox", () => {
            newMap.getCanvas().style.cursor = "pointer";
        });
        newMap.on("mouseleave", "selectedPeaks-hitbox", () => {
            newMap.getCanvas().style.cursor = "";
        });

        // Debounced data fetching to prevent excessive API calls during map movement
        const debouncedFetchData = debounce(() => {
            const zoom = newMap.getZoom();
            const isZoomedOut = zoom < MIN_SEARCH_ZOOM;
            setIsZoomedOutTooFarRef.current(isZoomedOut);
            
            getNewData("", true, setVisiblePeaksRef.current, newMap);
            fetchVisibleChallenges(newMap);
        }, 300);

        // Debounced URL update (separate from data fetching for better UX)
        // Uses getTrueMapCenter to account for padding offset, preventing map jump
        // when navigating between routes with different padding
        const debouncedUpdateURL = debounce(() => {
            if (isUserInteraction.current) {
                // Get the true center accounting for any padding applied
                const center = getTrueMapCenter(newMap);
                updateMapURL(
                    {
                        center: { lng: center.lng, lat: center.lat },
                        zoom: newMap.getZoom(),
                        pitch: newMap.getPitch(),
                        bearing: newMap.getBearing(),
                    },
                    routerRef.current
                );
            }
            isUserInteraction.current = true;
        }, 500);

        // Move end listener to refetch and update URL (debounced)
        newMap.on("moveend", () => {
            debouncedFetchData();
            debouncedUpdateURL();
        });

        setMapRef.current(newMap);

        return () => {
            newMap.remove();
            mapInitialized.current = false;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="absolute inset-0 z-0 w-full h-full" aria-hidden="true">
            <div 
                ref={mapContainer} 
                className="w-full h-full"
            />
        </div>
    );
};

export default MapBackground;

