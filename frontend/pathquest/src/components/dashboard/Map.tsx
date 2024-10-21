"use client";
import React from "react";
import mapboxgl from "mapbox-gl";
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

const Map = () => {
    const [peaks, setPeaksState] = usePeaks();
    const [{ user }] = useUser();
    const [, dispatch] = useMessage();

    const [markers, setMarkers] = React.useState<{
        completed: {
            peakId: string;
            marker: mapboxgl.Marker;
        }[];
        favorite: {
            peakId: string;
            marker: mapboxgl.Marker;
        }[];
        unclimbed: {
            peakId: string;
            marker: mapboxgl.Marker;
        }[];
    }>({
        completed: [],
        favorite: [],
        unclimbed: [],
    });

    if (!user) return null;

    const { units } = user;

    const theme = useTheme();

    const { peakSummits, favoritePeaks, unclimbedPeaks } = peaks;

    const mapRef = React.useRef<any>(null);
    const mapContainerRef = React.useRef<any>(null);

    const onFavoriteClick = async (
        peakId: string,
        newValue: boolean,
        openPopup: boolean = true
    ) => {
        const newMarkers = {
            ...markers,
        };

        setPeaksState((state) => {
            console.log("here");
            if (!state.unclimbedPeaks) return state;

            if (newValue) {
                const editedPeak = state.unclimbedPeaks.find(
                    (peak) => peak.Id === peakId
                );

                if (!editedPeak) return state;

                const unclimbedMarker = markers.unclimbed.find(
                    (marker) => marker.peakId === peakId
                );

                if (unclimbedMarker) {
                    if (openPopup) unclimbedMarker.marker.togglePopup();
                    unclimbedMarker.marker.remove();
                }

                newMarkers.unclimbed = markers.unclimbed.filter(
                    (marker) => marker.peakId !== peakId
                );
                const newMarker = new mapboxgl.Marker(FavoriteMarker())
                    .setLngLat([editedPeak.Long, editedPeak.Lat])
                    .setPopup(
                        new mapboxgl.Popup({
                            offset: 25,
                        }).setDOMContent(
                            FavoritePopup({
                                peak: editedPeak,
                                units,
                                theme,
                                onUnfavoriteClick: onFavoriteClick,
                            })
                        )
                    )
                    .addTo(mapRef.current);

                if (openPopup) newMarker.togglePopup();

                newMarkers.favorite = [
                    ...markers.favorite,
                    {
                        peakId,
                        marker: newMarker,
                    },
                ];

                return {
                    ...state,
                    unclimbedPeaks: state.unclimbedPeaks.map((peak) => {
                        if (peak.Id === peakId) {
                            return { ...peak, isFavorited: true };
                        }
                        return peak;
                    }),
                    favoritePeaks: [
                        {
                            ...editedPeak,
                            isFavorited: true,
                        },
                        ...(state.favoritePeaks ?? []),
                    ],
                };
            } else {
                const editedPeak = state.favoritePeaks?.find(
                    (peak) => peak.Id === peakId
                );

                if (!editedPeak) return state;

                const favoriteMarker = markers.favorite.find(
                    (marker) => marker.peakId === peakId
                );
                if (openPopup) favoriteMarker?.marker.togglePopup();
                favoriteMarker?.marker.remove();

                newMarkers.favorite = markers.favorite.filter(
                    (marker) => marker.peakId !== peakId
                );

                const newMarker = new mapboxgl.Marker(UnclimbedMarker())
                    .setLngLat([editedPeak.Long, editedPeak.Lat])
                    .setPopup(
                        new mapboxgl.Popup({
                            offset: 25,
                        }).setDOMContent(
                            UnclimbedPopup({
                                peak: {
                                    ...editedPeak,
                                    distance: 0,
                                },
                                units,
                                theme,
                                onFavoriteClick,
                            })
                        )
                    )
                    .addTo(mapRef.current);
                if (openPopup)
                    newMarker.togglePopup(),
                        (newMarkers.unclimbed = [
                            ...markers.unclimbed,
                            {
                                peakId,
                                marker: newMarker,
                            },
                        ]);

                return {
                    ...state,
                    unclimbedPeaks: state.unclimbedPeaks.map((peak) => {
                        if (peak.Id === peakId) {
                            return { ...peak, isFavorited: false };
                        }
                        return peak;
                    }),
                    favoritePeaks: (state.favoritePeaks ?? []).filter(
                        (peak) => peak.Id !== peakId
                    ),
                };
            }
        });

        setMarkers(newMarkers);

        const success = await toggleFavoritePeak(peakId, newValue);

        if (!success) {
            dispatch({
                type: "SET_MESSAGE",
                payload: {
                    text: "Failed to update favorite status",
                    type: "error",
                },
            });
            setPeaksState((state) => {
                if (!state.unclimbedPeaks) return state;

                if (newValue) {
                    const editedPeak = state.favoritePeaks?.find(
                        (peak) => peak.Id === peakId
                    );

                    if (!editedPeak) return state;

                    const favoriteMarker = markers.favorite.find(
                        (marker) => marker.peakId === peakId
                    );
                    if (openPopup) favoriteMarker?.marker.togglePopup();
                    favoriteMarker?.marker.remove();

                    newMarkers.favorite = markers.favorite.filter(
                        (marker) => marker.peakId !== peakId
                    );
                    newMarkers.unclimbed = [
                        ...markers.unclimbed,
                        {
                            peakId,
                            marker: new mapboxgl.Marker(UnclimbedMarker())
                                .setLngLat([editedPeak.Long, editedPeak.Lat])
                                .setPopup(
                                    new mapboxgl.Popup({
                                        offset: 25,
                                    }).setDOMContent(
                                        UnclimbedPopup({
                                            peak: {
                                                ...editedPeak,
                                                distance: 0,
                                            },
                                            units,
                                            theme,
                                            onFavoriteClick,
                                        })
                                    )
                                )
                                .addTo(mapRef.current),
                        },
                    ];

                    return {
                        ...state,
                        unclimbedPeaks: state.unclimbedPeaks.map((peak) => {
                            if (peak.Id === peakId) {
                                return { ...peak, isFavorited: false };
                            }
                            return peak;
                        }),
                        favoritePeaks: (state.favoritePeaks ?? []).filter(
                            (peak) => peak.Id !== peakId
                        ),
                    };
                } else {
                    const editedPeak = state.unclimbedPeaks.find(
                        (peak) => peak.Id === peakId
                    );

                    if (!editedPeak) return state;

                    const unclimbedMarker = markers.unclimbed.find(
                        (marker) => marker.peakId === peakId
                    );
                    if (openPopup) unclimbedMarker?.marker.togglePopup();
                    unclimbedMarker?.marker.remove();

                    newMarkers.unclimbed = markers.unclimbed.filter(
                        (marker) => marker.peakId !== peakId
                    );
                    newMarkers.favorite = [
                        ...markers.favorite,
                        {
                            peakId,
                            marker: new mapboxgl.Marker(FavoriteMarker())
                                .setLngLat([editedPeak.Long, editedPeak.Lat])
                                .setPopup(
                                    new mapboxgl.Popup({
                                        offset: 25,
                                    }).setDOMContent(
                                        FavoritePopup({
                                            peak: editedPeak,
                                            units,
                                            theme,
                                            onUnfavoriteClick: onFavoriteClick,
                                        })
                                    )
                                )
                                .addTo(mapRef.current),
                        },
                    ];

                    return {
                        ...state,
                        unclimbedPeaks: state.unclimbedPeaks.map((peak) => {
                            if (peak.Id === peakId) {
                                return { ...peak, isFavorited: true };
                            }
                            return peak;
                        }),
                        favoritePeaks: [
                            {
                                ...editedPeak,
                                favorite: true,
                            },
                            ...(state.favoritePeaks ?? []),
                        ],
                    };
                }
            });
            setMarkers(newMarkers);
        }
    };

    const addMarkers = () => {
        if (mapRef.current) {
            const newMarkers: {
                completed: {
                    peakId: string;
                    marker: mapboxgl.Marker;
                }[];
                favorite: {
                    peakId: string;
                    marker: mapboxgl.Marker;
                }[];
                unclimbed: {
                    peakId: string;
                    marker: mapboxgl.Marker;
                }[];
            } = {
                completed: [],
                favorite: [],
                unclimbed: [],
            };
            unclimbedPeaks?.forEach((peak) => {
                if (peak.isFavorited) return;
                const el = UnclimbedMarker();
                const marker = new mapboxgl.Marker(el)
                    .setLngLat([peak.Long, peak.Lat])
                    .setPopup(
                        new mapboxgl.Popup({ offset: 25 }).setDOMContent(
                            UnclimbedPopup({
                                peak,
                                units,
                                theme,
                                onFavoriteClick,
                            })
                        )
                    )
                    .addTo(mapRef.current);
                newMarkers.unclimbed.push({ peakId: peak.Id, marker });
            });
            favoritePeaks?.forEach((peak) => {
                const el = FavoriteMarker();
                const marker = new mapboxgl.Marker(el)
                    .setLngLat([peak.Long, peak.Lat])
                    .setPopup(
                        new mapboxgl.Popup({ offset: 25 }).setDOMContent(
                            FavoritePopup({
                                peak,
                                units,
                                theme,
                                onUnfavoriteClick: onFavoriteClick,
                            })
                        )
                    )
                    .addTo(mapRef.current);
                newMarkers.favorite.push({ peakId: peak.Id, marker });
            });
            peakSummits?.forEach((peak) => {
                const el = PeakMarker();
                const marker = new mapboxgl.Marker(el)
                    .setLngLat([peak.Long, peak.Lat])
                    .setPopup(
                        new mapboxgl.Popup({ offset: 25 }).setHTML(
                            CompletedPopup({ peak, units, theme })
                        )
                    )
                    .addTo(mapRef.current);
                newMarkers.completed.push({ peakId: peak.Id, marker });
            });
            setMarkers(newMarkers);
        }
    };

    const onRowClick = (lat: number, long: number) => {
        mapRef.current.flyTo({
            center: [long, lat],
            zoom: 12,
        });
    };

    React.useEffect(() => {
        mapboxgl.accessToken =
            "pk.eyJ1IjoiY2hyaXN0b3BoZXJzdGoiLCJhIjoiY20yZThlMW12MDJwMzJycTAwYzd5ZGhxYyJ9.yj5sadTuPldjsWchDuJ3WA";
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            center: [user.long ?? -111.651302, user.lat ?? 35.198284],
            zoom: 8,
        });

        mapRef.current.on("load", addMarkers);

        return () => {
            mapRef.current.remove();
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
                <PeaksSummitList onRowClick={onRowClick} />
            </Grid>
            <Grid
                size={{ xs: 12, md: 6, lg: 4 }}
                display="flex"
                flexDirection="column"
                gap="16px"
            >
                <UnclimbedPeaksList
                    onRowClick={onRowClick}
                    onFavoriteClick={onFavoriteClick}
                />
            </Grid>
            <Grid
                size={{ xs: 12, md: 6, lg: 4 }}
                display="flex"
                flexDirection="column"
                gap="16px"
            >
                <FavoritePeaks
                    onRowClick={onRowClick}
                    onFavoriteClick={onFavoriteClick}
                />
            </Grid>
        </>
    );
};

export default Map;
