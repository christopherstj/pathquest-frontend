"use client";
import React from "react";
import MapboxContainer from "../common/MapboxContainer";
import { Box, Divider, Typography, useTheme } from "@mui/material";
import { usePeakDetail } from "@/state/PeakDetailContext";
import loadMapDefaults from "@/helpers/loadMapDefaults";
import initiateMap from "@/helpers/initiateMap";
import "mapbox-gl/dist/mapbox-gl.css";
import AltitudeCard from "./AltitudeCard";
import { useUser } from "@/state/UserContext";

const PeakDetailMap = () => {
    const [details, setPeakDetail] = usePeakDetail();
    const [{ user }] = useUser();

    const mapRef = React.useRef<mapboxgl.Map | null>(null);
    const mapContainerRef = React.useRef<any>(null);

    const theme = useTheme();

    if (!user) return null;

    if (!details || !details.peak) return null;

    const { peak, activities } = details;

    const units = user.units;

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
        <>
            <Box
                width="100%"
                display="flex"
                // justifyContent="space-between"
                alignItems="center"
                paddingBottom="8px"
            >
                <Typography variant="h4" color="primary.onContainer">
                    {peak.Name}
                </Typography>
                <Box
                    sx={{
                        ml: {
                            xs: "none",
                            md: "auto",
                        },
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    <Typography variant="h6" color="primary.onContainerDim">
                        {peak.Country ? `${peak.Country}` : ""}
                        {peak.State ? ` | ${peak.State}` : ""}
                        {peak.County ? ` | ${peak.County}` : ""}
                    </Typography>
                    {peak.Altitude && (
                        <AltitudeCard altitude={peak.Altitude} units={units} />
                    )}
                </Box>
            </Box>
            <Divider
                sx={{
                    backgroundColor: "primary.onContainer",
                    width: "100%",
                    marginBottom: "12px",
                }}
            />
            <MapboxContainer
                sx={{
                    height: {
                        xs: "70vh",
                        md: "calc(100vh - 88px)",
                    },
                }}
            >
                <div
                    id="map-container"
                    ref={mapContainerRef}
                    style={{ height: "100%", width: "100%" }}
                />
            </MapboxContainer>
        </>
    );
};

export default PeakDetailMap;
