"use client";
import convertPeakSummitsToGeoJSON from "@/helpers/convertPeakSummitsToGeoJSON";
import { usePeaks } from "@/state/PeaksContext";
import { useUser } from "@/state/UserContext";
import { useTheme } from "@mui/material";
import mapboxgl, { GeoJSONSource, MapMouseEvent } from "mapbox-gl";
import React from "react";
import PeakSummit from "@/typeDefs/PeakSummit";
import CompletedPopup from "../dashboard/CompletedPopup";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxContainer from "../common/MapboxContainer";
import UnclimbedPopup from "../dashboard/UnclimbedPopup";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import FavoritePopup from "../dashboard/FavoritePopup";
import toggleFavoritePeak from "@/actions/toggleFavoritePeak";
import { useMessage } from "@/state/MessageContext";
import loadMapDefaults from "@/helpers/loadMapDefaults";
import initiateMap from "@/helpers/initiateMap";
import convertUnclimbedPeaksToGEOJson from "@/helpers/convertUnclimbedPeaksToGEOJson";

const DashboardPeaksMap = () => {
    const [{ user }] = useUser();
    const [{ peakSelection, map }, setPeaksState] = usePeaks();
    const [, dispatch] = useMessage();

    const theme = useTheme();

    const mapRef = React.useRef<mapboxgl.Map | null>(null);
    const mapContainerRef = React.useRef<any>(null);

    if (!user) return null;

    const { units } = user;

    const addMarkers = () => {
        if (!mapRef.current) return;

        loadMapDefaults(mapRef.current, theme);

        if (peakSelection.type === "completed") {
            mapRef.current?.addSource("peakSummits", {
                type: "geojson",
                data: convertPeakSummitsToGeoJSON(peakSelection.data ?? []),
            });
            mapRef.current?.addSource("unclimbedPeaks", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: [],
                },
                cluster: true,
                clusterMaxZoom: 14,
                clusterRadius: 50,
            });
            mapRef.current?.addSource("favoritePeaks", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: [],
                },
                cluster: true,
                clusterMaxZoom: 14,
                clusterRadius: 50,
            });
        } else {
            mapRef.current?.addSource("peakSummits", {
                type: "geojson",
                data: convertPeakSummitsToGeoJSON([]),
            });
            mapRef.current?.addSource("unclimbedPeaks", {
                type: "geojson",
                data: convertUnclimbedPeaksToGEOJson(
                    (peakSelection.data ?? []).filter(
                        (peak) =>
                            (!peak.isFavorited && !peak.isSummitted) ||
                            peak.isSummitted
                    )
                ),
                cluster: true,
                clusterMaxZoom: 14,
                clusterRadius: 50,
            });
            mapRef.current?.addSource("favoritePeaks", {
                type: "geojson",
                data: convertUnclimbedPeaksToGEOJson(
                    (peakSelection.data ?? []).filter(
                        (peak) => peak.isFavorited && !peak.isSummitted
                    )
                ),
                cluster: true,
                clusterMaxZoom: 14,
                clusterRadius: 50,
            });
        }

        mapRef.current?.addLayer({
            id: "clusters",
            type: "circle",
            source: "unclimbedPeaks",
            filter: ["has", "point_count"],
            paint: {
                "circle-color": theme.palette.secondary.onContainerDim,
                "circle-radius": 20,
            },
        });

        mapRef.current?.on("click", "clusters", (e) => {
            const features = mapRef.current?.queryRenderedFeatures(e.point, {
                layers: ["clusters"],
            });
            const clusterId = features?.[0].properties?.cluster_id;
            (
                mapRef?.current?.getSource(
                    "unclimbedPeaks"
                ) as mapboxgl.GeoJSONSource
            )?.getClusterExpansionZoom(clusterId, (err, zoom) => {
                if (err) return;

                if (features?.[0].geometry.type === "Point") {
                    mapRef.current?.easeTo({
                        center: features?.[0].geometry.coordinates as [
                            number,
                            number
                        ],
                        zoom: zoom ?? undefined,
                    });
                }
            });
        });

        mapRef.current?.addLayer({
            id: "cluster-count",
            type: "symbol",
            source: "unclimbedPeaks",
            filter: ["has", "point_count"],
            layout: {
                "text-field": ["get", "point_count_abbreviated"],
                "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                "text-size": 12,
            },
        });

        mapRef.current?.addLayer({
            id: "peakSummits",
            type: "symbol",
            source: "peakSummits",
            paint: {
                "text-color": theme.palette.primary.container,
            },
            layout: {
                "text-field": ["get", "Name"],
                "text-anchor": "top",
                "text-offset": [0, 1],
                "text-size": 12,
                "icon-image": "marker-primary",
                "icon-size": 0.2,
                "icon-allow-overlap": true,
                "icon-anchor": "bottom",
                "icon-ignore-placement": true,
                "text-optional": true,
            },
        });
        mapRef.current?.addLayer({
            id: "unclimbedPeaks",
            type: "symbol",
            source: "unclimbedPeaks",
            filter: ["!", ["has", "point_count"]],
            paint: {
                "text-color": [
                    "case",
                    ["==", ["get", "isSummitted"], 1],
                    theme.palette.primary.container,
                    theme.palette.secondary.container,
                ],
                // "text-color": theme.palette.primary.container,
            },
            layout: {
                "text-field": ["get", "Name"],
                "text-anchor": "top",
                "text-offset": [0, 1],
                "text-size": 12,
                "icon-image": [
                    "image",
                    [
                        "case",
                        ["==", ["get", "isSummitted"], 1],
                        "marker-primary",
                        "marker-secondary",
                    ],
                ],
                "icon-size": 0.2,
                "icon-allow-overlap": true,
                "icon-ignore-placement": true,
                "text-optional": true,
                "icon-anchor": "bottom",
            },
        });
        mapRef.current?.addLayer({
            id: "favoritePeaks",
            type: "symbol",
            source: "favoritePeaks",
            filter: ["!", ["has", "point_count"]],
            paint: {
                "text-color": theme.palette.tertiary.container,
            },
            layout: {
                "text-field": ["get", "Name"],
                "text-anchor": "top",
                "text-offset": [0, 1],
                "text-size": 12,
                "icon-image": "marker-tertiary",
                "icon-size": 0.2,
                "icon-allow-overlap": true,
                "icon-ignore-placement": true,
                "text-optional": true,
                "icon-anchor": "bottom",
            },
        });

        mapRef.current?.on("click", "peakSummits", (e) => {
            const feature = e.features?.[0];

            if (feature?.geometry.type === "Point" && mapRef.current) {
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
                    .addTo(mapRef.current);
            }
        });

        mapRef.current?.on("click", "unclimbedPeaks", (e) => {
            e.originalEvent?.stopPropagation();
            const feature = e.features?.[0];

            if (feature?.geometry.type === "Point" && mapRef.current) {
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
                                onFavoriteClick(peakId, newValue, true, e);
                            },
                            color: peak.isSummitted ? "primary" : "secondary",
                        })
                    )
                    .addTo(mapRef.current);
            }
        });

        mapRef.current?.on("click", "favoritePeaks", (e) => {
            e.originalEvent?.stopPropagation();
            const feature = e.features?.[0];

            if (feature?.geometry.type === "Point" && mapRef.current) {
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
                                onFavoriteClick(peakId, newValue, true, e);
                            },
                        })
                    )
                    .addTo(mapRef.current);
            }
        });
    };

    const onFavoriteClick = async (
        peakId: string,
        newValue: boolean,
        openPopup: boolean = true,
        event: MapMouseEvent | null = null
    ) => {
        if (newValue) {
            const unclimbedPeaksSource = mapRef.current?.getSource(
                "unclimbedPeaks"
            ) as GeoJSONSource;
            const unclimbedPeaksData = unclimbedPeaksSource.serialize()
                .data as GeoJSON.FeatureCollection<GeoJSON.Point>;
            const peak = unclimbedPeaksData?.features.find(
                (feature) => feature.properties?.Id === peakId
            ) as GeoJSON.Feature<GeoJSON.Point>;

            if (peak) {
                unclimbedPeaksData.features =
                    unclimbedPeaksData.features.filter(
                        (feature) => feature.properties?.Id !== peakId
                    );

                unclimbedPeaksSource?.setData(unclimbedPeaksData);

                const favoritePeaksSource = mapRef.current?.getSource(
                    "favoritePeaks"
                ) as GeoJSONSource;

                const favoritePeaksData = favoritePeaksSource?.serialize()
                    .data as GeoJSON.FeatureCollection<GeoJSON.Point>;

                favoritePeaksData.features = [
                    peak,
                    ...favoritePeaksData.features,
                ];

                favoritePeaksSource?.setData(favoritePeaksData);

                setPeaksState((state) => ({
                    ...state,
                    peakSelection: {
                        ...state.peakSelection,
                        type: "unclimbed",
                        data: [
                            ...unclimbedPeaksData.features,
                            ...favoritePeaksData.features,
                        ]
                            .map((p) => p.properties as UnclimbedPeak)
                            .sort(
                                (a, b) => (b.Altitude ?? 0) - (a.Altitude ?? 0)
                            ),
                    },
                }));

                if (openPopup && mapRef.current) {
                    const coordinates = peak.geometry.coordinates.slice();

                    const lngLat = mapboxgl.LngLat.convert(
                        coordinates as [number, number]
                    );

                    event?.target._popups.forEach((pop) => pop.remove());

                    new mapboxgl.Popup({ offset: 25 })
                        .setLngLat(lngLat)
                        .setDOMContent(
                            FavoritePopup({
                                peak: peak.properties as UnclimbedPeak,
                                units,
                                theme,
                                onUnfavoriteClick: (peakId, newValue) => {
                                    onFavoriteClick(peakId, newValue, true);
                                },
                            })
                        )
                        .addTo(mapRef.current);
                }
            }
        } else {
            const favoritePeaksSource = mapRef.current?.getSource(
                "favoritePeaks"
            ) as GeoJSONSource;
            const favoritePeaksData = favoritePeaksSource.serialize()
                .data as GeoJSON.FeatureCollection<GeoJSON.Point>;
            const peak = favoritePeaksData?.features.find(
                (feature) => feature.properties?.Id === peakId
            ) as GeoJSON.Feature<GeoJSON.Point>;

            if (peak) {
                favoritePeaksData.features = favoritePeaksData.features.filter(
                    (feature) => feature.properties?.Id !== peakId
                );

                favoritePeaksSource?.setData(favoritePeaksData);

                const unclimbedPeaksSource = mapRef.current?.getSource(
                    "unclimbedPeaks"
                ) as GeoJSONSource;

                const unclimbedPeaksData = unclimbedPeaksSource?.serialize()
                    .data as GeoJSON.FeatureCollection<GeoJSON.Point>;

                unclimbedPeaksData.features = [
                    peak,
                    ...unclimbedPeaksData.features,
                ];

                unclimbedPeaksSource?.setData(unclimbedPeaksData);

                setPeaksState((state) => ({
                    ...state,
                    peakSelection: {
                        ...state.peakSelection,
                        type: "unclimbed",
                        data: [
                            ...unclimbedPeaksData.features,
                            ...favoritePeaksData.features,
                        ]
                            .map((p) => p.properties as UnclimbedPeak)
                            .sort(
                                (a, b) => (b.Altitude ?? 0) - (a.Altitude ?? 0)
                            ),
                    },
                }));

                if (openPopup && mapRef.current) {
                    const coordinates = peak.geometry.coordinates.slice();

                    const lngLat = mapboxgl.LngLat.convert(
                        coordinates as [number, number]
                    );

                    event?.target._popups.forEach((pop) => pop.remove());

                    new mapboxgl.Popup({ offset: 25 })
                        .setLngLat(lngLat)
                        .setDOMContent(
                            UnclimbedPopup({
                                peak: peak.properties as UnclimbedPeak,
                                units,
                                theme,
                                onFavoriteClick: (peakId, newValue) => {
                                    onFavoriteClick(peakId, newValue, true);
                                },
                            })
                        )
                        .addTo(mapRef.current);
                }
            }
        }

        const success = await toggleFavoritePeak(peakId, newValue);

        if (!success) {
            dispatch({
                type: "SET_MESSAGE",
                payload: {
                    text: "Failed to update favorite status",
                    type: "error",
                },
            });

            const source = newValue ? "favoritePeaks" : "unclimbedPeaks";
            const target = newValue ? "unclimbedPeaks" : "favoritePeaks";

            const sourceData = mapRef.current?.getSource(
                source
            ) as GeoJSONSource;

            const data = sourceData.serialize()
                .data as GeoJSON.FeatureCollection<GeoJSON.Point>;

            const targetData = mapRef.current?.getSource(
                target
            ) as GeoJSONSource;

            const targetDataFeatures = targetData.serialize()
                .data as GeoJSON.FeatureCollection<GeoJSON.Point>;

            const peak = data.features.find(
                (feature) => feature.properties?.Id === peakId
            );

            if (peak) {
                data.features = data.features.filter(
                    (feature) => feature.properties?.Id !== peakId
                );

                sourceData.setData(data);

                targetDataFeatures.features = [
                    peak,
                    ...targetDataFeatures.features,
                ];

                targetData.setData(targetDataFeatures);

                if (openPopup && mapRef.current) {
                    const coordinates = peak.geometry.coordinates.slice();

                    const lngLat = mapboxgl.LngLat.convert(
                        coordinates as [number, number]
                    );

                    const existingPopup = event?.target._popups.find(
                        (pop) =>
                            pop._lngLat.lat === lngLat.lat &&
                            pop._lngLat.lng === lngLat.lng
                    );

                    if (existingPopup) {
                        existingPopup.remove();
                    }

                    new mapboxgl.Popup({ offset: 25 })
                        .setLngLat(lngLat)
                        .setDOMContent(
                            newValue
                                ? FavoritePopup({
                                      peak: peak.properties as UnclimbedPeak,
                                      units,
                                      theme,
                                      onUnfavoriteClick: (peakId, newValue) => {
                                          onFavoriteClick(
                                              peakId,
                                              newValue,
                                              true
                                          );
                                      },
                                  })
                                : UnclimbedPopup({
                                      peak: peak.properties as UnclimbedPeak,
                                      units,
                                      theme,
                                      onFavoriteClick: (peakId, newValue) => {
                                          onFavoriteClick(
                                              peakId,
                                              newValue,
                                              true
                                          );
                                      },
                                  })
                        )
                        .addTo(mapRef.current);
                }
            }

            setPeaksState((state) => ({
                ...state,
                peakSelection: {
                    ...state.peakSelection,
                    type: "unclimbed",
                    data: (peakSelection.data as UnclimbedPeak[]).map(
                        (peak): UnclimbedPeak => {
                            if (peak.Id === peakId) {
                                return {
                                    ...peak,
                                    isFavorited: !newValue,
                                };
                            }
                            return peak;
                        }
                    ),
                },
            }));
        }
    };

    React.useEffect(() => {
        initiateMap(mapContainerRef, mapRef, addMarkers, [
            user.long ?? -111.651302,
            user.lat ?? 35.198284,
        ]);

        setPeaksState((state) => ({
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

export default DashboardPeaksMap;
