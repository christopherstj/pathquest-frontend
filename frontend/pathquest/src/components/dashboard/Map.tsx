"use client";
import React from "react";
import mapboxgl, { GeoJSONSource, MapMouseEvent } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Grid2 as Grid, Box, SxProps, useTheme } from "@mui/material";
import { usePeaks } from "@/state/PeaksContext";
import PeakMarker from "./PeakMarker";
import { useUser } from "@/state/UserContext";
import PeaksSummitList from "./PeaksSummitList";
import UnclimbedPeaksList from "./UnclimbedPeaksList";
import FavoritePeaks from "./FavoritePeaks";
import CompletedPopup from "./CompletedPopup";
import FavoriteMarker from "./FavoriteMarker";
import FavoritePopup from "./FavoritePopup";
import UnclimbedMarker from "./UnclimbedMarker";
import UnclimbedPopup from "./UnclimbedPopup";
import toggleFavoritePeak from "@/actions/toggleFavoritePeak";
import { useMessage } from "@/state/MessageContext";
import MapboxContainer from "../common/MapboxContainer";
import primaryMarker from "@/public/images/marker-primary.png";
import secondaryMarker from "@/public/images/marker-secondary.png";
import tertiaryMarker from "@/public/images/marker-tertiary.png";
import convertPeakSummitsToGeoJSON from "@/helpers/convertPeakSummitsToGeoJSON";
import convertUnclimbedPeaksToGEOJson from "@/helpers/convertUnclimbedPeaksToGEOJson";
import PeakSummit from "@/typeDefs/PeakSummit";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import primaryChallenge from "@/public/images/challenge-primary.png";
import { useChallenges } from "@/state/ChallengesContext";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";
import ChallengePopup from "../challenges/ChallengePopup";

const Map = () => {
    const [peaks, setPeaksState] = usePeaks();
    const [{ incompleteChallenges }] = useChallenges();
    const [{ user }] = useUser();
    const [, dispatch] = useMessage();

    if (!user) return null;

    const { units } = user;

    const theme = useTheme();

    const { peakSummits, favoritePeaks, unclimbedPeaks, map } = peaks;

    const mapRef = React.useRef<mapboxgl.Map | null>(null);
    const mapContainerRef = React.useRef<any>(null);

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
                    unclimbedPeaks: [
                        ...unclimbedPeaksData.features
                            .map((p) => ({
                                ...(p.properties as UnclimbedPeak),
                                isFavorited: false,
                            }))
                            .sort(
                                (a, b) => (a.distance ?? 0) - (b.distance ?? 0)
                            ),
                        ...favoritePeaksData.features.map((p) => ({
                            ...(p.properties as UnclimbedPeak),
                            isFavorited: true,
                        })),
                    ],
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
                    unclimbedPeaks: [
                        ...unclimbedPeaksData.features
                            .map((p) => ({
                                ...(p.properties as UnclimbedPeak),
                                isFavorited: false,
                            }))
                            .sort(
                                (a, b) => (a.distance ?? 0) - (b.distance ?? 0)
                            ),
                        ...favoritePeaksData.features.map((p) => ({
                            ...(p.properties as UnclimbedPeak),
                            isFavorited: true,
                        })),
                    ],
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
                unclimbedPeaks: [
                    ...data.features
                        .map((p) => ({
                            ...(p.properties as UnclimbedPeak),
                            isFavorited: false,
                        }))
                        .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0)),
                    ...targetDataFeatures.features.map((p) => ({
                        ...(p.properties as UnclimbedPeak),
                        isFavorited: true,
                    })),
                ],
            }));
        }
    };

    const addMarkers = () => {
        if (mapRef.current !== null) {
            mapRef.current.addControl(
                new mapboxgl.NavigationControl(),
                "top-left"
            );

            mapRef.current.loadImage(primaryMarker.src, (error, image) => {
                if (error) throw error;
                if (image) mapRef.current?.addImage("marker-primary", image);
            });
            mapRef.current.loadImage(secondaryMarker.src, (error, image) => {
                if (error) throw error;
                if (image) mapRef.current?.addImage("marker-secondary", image);
            });
            mapRef.current.loadImage(tertiaryMarker.src, (error, image) => {
                if (error) throw error;
                if (image) mapRef.current?.addImage("marker-tertiary", image);
            });
            mapRef.current?.loadImage(primaryChallenge.src, (error, image) => {
                if (error) throw error;
                if (image) mapRef.current?.addImage("challenge-primary", image);
            });

            mapRef.current?.addSource("peakSummits", {
                type: "geojson",
                data: convertPeakSummitsToGeoJSON(peakSummits ?? []),
            });
            mapRef.current?.addSource("unclimbedPeaks", {
                type: "geojson",
                data: convertUnclimbedPeaksToGEOJson(
                    (unclimbedPeaks ?? []).filter((peak) => !peak.isFavorited)
                ),
            });
            mapRef.current?.addSource("favoritePeaks", {
                type: "geojson",
                data: convertUnclimbedPeaksToGEOJson(
                    (unclimbedPeaks ?? []).filter((peak) => peak.isFavorited)
                ),
            });
            mapRef.current?.addSource("challenges", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: (incompleteChallenges ?? []).map((d) => ({
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

            mapRef.current?.addLayer({
                id: "peakSummits",
                type: "symbol",
                source: "peakSummits",
                layout: {
                    "icon-image": "marker-primary",
                    "icon-size": 0.2,
                    "icon-allow-overlap": true,
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
                },
            });
            mapRef.current?.addLayer({
                id: "challenges",
                type: "symbol",
                source: "challenges",
                layout: {
                    "icon-image": "challenge-primary",
                    "icon-size": 0.2,
                    "icon-allow-overlap": true,
                },
            });

            mapRef.current?.on("click", "peakSummits", (e) => {
                e.originalEvent.preventDefault();
                e.originalEvent.stopPropagation();

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
                e.originalEvent.preventDefault();
                e.originalEvent.stopPropagation();

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
                            })
                        )
                        .addTo(mapRef.current);
                }
            });

            mapRef.current?.on("click", "favoritePeaks", (e) => {
                e.originalEvent.preventDefault();
                e.originalEvent.stopPropagation();

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
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            center: [user.long ?? -111.651302, user.lat ?? 35.198284],
            zoom: 8,
        });

        mapRef.current.on("load", addMarkers);

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
            <Grid
                size={{ xs: 12, md: 6, lg: 4 }}
                display="flex"
                flexDirection="column"
                gap="16px"
            >
                <PeaksSummitList />
            </Grid>
            <Grid
                size={{ xs: 12, md: 6, lg: 4 }}
                display="flex"
                flexDirection="column"
                gap="16px"
            >
                <UnclimbedPeaksList onFavoriteClick={onFavoriteClick} />
            </Grid>
            <Grid
                size={{ xs: 12, md: 6, lg: 4 }}
                display="flex"
                flexDirection="column"
                gap="16px"
            >
                <FavoritePeaks onFavoriteClick={onFavoriteClick} />
            </Grid>
        </>
    );
};

export default Map;
