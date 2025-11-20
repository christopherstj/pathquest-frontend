"use client";
import initiateMap from "@/lib/map/initiateMap";
import React from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMapStore } from "@/providers/MapProvider";
import addMapConfiguration from "@/lib/map/addMapConfiguration";
import { useRouter, useSearchParams } from "next/navigation";
import getBoundsFromURL from "@/helpers/getBoundsFromURL";
import getMapStateFromURL from "@/helpers/getMapStateFromURL";
import updateMapURL from "@/helpers/updateMapURL";
import SatelliteButton from "./SatelliteButton";
import ThreeDButton from "./ThreeDButton";

const Map = () => {
    const setMap = useMapStore((state) => state.setMap);
    const mapRef = React.useRef<mapboxgl.Map | null>(null);
    const mapContainerRef = React.useRef<any>(null);
    const isUserInteraction = React.useRef(true);
    const savedSourceData = React.useRef<Record<string, any>>({});
    const is3DRef = React.useRef(false);
    const isSatelliteRef = React.useRef(false);

    const [isSatellite, setIsSatellite] = React.useState(false);
    const [is3D, setIs3D] = React.useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSatelliteToggle = (enabled: boolean) => {
        setIsSatellite(enabled);
        isSatelliteRef.current = enabled;

        updateMapURL({ isSatellite: enabled }, router);

        if (mapRef.current) {
            // Save current source data before style change
            const sourceIds = [
                "peaks",
                "challenges",
                "activities",
                "activityStarts",
            ];
            sourceIds.forEach((id) => {
                const source = mapRef.current?.getSource(id) as
                    | mapboxgl.GeoJSONSource
                    | undefined;
                if (source && "_data" in source) {
                    savedSourceData.current[id] = (source as any)._data;
                }
            });

            mapRef.current.setStyle(
                enabled
                    ? "mapbox://styles/mapbox/standard-satellite"
                    : "mapbox://styles/mapbox/outdoors-v12"
            );
            // Terrain will be re-added in the style.load event handler below
        }
    };

    const handle3DToggle = (enabled: boolean) => {
        setIs3D(enabled);
        is3DRef.current = enabled;

        const pitch = enabled ? 60 : 0;
        const bearing = enabled ? 20 : 0;
        updateMapURL({ is3D: enabled, pitch, bearing }, router);

        if (mapRef.current) {
            if (enabled) {
                // Add terrain source and layer
                if (!mapRef.current.getSource("mapbox-dem")) {
                    mapRef.current.addSource("mapbox-dem", {
                        type: "raster-dem",
                        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
                        tileSize: 512,
                        maxzoom: 14,
                    });
                }
                mapRef.current.setTerrain({
                    source: "mapbox-dem",
                    exaggeration: 2,
                });

                // Add sky layer for atmospheric effect
                if (!mapRef.current.getLayer("sky")) {
                    mapRef.current.addLayer({
                        id: "sky",
                        type: "sky",
                        paint: {
                            "sky-type": "atmosphere",
                            "sky-atmosphere-sun": [0.0, 90.0],
                            "sky-atmosphere-sun-intensity": 15,
                        },
                    });
                }

                mapRef.current.easeTo({
                    pitch,
                    bearing,
                    duration: 1000,
                });
            } else {
                // Remove terrain and sky
                mapRef.current.setTerrain(null);
                if (mapRef.current.getLayer("sky")) {
                    mapRef.current.removeLayer("sky");
                }
                mapRef.current.easeTo({
                    pitch,
                    bearing,
                    duration: 1000,
                });
            }
        }
    };

    React.useEffect(() => {
        const bounds = getBoundsFromURL(searchParams);
        const mapState = getMapStateFromURL(searchParams);

        is3DRef.current = mapState.is3D;
        isSatelliteRef.current = mapState.isSatellite;
        setIs3D(mapState.is3D);
        setIsSatellite(mapState.isSatellite);

        initiateMap(
            mapContainerRef,
            mapRef,
            [-119.698189, 34.42083],
            mapState.isSatellite,
            8,
            bounds,
            (map) => {
                addMapConfiguration(map, router, true, mapState.isSatellite);
                if (bounds) {
                    isUserInteraction.current = false;
                }

                // Apply initial 3D state if set in URL
                if (mapState.is3D) {
                    if (!map.getSource("mapbox-dem")) {
                        map.addSource("mapbox-dem", {
                            type: "raster-dem",
                            url: "mapbox://mapbox.mapbox-terrain-dem-v1",
                            tileSize: 512,
                            maxzoom: 14,
                        });
                    }
                    map.setTerrain({
                        source: "mapbox-dem",
                        exaggeration: 2,
                    });

                    if (!map.getLayer("sky")) {
                        map.addLayer({
                            id: "sky",
                            type: "sky",
                            paint: {
                                "sky-type": "atmosphere",
                                "sky-atmosphere-sun": [0.0, 90.0],
                                "sky-atmosphere-sun-intensity": 15,
                            },
                        });
                    }

                    map.setPitch(mapState.pitch);
                    map.setBearing(mapState.bearing);
                }

                map.on("moveend", () => {
                    if (isUserInteraction.current) {
                        const newBounds = map.getBounds();
                        if (newBounds) {
                            // Update all URL params in a single call
                            updateMapURL(
                                {
                                    bounds: newBounds,
                                    is3D: is3DRef.current,
                                    isSatellite: isSatelliteRef.current,
                                    pitch: map.getPitch(),
                                    bearing: map.getBearing(),
                                },
                                router
                            );
                        }
                    }
                    isUserInteraction.current = true;
                });

                // Re-add sources/layers when style changes
                map.on("style.load", () => {
                    addMapConfiguration(
                        map,
                        router,
                        false,
                        isSatelliteRef.current
                    );

                    // Restore saved source data
                    Object.keys(savedSourceData.current).forEach((id) => {
                        const source = map.getSource(id) as
                            | mapboxgl.GeoJSONSource
                            | undefined;
                        if (source && savedSourceData.current[id]) {
                            source.setData(savedSourceData.current[id]);
                        }
                    });

                    // Re-apply 3D terrain and sky if 3D mode is enabled
                    if (is3DRef.current) {
                        if (!map.getSource("mapbox-dem")) {
                            map.addSource("mapbox-dem", {
                                type: "raster-dem",
                                url: "mapbox://mapbox.mapbox-terrain-dem-v1",
                                tileSize: 512,
                                maxzoom: 14,
                            });
                        }
                        map.setTerrain({
                            source: "mapbox-dem",
                            exaggeration: 2,
                        });

                        if (!map.getLayer("sky")) {
                            map.addLayer({
                                id: "sky",
                                type: "sky",
                                paint: {
                                    "sky-type": "atmosphere",
                                    "sky-atmosphere-sun": [0.0, 90.0],
                                    "sky-atmosphere-sun-intensity": 15,
                                },
                            });
                        }
                    }
                });
            }
        );
        setMap(mapRef.current);
        return () => {
            mapRef.current?.remove();
        };
    }, []);

    return (
        <>
            <div
                className="h-full w-full"
                id="map-container"
                ref={mapContainerRef}
            />
            <div className="absolute bottom-34 left-2 z-10 flex flex-col gap-2">
                <SatelliteButton
                    value={isSatellite}
                    onClick={handleSatelliteToggle}
                />
                <ThreeDButton value={is3D} onClick={handle3DToggle} />
            </div>
        </>
    );
};

export default Map;
