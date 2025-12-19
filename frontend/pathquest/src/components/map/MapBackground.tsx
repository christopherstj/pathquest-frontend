"use client";

import React, { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMapStore } from "@/providers/MapProvider";
import getNewData from "@/helpers/getNewData";
import { useRouter, useSearchParams } from "next/navigation";
import { searchChallengesClient } from "@/lib/client/searchChallengesClient";
import { useIsMobile } from "@/hooks/use-mobile";
import getMapStateFromURL from "@/helpers/getMapStateFromURL";
import updateMapURL from "@/helpers/updateMapURL";
import getTrueMapCenter from "@/helpers/getTrueMapCenter";
import { getMapboxToken } from "@/lib/map/getMapboxToken";
import { useTabStore, type DrawerHeight } from "@/store/tabStore";
import { useInitialMapLocation } from "@/hooks/use-initial-map-location";

// Heights for drawer (same as ContentSheet) - used for map padding on mobile
const DRAWER_HEIGHTS = {
    collapsed: 60,
    halfway: typeof window !== "undefined" ? window.innerHeight * 0.45 : 400,
    expanded: typeof window !== "undefined" ? window.innerHeight - 140 : 600,
};

// Desktop panel widths (same as DesktopNavLayout) - used for map padding on desktop
const DESKTOP_PANEL_WIDTH_EXPANDED = 380;
const DESKTOP_PANEL_WIDTH_COLLAPSED = 64;
const DESKTOP_PANEL_MARGIN = 16; // left margin of panel (left-4 = 16px)

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
const DEFAULT_PITCH = 45;
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
    const router = useRouter();
    const searchParams = useSearchParams();
    const isMobile = useIsMobile(1024);
    const isInitialStyleSet = useRef(false);
    // Initialize as false to suppress URL writes until location is resolved
    const isUserInteraction = useRef(false);
    // Track if we've already handled location resolution
    const hasResolvedLocation = useRef(false);
    const drawerHeight = useTabStore((state) => state.drawerHeight);
    const isDesktopPanelCollapsed = useTabStore((state) => state.isDesktopPanelCollapsed);
    
    // Get initial map location with fallback chain:
    // URL params → browser geolocation → IP geolocation → default (Boulder)
    // Note: User profile location_coords could be passed here if UserProvider is added to layout
    const initialLocation = useInitialMapLocation();
    
    // Use refs for callbacks to avoid them being dependencies
    const routerRef = useRef(router);
    const setMapRef = useRef(setMap);
    const setVisiblePeaksRef = useRef(setVisiblePeaks);
    const setVisibleChallengesRef = useRef(setVisibleChallenges);
    const setIsZoomedOutTooFarRef = useRef(setIsZoomedOutTooFar);
    
    // Keep refs up to date
    useEffect(() => {
        routerRef.current = router;
        setMapRef.current = setMap;
        setVisiblePeaksRef.current = setVisiblePeaks;
        setVisibleChallengesRef.current = setVisibleChallenges;
        setIsZoomedOutTooFarRef.current = setIsZoomedOutTooFar;
    });

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

    // Set map padding based on UI layout
    // Mobile: bottom padding for drawer
    // Desktop: left padding for side panel
    // This is the ONLY place that should control map padding
    useEffect(() => {
        if (!map) return;
        
        if (isMobile) {
            // Mobile: bottom padding for drawer
            const getDrawerPixelHeight = (height: DrawerHeight): number => {
                if (typeof window === "undefined") return DRAWER_HEIGHTS[height];
                switch (height) {
                    case "collapsed": return 60;
                    case "halfway": return window.innerHeight * 0.45;
                    case "expanded": return window.innerHeight - 140;
                }
            };
            
            const bottomPadding = getDrawerPixelHeight(drawerHeight) + 20; // Add small buffer
            map.setPadding({
                top: 20,
                bottom: bottomPadding,
                left: 0,
                right: 0,
            });
        } else {
            // Desktop: left padding for side panel
            const panelWidth = isDesktopPanelCollapsed 
                ? DESKTOP_PANEL_WIDTH_COLLAPSED 
                : DESKTOP_PANEL_WIDTH_EXPANDED;
            const leftPadding = panelWidth + DESKTOP_PANEL_MARGIN + 20; // panel + margin + buffer
            
            map.setPadding({
                top: 20,
                bottom: 20,
                left: leftPadding,
                right: 20,
            });
        }
    }, [map, isMobile, drawerHeight, isDesktopPanelCollapsed]);

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
                pitch: DEFAULT_PITCH,
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
        const initialPitch = mapState.pitch || DEFAULT_PITCH;
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
             // Add 3D terrain
            if (!newMap.getSource('mapbox-dem')) {
                newMap.addSource('mapbox-dem', {
                    'type': 'raster-dem',
                    'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
                    'tileSize': 512,
                    'maxzoom': 14
                });
            }
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
            if (!newMap.getLayer("peaks-point")) {
                newMap.addLayer({
                    id: "peaks-point",
                    type: "circle",
                    source: "peaks",
                    filter: ["!", ["has", "point_count"]],
                    paint: {
                        "circle-color": "#4d7a57",
                        "circle-radius": 7,
                        "circle-stroke-width": 2,
                        "circle-stroke-color": "#e8dfc9",
                        "circle-opacity": 0.85
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
            // Uses feature-state for hover highlighting and properties.summits for summit status
            if (!newMap.getLayer("selectedPeaks")) {
                newMap.addLayer({
                    id: "selectedPeaks",
                    type: "circle",
                    source: "selectedPeaks",
                    paint: {
                        // Conditional color: 
                        // - Pink/amber (#d66ba0) when hovered
                        // - Sky blue (#5b9bd5) when summited
                        // - Muted green (#4d7a57) default
                        "circle-color": [
                            "case",
                            ["boolean", ["feature-state", "hover"], false],
                            "#d66ba0", // Hover: pink/amber accent
                            [">", ["coalesce", ["get", "summits"], 0], 0],
                            "#5b9bd5", // Summited: sky blue
                            "#4d7a57"  // Default: muted green
                        ],
                        // Conditional radius:
                        // - 8px when hovered (slightly larger than default)
                        // - 9px when summited (just a bit bigger, like selected peak)
                        // - 7px default (match normal peaks exploration)
                        "circle-radius": [
                            "case",
                            ["boolean", ["feature-state", "hover"], false],
                            8, // Hover: slightly larger
                            [">", ["coalesce", ["get", "summits"], 0], 0],
                            9, // Summited: just a bit bigger (like selected peak)
                            7  // Default: match normal peaks exploration
                        ],
                        "circle-stroke-width": 3,
                        "circle-stroke-color": "#e8dfc9",
                        "circle-opacity": 0.95
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

        // Interactions
        newMap.on("click", "peaks-point", (e) => {
            const feature = e.features?.[0];
            if (feature) {
                const id = feature.properties?.id;
                if (id) {
                     // Navigate to peak detail page (URL-driven overlay via UrlOverlayManager)
                     routerRef.current.push(`/peaks/${id}`);
                }
                
                // Fly to (mark as programmatic so URL updates after completion, not during)
                isUserInteraction.current = false;
                const coords = (feature.geometry as any).coordinates;
                newMap.flyTo({
                    center: coords,
                    zoom: 14,
                    pitch: 60,
                    essential: true
                });
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

        newMap.on("mouseenter", "peaks-point", () => {
            newMap.getCanvas().style.cursor = "pointer";
        });
        newMap.on("mouseleave", "peaks-point", () => {
            newMap.getCanvas().style.cursor = "";
        });

        // Selected peaks interactions (for challenge detail view)
        newMap.on("click", "selectedPeaks", (e) => {
            const feature = e.features?.[0];
            if (feature) {
                const id = feature.properties?.id;
                if (id) {
                    routerRef.current.push(`/peaks/${id}`);
                }
            }
        });
        newMap.on("mouseenter", "selectedPeaks", () => {
            newMap.getCanvas().style.cursor = "pointer";
        });
        newMap.on("mouseleave", "selectedPeaks", () => {
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

