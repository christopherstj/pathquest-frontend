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

const containerStyles: SxProps = {
    height: {
        xs: "70vh",
        md: "60vh",
    },
    width: "100%",
    borderRadius: "8px",
    overflow: "hidden",
    ".mapboxgl-popup-tip": {
        borderTopColor: "primary.container",
    },
    ".mapboxgl-popup-content": {
        backgroundColor: "primary.container",
        borderRadius: "6px",
        padding: "12px 8px 8px 8px",
        fontFamily: "var(--font-merriweather-sans)",
        ".link": {
            color: "primary.onContainer",
            textDecoration: "none",
            padding: "2px 4px",
            borderRadius: "4px",
            backgroundColor: "primary.containerDim",
            "&:hover": {
                textDecoration: "underline",
            },
        },
    },
    ".mapboxgl-popup-close-button": {
        right: "4px",
        color: "primary.onContainer",
    },
};

const Map = () => {
    const [peaks] = usePeaks();
    const [{ user }] = useUser();

    if (!user) return null;

    const { units } = user;

    const theme = useTheme();

    const { peakSummits } = peaks;

    const mapRef = React.useRef<any>(null);
    const mapContainerRef = React.useRef<any>(null);

    const addMarkers = () => {
        if (mapRef.current) {
            peakSummits?.forEach((peak) => {
                const el = PeakMarker();
                new mapboxgl.Marker(el)
                    .setLngLat([peak.Long, peak.Lat])
                    .setPopup(
                        new mapboxgl.Popup({ offset: 25 }).setHTML(
                            `
                                <p style="font-size: 16px; color: ${
                                    theme.palette.primary.onContainer
                                }; margin-bottom: 8px">
                                    ${peak.Name}
                                </p>
                                ${
                                    peak.Altitude
                                        ? `<p style="color: ${
                                              theme.palette.primary
                                                  .onContainerDim
                                          }">
                                        ${Math.round(
                                            units === "metric"
                                                ? peak.Altitude
                                                : metersToFt(peak.Altitude)
                                        )}${units === "metric" ? " m" : " ft"}
                                    </p>    
                                `
                                        : ""
                                }
                                <p style="color: ${
                                    theme.palette.primary.onContainerDim
                                }">
                                    ${peak.ascents.length} summit${
                                peak.ascents.length > 1 ? "s" : ""
                            }
                                </p>
                                <a href="/app/peaks/${peak.Id}" class="link">
                                    View Peak
                                </a>
                            `
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
        </>
    );
};

export default Map;
