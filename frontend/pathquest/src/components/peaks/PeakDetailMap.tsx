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

type Props = {
    details: {
        peak: UnclimbedPeak;
        activities: Activity[];
        summits: {
            timestamp: string;
            activityId: string;
        }[];
    } | null;
};

const PeakDetailMap = ({ details }: Props) => {
    const [{ user }] = useUser();

    const units = user?.units ?? "imperial";

    const mapRef = React.useRef<mapboxgl.Map | null>(null);
    const mapContainerRef = React.useRef<any>(null);

    const [marker, setMarker] = React.useState<mapboxgl.Marker | null>(null);

    const theme = useTheme();

    if (!details) return null;

    const { peak, activities } = details;

    const addMarkers = () => {
        mapRef.current?.addControl(new mapboxgl.NavigationControl());

        mapRef.current?.loadImage(primaryMarker.src, (error, image) => {
            if (error) throw error;
            if (image) mapRef.current?.addImage("marker-primary", image);
        });

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
