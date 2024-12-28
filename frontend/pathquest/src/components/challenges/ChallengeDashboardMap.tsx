"use client";
import { useChallengeDashboard } from "@/state/ChallengeDashboardContext";
import React, { useCallback } from "react";
import MapboxContainer from "../common/MapboxContainer";
import mapboxgl from "mapbox-gl";
import { useUser } from "@/state/UserContext";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";
import ChallengePopup from "./ChallengePopup";
import { useTheme } from "@mui/material";
import "mapbox-gl/dist/mapbox-gl.css";
import loadMapDefaults from "@/helpers/loadMapDefaults";
import initiateMap from "@/helpers/initiateMap";

const ChallengeDashboardMap = () => {
    const [, setChallengeDashboardState] = useChallengeDashboard();
    const [{ user }] = useUser();

    const mapContainerRef = React.useRef<any>(null);
    const mapRef = React.useRef<mapboxgl.Map | null>(null);

    const theme = useTheme();

    if (!user) return null;

    const addMarkers = () => {
        if (!mapRef.current) return;

        loadMapDefaults(mapRef.current, theme, "challenges");

        mapRef.current?.addSource("challenges", {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: [],
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

        mapRef.current?.on("click", "challenges", (e) => {
            const properties =
                (e?.features?.[0].properties as ChallengeProgress) ?? null;

            if (!properties) return;

            new mapboxgl.Popup()
                .setLngLat([
                    properties.centerLong ?? 0,
                    properties.centerLat ?? 0,
                ])
                .setHTML(
                    ChallengePopup({
                        challenge: properties,
                        theme,
                    })
                )
                .addTo(mapRef.current!);
        });
    };

    React.useEffect(() => {
        initiateMap(
            mapContainerRef,
            mapRef,
            addMarkers,
            [user.long ?? -111.651302, user.lat ?? 35.198284],
            6
        );

        setChallengeDashboardState((state) => ({
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

export default ChallengeDashboardMap;
