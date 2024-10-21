"use client";
import convertPeakSummitsToGeoJSON from "@/helpers/convertPeakSummitsToGeoJSON";
import { usePeaks } from "@/state/PeaksContext";
import { usePeaksMap } from "@/state/PeaksMapContext";
import { useUser } from "@/state/UserContext";
import { Box, SxProps, useTheme } from "@mui/material";
import mapboxgl, { GeoJSONSource } from "mapbox-gl";
import React from "react";
import primaryMarker from "@/public/images/marker-primary.png";
import secondaryMarker from "@/public/images/marker-secondary.png";
import tertiaryMarker from "@/public/images/marker-tertiary.png";
import getUnclimbedPeaksWithBounds from "@/actions/getUnclimbedPeaksWithBounds";
import convertUnclimbedPeaksToGEOJson from "@/helpers/convertUnclimbedPeaksToGEOJson";
import PeakSummit from "@/typeDefs/PeakSummit";
import CompletedPopup from "../dashboard/CompletedPopup";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxContainer from "../common/MapboxContainer";
import UnclimbedPopup from "../dashboard/UnclimbedPopup";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import FavoritePopup from "../dashboard/FavoritePopup";

const mapContainerStyles: SxProps = {
    height: "calc(100vh - 32px)",
    width: "100%",
    borderRadius: "12px",
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
        ".button-tertiary": {
            color: "tertiary.onContainer",
            fontWeight: "bold",
            fontFamily: "var(--font-merriweather-sans)",
            textDecoration: "none",
            padding: "4px",
            borderRadius: "12px",
            width: "100%",
            border: "1px solid",
            borderColor: "tertiary.onContainerDim",
            backgroundColor: "transparent",
            marginTop: "8px",
            "&:hover": {
                backgroundColor: "tertiary.containerDim",
            },
        },
    },
    ".mapboxgl-popup-close-button": {
        right: "4px",
        color: "primary.onContainer",
    },
};

const DashboardPeaksMap = () => {
    const [{ user }] = useUser();
    const [{ peakSummits, peakSelection }] = usePeaks();
    const [peaksMap, setPeaksMapState] = usePeaksMap();

    const theme = useTheme();

    const mapRef = React.useRef<mapboxgl.Map | null>(null);
    const mapContainerRef = React.useRef<any>(null);

    if (!user) return null;

    const { units } = user;

    const addMarkers = () => {
        mapRef.current?.addControl(new mapboxgl.NavigationControl());

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
            e.originalEvent.stopPropagation();
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
                                // onFavoriteClick(peakId, newValue);
                            },
                        })
                    )
                    .addTo(mapRef.current);
            }
        });

        mapRef.current?.on("click", "favoritePeaks", (e) => {
            e.originalEvent.stopPropagation();
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
                                // onFavoriteClick(peakId, newValue);
                            },
                        })
                    )
                    .addTo(mapRef.current);
            }
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

        setPeaksMapState((state) => ({
            ...state,
            map: mapRef.current,
        }));

        return () => {
            mapRef.current?.remove();
        };
    }, []);

    return (
        <MapboxContainer sx={{ height: "calc(100vh - 32px)" }}>
            <div
                id="map-container"
                ref={mapContainerRef}
                style={{ height: "100%", width: "100%" }}
            />
        </MapboxContainer>
    );
};

export default DashboardPeaksMap;
