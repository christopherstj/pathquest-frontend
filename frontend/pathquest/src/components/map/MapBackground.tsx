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
import { getMapboxToken } from "@/lib/map/getMapboxToken";

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
    const isUserInteraction = useRef(true);
    
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
        const debouncedUpdateURL = debounce(() => {
            if (isUserInteraction.current) {
                const center = newMap.getCenter();
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

