"use client";
import React, { useCallback } from "react";
import mapboxgl, { MapMouseEvent } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Grid2 as Grid, useTheme } from "@mui/material";
import { useUser } from "@/state/UserContext";
import PeaksSummitList from "./PeaksSummitList";
import UnclimbedPeaksList from "./UnclimbedPeaksList";
import FavoritePeaks from "./FavoritePeaks";
import CompletedPopup from "./CompletedPopup";
import FavoritePopup from "./FavoritePopup";
import { useMessage } from "@/state/MessageContext";
import MapboxContainer from "../common/MapboxContainer";
import convertPeakSummitsToGeoJSON from "@/helpers/convertPeakSummitsToGeoJSON";
import convertUnclimbedPeaksToGEOJson from "@/helpers/convertUnclimbedPeaksToGEOJson";
import PeakSummit from "@/typeDefs/PeakSummit";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";
import ChallengePopup from "../challenges/ChallengePopup";
import loadMapDefaults from "@/helpers/loadMapDefaults";
import onFavoriteClick from "./helpers/onFavoriteClick";
import initiateMap from "@/helpers/initiateMap";
import { useDashboard } from "@/state/DashboardContext";
import UnclimbedPopup from "./UnclimbedPopup";
import { ActivityStart } from "@/typeDefs/ActivityStart";
import getActivityCoords from "@/actions/getActivityCoords";
import ActivityPopup from "../activities/ActivityPopup";
import { useRouter } from "next/navigation";

type Props = {
    children?: React.ReactNode;
};

const Map = ({ children }: Props) => {
    const [dashboardState, setDashboardState] = useDashboard();
    const [{ user }] = useUser();
    const [, dispatch] = useMessage();

    const router = useRouter();

    if (!user) return null;

    const { units } = user;

    const theme = useTheme();

    const { peakSummits, favoritePeaks, favoriteChallenges, activities } =
        dashboardState;

    const mapRef = React.useRef<mapboxgl.Map | null>(null);
    const mapContainerRef = React.useRef<any>(null);

    const onCompletedPeakClick = useCallback(
        (e: MapMouseEvent) => {
            e.originalEvent.preventDefault();
            e.originalEvent.stopPropagation();

            const feature = e.features?.[0];

            if (feature?.geometry.type === "Point" && e.target) {
                const coordinates = feature.geometry.coordinates.slice();

                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] +=
                        e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                const peak = feature.properties as PeakSummit;

                new mapboxgl.Popup({ offset: 25 })
                    .setLngLat(coordinates as [number, number])
                    .setHTML(
                        CompletedPopup({
                            peak,
                            units,
                            theme,
                        })
                    )
                    .addTo(e.target);
            }
        },
        [units, theme]
    );

    const onUnclimbedPeakClick = useCallback(
        (e: MapMouseEvent) => {
            e.originalEvent.preventDefault();
            e.originalEvent.stopPropagation();

            const feature = e.features?.[0];

            console.log("feature", feature);

            if (feature?.geometry.type === "Point" && e.target) {
                const coordinates = feature.geometry.coordinates.slice();

                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] +=
                        e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                const peak = feature.properties as UnclimbedPeak;

                new mapboxgl.Popup({ offset: 25 })
                    .setLngLat(coordinates as [number, number])
                    .setDOMContent(
                        UnclimbedPopup({
                            peak,
                            units,
                            theme,
                            onFavoriteClick: (peakId, newValue) => {
                                onFavoriteClick(
                                    peakId,
                                    newValue,
                                    true,
                                    e.target,
                                    theme,
                                    units,
                                    setDashboardState,
                                    dispatch
                                );
                            },
                        })
                    )
                    .addTo(e.target);
            }
        },
        [units, theme, setDashboardState, dispatch]
    );

    const onFavoritePeakClick = useCallback(
        (e: MapMouseEvent) => {
            e.originalEvent.preventDefault();
            e.originalEvent.stopPropagation();

            e.originalEvent?.stopPropagation();
            const feature = e.features?.[0];

            if (feature?.geometry.type === "Point" && e.target) {
                const coordinates = feature.geometry.coordinates.slice();

                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] +=
                        e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                const peak = feature.properties as UnclimbedPeak;

                new mapboxgl.Popup({ offset: 25 })
                    .setLngLat(coordinates as [number, number])
                    .setDOMContent(
                        FavoritePopup({
                            peak,
                            units,
                            theme,
                            onUnfavoriteClick: (peakId, newValue) => {
                                onFavoriteClick(
                                    peakId,
                                    newValue,
                                    true,
                                    e.target,
                                    theme,
                                    units,
                                    setDashboardState,
                                    dispatch
                                );
                            },
                        })
                    )
                    .addTo(e.target);
            }
        },
        [units, theme, setDashboardState, dispatch]
    );

    const onActivityClick = useCallback(
        (e: MapMouseEvent) => {
            const feature = e.features?.[0];

            const activity = feature?.properties as ActivityStart;

            if (
                feature &&
                feature.properties &&
                !("cluster_id" in feature.properties) &&
                feature.geometry.type === "Point" &&
                e.target
            ) {
                getActivityCoords(activity.id).then((coords) => {
                    if (coords && e.target) {
                        const source = e.target.getSource(
                            "activities"
                        ) as mapboxgl.GeoJSONSource;

                        if (source) {
                            source.setData({
                                type: "FeatureCollection",
                                features: [
                                    {
                                        type: "Feature",
                                        geometry: {
                                            type: "LineString",
                                            coordinates: coords.coords.map(
                                                (c) => [c[1], c[0]]
                                            ),
                                        },
                                        properties: {
                                            id: activity.id,
                                        },
                                    },
                                ],
                            });
                        }
                    }
                });

                const coordinates = feature?.geometry.coordinates.slice();

                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] +=
                        e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                const popup = new mapboxgl.Popup()
                    .setLngLat(coordinates as [number, number])
                    .setDOMContent(
                        ActivityPopup({
                            activity,
                            theme,
                            units: user.units,
                            redirect: (url) => router.push(url),
                        })
                    )
                    .addTo(e.target);

                popup.on("close", () => {
                    const source = e.target?.getSource(
                        "activities"
                    ) as mapboxgl.GeoJSONSource;

                    if (source) {
                        source.setData({
                            type: "FeatureCollection",
                            features: [],
                        });
                    }
                });
            }
        },
        [getActivityCoords, user.units]
    );

    const addMarkers = () => {
        if (mapRef.current !== null) {
            loadMapDefaults(mapRef.current, theme, "all");

            const bounds = new mapboxgl.LngLatBounds();

            peakSummits?.forEach((peak) => {
                bounds.extend([peak.Long, peak.Lat]);
            });
            favoritePeaks?.forEach((peak) => {
                bounds.extend([peak.Long, peak.Lat]);
            });
            activities?.forEach((activity) => {
                bounds.extend([activity.startLong, activity.startLat]);
            });

            mapRef.current.fitBounds(bounds, {
                padding: 50,
            });

            mapRef.current?.addSource("peakSummits", {
                type: "geojson",
                data: convertPeakSummitsToGeoJSON(peakSummits ?? []),
            });
            mapRef.current?.addSource("unclimbedPeaks", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: [],
                },
            });
            mapRef.current?.addSource("favoritePeaks", {
                type: "geojson",
                data: convertUnclimbedPeaksToGEOJson(favoritePeaks ?? []),
            });
            mapRef.current?.addSource("challenges", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: (favoriteChallenges ?? []).map((d) => ({
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: [d.centerLong ?? 0, d.centerLat ?? 0],
                        },
                        properties: {
                            ...d,
                        },
                    })),
                },
            });
            mapRef.current.addSource("activities", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: [],
                },
            });
            mapRef.current.addSource("activityStarts", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: (activities ?? []).map((activity) => ({
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: [
                                activity.startLong,
                                activity.startLat,
                            ],
                        },
                        properties: {
                            ...activity,
                        },
                    })),
                },
            });

            mapRef.current.addLayer({
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

            mapRef.current.addLayer({
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
                id: "peakSummits",
                type: "symbol",
                source: "peakSummits",
                layout: {
                    "icon-image": "marker-primary",
                    "icon-size": 0.2,
                    "icon-allow-overlap": true,
                    "icon-anchor": "bottom",
                },
            });
            mapRef.current?.addLayer({
                id: "unclimbedPeaks",
                type: "symbol",
                source: "unclimbedPeaks",
                filter: ["!", ["has", "point_count"]],
                layout: {
                    "icon-image": "marker-secondary",
                    "icon-size": 0.2,
                    "icon-allow-overlap": true,
                    "icon-anchor": "bottom",
                },
            });
            mapRef.current?.addLayer({
                id: "favoritePeaks",
                type: "symbol",
                source: "favoritePeaks",
                filter: ["!", ["has", "point_count"]],
                layout: {
                    "icon-image": "marker-tertiary",
                    "icon-size": 0.2,
                    "icon-allow-overlap": true,
                    "icon-anchor": "bottom",
                },
            });
            mapRef.current?.addLayer({
                id: "challenges",
                type: "symbol",
                source: "challenges",
                layout: {
                    "icon-image": [
                        "image",
                        [
                            "case",
                            ["==", ["get", "total"], ["get", "completed"]],
                            "challenge-primary",
                            ["==", ["get", "completed"], 0],
                            "challenge-secondary",
                            "challenge-tertiary",
                        ],
                    ],
                    "icon-size": 0.2,
                    "icon-allow-overlap": true,
                    "icon-anchor": "bottom",
                },
            });

            mapRef.current.on("click", "peakSummits", onCompletedPeakClick);
            mapRef.current.on("click", "unclimbedPeaks", onUnclimbedPeakClick);
            mapRef.current.on("click", "favoritePeaks", onFavoritePeakClick);
            mapRef.current.on("click", "activities", onActivityClick);

            mapRef.current?.on("click", "challenges", (e) => {
                e.originalEvent.preventDefault();
                e.originalEvent.stopPropagation();

                const feature = e.features?.[0];

                if (feature?.geometry.type === "Point" && mapRef.current) {
                    const coordinates = feature.geometry.coordinates.slice();

                    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                        coordinates[0] +=
                            e.lngLat.lng > coordinates[0] ? 360 : -360;
                    }

                    const challenge = feature.properties as ChallengeProgress;

                    new mapboxgl.Popup({ offset: 25 })
                        .setLngLat(coordinates as [number, number])
                        .setHTML(
                            ChallengePopup({
                                challenge,
                                theme,
                            })
                        )
                        .addTo(mapRef.current);
                }
            });
        }
    };

    React.useEffect(() => {
        initiateMap(mapContainerRef, mapRef, addMarkers, [
            user.long ?? -111.651302,
            user.lat ?? 35.198284,
        ]);

        setDashboardState((state) => ({
            ...state,
            map: mapRef.current,
        }));

        return () => {
            mapRef.current?.remove();
        };
    }, []);

    return (
        <>
            <Grid size={{ xs: 12, md: 6, lg: 8 }}>
                <MapboxContainer>
                    <div
                        id="map-container"
                        ref={mapContainerRef}
                        style={{ height: "100%", width: "100%" }}
                    />
                </MapboxContainer>
            </Grid>
            {children}
            <Grid
                size={{ xs: 12, md: 6, lg: 4 }}
                display="flex"
                flexDirection="column"
                gap="16px"
            >
                <FavoritePeaks
                    onFavoriteClick={(peakId, newValue, openPopup) =>
                        onFavoriteClick(
                            peakId,
                            newValue,
                            openPopup,
                            mapRef.current,
                            theme,
                            units,
                            setDashboardState,
                            dispatch
                        )
                    }
                />
            </Grid>
        </>
    );
};

export default Map;
