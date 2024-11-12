"use client";
import React from "react";
import MapboxContainer from "../common/MapboxContainer";
import mapboxgl from "mapbox-gl";
import primaryMarker from "@/public/images/marker-primary.png";
import secondaryMarker from "@/public/images/marker-secondary.png";
import tertiaryMarker from "@/public/images/marker-tertiary.png";
import { useChallengeDetail } from "@/state/ChallengeDetailContext";
import "mapbox-gl/dist/mapbox-gl.css";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import UnclimbedPopup from "../dashboard/UnclimbedPopup";
import CompletedPopup from "../dashboard/CompletedPopup";
import { useTheme } from "@mui/material";
import { useUser } from "@/state/UserContext";
import convertUnclimbedPeaksToGEOJson from "@/helpers/convertUnclimbedPeaksToGEOJson";

const ChallengeDetailMap = () => {
    const [{ challenge, peaks }, setChallengeDetailState] =
        useChallengeDetail();
    const [{ user }] = useUser();

    const units = user?.units ?? "metric";

    const theme = useTheme();

    const mapContainerRef = React.useRef<any>(null);
    const mapRef = React.useRef<mapboxgl.Map | null>(null);

    let hoveredPolygonId: number | null = null;

    const addMarkers = () => {
        const bounds = new mapboxgl.LngLatBounds();

        mapRef.current?.addControl(
            new mapboxgl.NavigationControl(),
            "top-left"
        );

        mapRef.current?.loadImage(primaryMarker.src, (error, image) => {
            if (error) throw error;
            if (image) mapRef.current?.addImage("marker-primary", image);
        });
        mapRef.current?.loadImage(secondaryMarker.src, (error, image) => {
            if (error) throw error;
            if (image) mapRef.current?.addImage("marker-secondary", image);
        });
        mapRef.current?.loadImage(tertiaryMarker.src, (error, image) => {
            if (error) throw error;
            if (image) mapRef.current?.addImage("marker-tertiary", image);
        });

        const geoJson = convertUnclimbedPeaksToGEOJson(
            peaks.map((p) => p.peak)
        );

        geoJson.features.forEach((peak) => {
            bounds.extend((peak.geometry as any).coordinates);
        });

        mapRef.current?.fitBounds(bounds, {
            padding: 50,
        });

        mapRef.current?.addSource("peaks", {
            type: "geojson",
            data: geoJson,
        });
        mapRef.current?.addSource("activities", {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: peaks
                    .filter((p) => p.activity !== undefined)
                    .map(({ activity }) => ({
                        id: activity!.id,
                        type: "Feature",
                        geometry: {
                            type: "LineString",
                            coordinates: (
                                activity!.coords as [number, number][]
                            ).map((c) => [c[1], c[0]]),
                        },
                        properties: {
                            ...activity,
                        },
                    })),
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
                        ["==", ["get", "isSummitted"], 1],
                        "marker-primary",
                        "marker-tertiary",
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
                "line-color": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    theme.palette.tertiary.base,
                    theme.palette.primary.containerDim,
                ],
                "line-width": 3,
            },
        });

        mapRef.current?.on("click", "peaks", (e) => {
            const feature = e.features?.[0];

            if (feature?.geometry.type === "Point" && mapRef.current) {
                const coordinates = feature.geometry.coordinates.slice();

                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] +=
                        e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                const peak = feature.properties as UnclimbedPeak;

                const popup = UnclimbedPopup({
                    peak,
                    units,
                    theme,
                    color: peak.isSummitted ? "primary" : "tertiary",
                });

                new mapboxgl.Popup({ offset: 25 })
                    .setLngLat(coordinates as [number, number])
                    .setDOMContent(popup)
                    .addTo(mapRef.current);
            }
        });

        mapRef.current?.on("mousemove", "activities", (e) => {
            if ((e.features ?? []).length > 0) {
                if (hoveredPolygonId !== null) {
                    mapRef.current?.setFeatureState(
                        { source: "activities", id: hoveredPolygonId },
                        { hover: false }
                    );
                }
                hoveredPolygonId = (e.features?.[0].id as number) ?? null;
                mapRef.current?.setFeatureState(
                    { source: "activities", id: hoveredPolygonId },
                    { hover: true }
                );
            }
        });

        mapRef.current?.on("mouseleave", "activities", () => {
            if (hoveredPolygonId !== null) {
                mapRef.current?.setFeatureState(
                    { source: "activities", id: hoveredPolygonId },
                    { hover: false }
                );
            }
            hoveredPolygonId = null;
        });
    };

    React.useEffect(() => {
        mapboxgl.accessToken =
            "pk.eyJ1IjoiY2hyaXN0b3BoZXJzdGoiLCJhIjoiY20yZThlMW12MDJwMzJycTAwYzd5ZGhxYyJ9.yj5sadTuPldjsWchDuJ3WA";
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            center: [challenge.centerLong ?? 0, challenge.centerLat ?? 0],
            zoom: 6,
        });

        mapRef.current.on("load", () => {
            addMarkers();
        });

        setChallengeDetailState((state) => ({
            ...state,
            map: mapRef.current,
        }));

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

export default ChallengeDetailMap;
