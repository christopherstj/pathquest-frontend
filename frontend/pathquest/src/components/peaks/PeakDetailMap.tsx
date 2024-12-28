"use client";
import React from "react";
import MapboxContainer from "../common/MapboxContainer";
import mapboxgl from "mapbox-gl";
import { useUser } from "@/state/UserContext";
import { useTheme } from "@mui/material";
import { usePeakDetail } from "@/state/PeakDetailContext";
import loadMapDefaults from "@/helpers/loadMapDefaults";
import initiateMap from "@/helpers/initiateMap";

const PeakDetailMap = () => {
    const [details, setPeakDetail] = usePeakDetail();
    const [{ user }] = useUser();

    const units = user?.units ?? "imperial";

    const mapRef = React.useRef<mapboxgl.Map | null>(null);
    const mapContainerRef = React.useRef<any>(null);

    const [marker, setMarker] = React.useState<mapboxgl.Marker | null>(null);

    const theme = useTheme();

    if (!details || !details.peak) return null;

    const { peak, activities } = details;

    const addMarkers = () => {
        if (!mapRef.current) return;

        loadMapDefaults(mapRef.current, theme);

        mapRef.current?.addSource("activities", {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: activities.map((a) => ({
                    type: "Feature",
                    geometry: {
                        type: "LineString",
                        coordinates: (a.coords as [number, number][]).map(
                            (c) => [c[1], c[0]]
                        ),
                    },
                    properties: {
                        id: a.id,
                    },
                })),
            },
        });

        mapRef.current?.addSource("activityStarts", {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: activities.map((a) => ({
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [a.startLong, a.startLat],
                    },
                    properties: {
                        id: a.id,
                    },
                })),
            },
        });

        mapRef.current?.addSource("selectedActivities", {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: [],
            },
        });

        mapRef.current?.addSource("peaks", {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: [
                    {
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: [
                                peak.Long ?? -111.651302,
                                peak.Lat ?? 35.198284,
                            ],
                        },
                        properties: {
                            ...peak,
                        },
                    },
                ],
            },
        });

        mapRef.current?.addLayer({
            id: "peaks",
            type: "symbol",
            source: "peaks",
            layout: {
                "icon-image": [
                    "image",
                    [
                        "case",
                        [
                            "any",
                            ["==", ["get", "isSummitted"], 1],
                            ["==", ["get", "isSummitted"], true],
                        ],
                        "marker-primary",
                        [
                            "any",
                            ["==", ["get", "isFavorited"], 1],
                            ["==", ["get", "isFavorited"], true],
                        ],
                        "marker-tertiary",
                        "marker-secondary",
                    ],
                ],
                "icon-size": 0.2,
                "icon-allow-overlap": true,
                "icon-anchor": "bottom",
            },
        });

        mapRef.current?.addLayer({
            id: "activities",
            type: "line",
            source: "activities",
            layout: {
                "line-join": "round",
                "line-cap": "round",
            },
            paint: {
                "line-color": theme.palette.primary.containerDim,
                "line-width": 3,
            },
        });

        mapRef.current?.addLayer({
            id: "activityStarts",
            type: "circle",
            source: "activityStarts",
            paint: {
                "circle-color": theme.palette.primary.onContainerDim,
                "circle-radius": 8,
                "circle-stroke-color": theme.palette.primary.containerDim,
                "circle-stroke-width": 1,
            },
        });

        mapRef.current?.addLayer({
            id: "selectedActivities",
            type: "line",
            source: "selectedActivities",
            layout: {
                "line-join": "round",
                "line-cap": "round",
            },
            paint: {
                "line-color": theme.palette.tertiary.base,
                "line-width": 3,
            },
        });
    };

    React.useEffect(() => {
        initiateMap(
            mapContainerRef,
            mapRef,
            addMarkers,
            [peak.Long ?? -111.651302, peak.Lat ?? 35.198284],
            12
        );

        setPeakDetail({ ...details, map: mapRef.current });

        return () => {
            mapRef.current?.remove();
        };
    }, []);

    return (
        <MapboxContainer
            sx={{
                height: {
                    xs: "70vh",
                    md: "calc(100vh - 32px)",
                },
            }}
        >
            <div
                id="map-container"
                ref={mapContainerRef}
                style={{ height: "100%", width: "100%" }}
            />
        </MapboxContainer>
    );
};

export default PeakDetailMap;
