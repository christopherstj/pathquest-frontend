"use client";
import Activity from "@/typeDefs/Activity";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import React from "react";
import MapboxContainer from "../common/MapboxContainer";
import mapboxgl from "mapbox-gl";
import primaryMarker from "@/public/images/marker-primary.png";
import PeakMarker from "../dashboard/PeakMarker";
import CompletedPopup from "../dashboard/CompletedPopup";
import { useUser } from "@/state/UserContext";
import { useTheme } from "@mui/material";
import { usePeakDetail } from "@/state/PeakDetailContext";

const PeakDetailMap = () => {
    const [details, setPeeakDetail] = usePeakDetail();
    const [{ user }] = useUser();

    const units = user?.units ?? "imperial";

    const mapRef = React.useRef<mapboxgl.Map | null>(null);
    const mapContainerRef = React.useRef<any>(null);

    const [marker, setMarker] = React.useState<mapboxgl.Marker | null>(null);

    const theme = useTheme();

    if (!details || !details.peak) return null;

    const { peak, activities } = details;

    const addMarkers = () => {
        mapRef.current?.addControl(
            new mapboxgl.NavigationControl(),
            "top-left"
        );

        mapRef.current?.loadImage(primaryMarker.src, (error, image) => {
            if (error) throw error;
            if (image) mapRef.current?.addImage("marker-primary", image);
        });

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

    const addMarker = () => {
        if (mapRef.current && details.peak) {
            const el = PeakMarker();

            const newMarker = new mapboxgl.Marker(el)
                .setLngLat([peak.Long ?? -111.651302, peak.Lat ?? 35.198284])
                .setPopup(
                    new mapboxgl.Popup({ offset: 25 }).setHTML(
                        CompletedPopup({
                            peak: {
                                ...peak,
                                ascents: activities.map(
                                    (
                                        a
                                    ): {
                                        timestamp: string;
                                        activityId: string;
                                    } => ({
                                        timestamp: new Date(
                                            a.startTime
                                        ).toISOString(),
                                        activityId: a.id,
                                    })
                                ),
                            },
                            units,
                            theme,
                            showButtton: false,
                        })
                    )
                )
                .addTo(mapRef.current!);

            setMarker(newMarker);
        }
    };

    React.useEffect(() => {
        mapboxgl.accessToken =
            "pk.eyJ1IjoiY2hyaXN0b3BoZXJzdGoiLCJhIjoiY20yZThlMW12MDJwMzJycTAwYzd5ZGhxYyJ9.yj5sadTuPldjsWchDuJ3WA";
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            center: [peak.Long ?? -111.651302, peak.Lat ?? 35.198284],
            zoom: 12,
        });

        mapRef.current.on("load", addMarkers);

        setPeeakDetail({ ...details, map: mapRef.current });

        return () => {
            mapRef.current?.remove();
        };
    }, []);

    React.useEffect(() => {
        if (mapRef.current) {
            addMarker();
        }
    }, [details, mapRef.current]);

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
