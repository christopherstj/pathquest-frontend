"use client";
import { useChallengeDashboard } from "@/state/ChallengeDashboardContext";
import React, { useCallback } from "react";
import MapboxContainer from "../common/MapboxContainer";
import mapboxgl from "mapbox-gl";
import { useUser } from "@/state/UserContext";
import primaryMarker from "@/public/images/challenge-primary.png";
import secondaryMarker from "@/public/images/challenge-secondary.png";
import tertiaryMarker from "@/public/images/challenge-tertiary.png";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";
import ChallengePopup from "./ChallengePopup";
import { useTheme } from "@mui/material";
import "mapbox-gl/dist/mapbox-gl.css";

const ChallengeDashboardMap = () => {
    const [, setChallengeDashboardState] = useChallengeDashboard();
    const [{ user }] = useUser();

    const mapContainerRef = React.useRef<any>(null);
    const mapRef = React.useRef<mapboxgl.Map | null>(null);

    const theme = useTheme();

    if (!user) return null;

    const addMarkers = () => {
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
                        "marker-primary",
                        ["==", ["get", "completed"], 0],
                        "marker-secondary",
                        "marker-tertiary",
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
        mapboxgl.accessToken =
            "pk.eyJ1IjoiY2hyaXN0b3BoZXJzdGoiLCJhIjoiY20yZThlMW12MDJwMzJycTAwYzd5ZGhxYyJ9.yj5sadTuPldjsWchDuJ3WA";
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            center: [user.long ?? 0, user.lat ?? 0],
            zoom: 6,
        });

        mapRef.current.on("load", () => {
            addMarkers();
        });

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
