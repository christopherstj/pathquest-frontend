"use client";

import React, { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMapStore } from "@/providers/MapProvider";
import getNewData from "@/helpers/getNewData";
import { useRouter } from "next/navigation";
import { searchChallengesClient } from "@/lib/client/searchChallengesClient";
import SatelliteButton from "@/components/app/map/SatelliteButton";
import { useIsMobile } from "@/hooks/use-mobile";

const MapBackground = () => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapInitialized = useRef(false);
    const setMap = useMapStore((state) => state.setMap);
    const setVisiblePeaks = useMapStore((state) => state.setVisiblePeaks);
    const setVisibleChallenges = useMapStore((state) => state.setVisibleChallenges);
    const map = useMapStore((state) => state.map);
    const isSatellite = useMapStore((state) => state.isSatellite);
    const setIsSatellite = useMapStore((state) => state.setIsSatellite);
    const router = useRouter();
    const isMobile = useIsMobile(1024);
    const isInitialStyleSet = useRef(false);
    
    // Use refs for callbacks to avoid them being dependencies
    const routerRef = useRef(router);
    const setMapRef = useRef(setMap);
    const setVisiblePeaksRef = useRef(setVisiblePeaks);
    const setVisibleChallengesRef = useRef(setVisibleChallenges);
    
    // Keep refs up to date
    useEffect(() => {
        routerRef.current = router;
        setMapRef.current = setMap;
        setVisiblePeaksRef.current = setVisiblePeaks;
        setVisibleChallengesRef.current = setVisibleChallenges;
    });

    const fetchVisibleChallenges = useCallback(async (mapInstance: mapboxgl.Map) => {
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

    const handleSatelliteToggle = (enabled: boolean) => {
        setIsSatellite(enabled);
    };

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

        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
        // Ensure container is empty before Mapbox initializes
        mapContainer.current.replaceChildren();

        const newMap = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/outdoors-v12", // topo-friendly base
            center: [-105.2705, 40.015], // Boulder, CO default
            zoom: 11,
            pitch: 45, // 3D feel
            bearing: 0,
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

            // Selected Peaks Source (for challenge detail, peak detail - displays with larger icons)
            if (!newMap.getSource("selectedPeaks")) {
                newMap.addSource("selectedPeaks", {
                    type: "geojson",
                    data: {
                        type: "FeatureCollection",
                        features: []
                    }
                });
            }

            // Selected Peaks Layer (larger markers for highlighted peaks)
            if (!newMap.getLayer("selectedPeaks")) {
                newMap.addLayer({
                    id: "selectedPeaks",
                    type: "circle",
                    source: "selectedPeaks",
                    paint: {
                        "circle-color": "#4d7a57",
                        "circle-radius": 10,
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
                
                // Fly to
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

        // Move end listener to refetch
        newMap.on("moveend", () => {
            getNewData("", true, setVisiblePeaksRef.current, newMap);
            fetchVisibleChallenges(newMap);
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
            {!isMobile && (
                <div className="absolute bottom-6 right-6 z-50 pointer-events-auto">
                    <SatelliteButton 
                        value={isSatellite}
                        onClick={handleSatelliteToggle}
                    />
                </div>
            )}
        </div>
    );
};

export default MapBackground;

