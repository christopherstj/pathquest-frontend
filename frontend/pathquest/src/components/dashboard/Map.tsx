"use client";
import React from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Grid2 as Grid, Box, SxProps, useTheme } from "@mui/material";
import { usePeaks } from "@/state/PeaksContext";
import PeakMarker from "./PeakMarker";
import { useUser } from "@/state/UserContext";
import metersToFt from "@/helpers/metersToFt";
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
import FavoritedPeak from "@/typeDefs/FavoritedPeak";
import getIsFavorited from "@/actions/getIsPeakFavorited";

const containerStyles: SxProps = {
    height: {
        xs: "70vh",
        md: "60vh",
    },
    width: "100%",
    borderRadius: "8px",
    overflow: "hidden",
    ".mapboxgl-popup-tip": {
        borderTopColor: "background.paper",
    },
    ".mapboxgl-popup-content": {
        backgroundColor: "background.paper",
        borderRadius: "6px",
        padding: "12px 8px 8px 8px",
        fontFamily: "var(--font-merriweather-sans)",
        ".link-primary": {
            color: "primary.onContainer",
            textDecoration: "none",
            fontFamily: "var(--font-merriweather-sans)",
            padding: "4px 12px",
            borderRadius: "8px",
            border: "1px solid",
            borderColor: "primary.onContainer",
            width: "100%",
            "&:hover": {
                textDecoration: "underline",
            },
        },
        ".tag-primary": {
            color: "primary.onContainer",
            backgroundColor: "primary.containerDim",
            padding: "2px 4px",
            borderRadius: "8px",
            margin: "4px 0",
        },
        ".link-secondary": {
            color: "secondary.onContainer",
            textDecoration: "none",
            fontFamily: "var(--font-merriweather-sans)",
            padding: "4px 12px",
            borderRadius: "8px",
            border: "1px solid",
            borderColor: "secondary.onContainer",
            width: "100%",
            "&:hover": {
                textDecoration: "underline",
            },
        },
        ".button-secondary": {
            color: "secondary.onContainer",
            fontWeight: "bold",
            fontFamily: "var(--font-merriweather-sans)",
            textDecoration: "none",
            padding: "4px",
            borderRadius: "12px",
            width: "100%",
            border: "1px solid",
            borderColor: "secondary.onContainerDim",
            backgroundColor: "transparent",
            marginTop: "8px",
            "&:hover": {
                backgroundColor: "secondary.containerDim",
            },
        },
        ".tag-secondary": {
            color: "secondary.onContainer",
            backgroundColor: "secondary.containerDim",
            padding: "2px 4px",
            borderRadius: "8px",
            margin: "4px 0",
        },
        ".link-tertiary": {
            color: "tertiary.onContainer",
            textDecoration: "none",
            fontFamily: "var(--font-merriweather-sans)",
            padding: "4px 12px",
            borderRadius: "8px",
            border: "1px solid",
            borderColor: "tertiary.onContainer",
            width: "100%",
            "&:hover": {
                textDecoration: "underline",
            },
        },
        ".tag-tertiary": {
            color: "tertiary.onContainer",
            backgroundColor: "tertiary.containerDim",
            padding: "2px 4px",
            borderRadius: "8px",
            margin: "4px 0",
        },
    },
    ".mapboxgl-popup-close-button": {
        right: "4px",
        color: "primary.onContainer",
    },
};

const Map = () => {
    const [peaks, setPeaksState] = usePeaks();
    const [{ user }] = useUser();
    const [, dispatch] = useMessage();

    if (!user) return null;

    const { units } = user;

    const theme = useTheme();

    const { peakSummits, favoritePeaks, unclimbedPeaks } = peaks;

    const mapRef = React.useRef<any>(null);
    const mapContainerRef = React.useRef<any>(null);

    console.log(unclimbedPeaks);

    const onFavoriteClick = async (peakId: string, newValue: boolean) => {
        if (newValue) {
            const isFavorited = await getIsFavorited(peakId);

            if (isFavorited) {
                dispatch({
                    type: "SET_MESSAGE",
                    payload: {
                        text: "Peak is already favorited",
                        type: "error",
                    },
                });
                return;
            }
        }

        setPeaksState((state) => {
            if (!state.unclimbedPeaks) return state;

            const newPeaks = state.unclimbedPeaks.map((peak) => {
                if (peak.Id === peakId) {
                    return { ...peak, isFavorited: newValue };
                }
                return peak;
            });

            if (state.favoritePeaks) {
                const newfavoritePeaks = newValue
                    ? [
                          newPeaks.find(
                              (peak) => peak.Id === peakId
                          ) as FavoritedPeak,
                          ...state.favoritePeaks,
                      ]
                    : state.favoritePeaks.filter((peak) => peak.Id !== peakId);
                return {
                    ...state,
                    unclimbedPeaks: newPeaks,
                    favoritePeaks: newfavoritePeaks,
                };
            }
            return {
                ...state,
                unclimbedPeaks: newPeaks,
            };
        });

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
                const newPeaks = state.unclimbedPeaks.map((peak) => {
                    if (peak.Id === peakId) {
                        return { ...peak, favorite: !newValue };
                    }
                    return peak;
                });

                if (state.favoritePeaks) {
                    const newfavoritePeaks = !newValue
                        ? [
                              newPeaks.find(
                                  (peak) => peak.Id === peakId
                              ) as FavoritedPeak,
                              ...state.favoritePeaks,
                          ]
                        : state.favoritePeaks.filter(
                              (peak) => peak.Id !== peakId
                          );
                    return {
                        ...state,
                        unclimbedPeaks: newPeaks,
                        favoritePeaks: newfavoritePeaks,
                    };
                }
                return {
                    ...state,
                    unclimbedPeaks: newPeaks,
                };
            });
        }
    };

    const addMarkers = () => {
        if (mapRef.current) {
            unclimbedPeaks?.forEach((peak) => {
                if (peak.isFavorited) return;
                const el = UnclimbedMarker();
                new mapboxgl.Marker(el)
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
            });
            favoritePeaks?.forEach((peak) => {
                const el = FavoriteMarker();
                new mapboxgl.Marker(el)
                    .setLngLat([peak.Long, peak.Lat])
                    .setPopup(
                        new mapboxgl.Popup({ offset: 25 }).setHTML(
                            FavoritePopup({ peak, units, theme })
                        )
                    )
                    .addTo(mapRef.current);
            });
            peakSummits?.forEach((peak) => {
                const el = PeakMarker();
                new mapboxgl.Marker(el)
                    .setLngLat([peak.Long, peak.Lat])
                    .setPopup(
                        new mapboxgl.Popup({ offset: 25 }).setHTML(
                            CompletedPopup({ peak, units, theme })
                        )
                    )
                    .addTo(mapRef.current);
            });
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
                <Box sx={containerStyles}>
                    <div
                        id="map-container"
                        ref={mapContainerRef}
                        style={{ height: "100%", width: "100%" }}
                    />
                </Box>
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
                <UnclimbedPeaksList onRowClick={onRowClick} />
            </Grid>
            <Grid
                size={{ xs: 12, md: 6, lg: 4 }}
                display="flex"
                flexDirection="column"
                gap="16px"
            >
                <FavoritePeaks onRowClick={onRowClick} />
            </Grid>
        </>
    );
};

export default Map;
