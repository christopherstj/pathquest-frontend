"use client";
import React from "react";
import MapboxContainer from "../common/MapboxContainer";
import mapboxgl from "mapbox-gl";
import { useChallengeDetail } from "@/state/ChallengeDetailContext";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTheme } from "@mui/material";
import { useUser } from "@/state/UserContext";
import addChallengeDetailMarkers from "./helpers/addChallengeDetailMarkers";
import onFavoriteClick from "./helpers/onFavoriteClick";

const ChallengeDetailMap = () => {
    const [{ challenge, peaks }, setChallengeDetailState] =
        useChallengeDetail();
    const [{ user }] = useUser();

    const units = user?.units ?? "metric";

    const theme = useTheme();

    const mapContainerRef = React.useRef<any>(null);
    const mapRef = React.useRef<mapboxgl.Map | null>(null);

    React.useEffect(() => {
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            center: [challenge.centerLong ?? 0, challenge.centerLat ?? 0],
            zoom: 6,
        });

        mapRef.current.on("load", () => {
            addChallengeDetailMarkers(
                mapRef.current,
                peaks,
                theme,
                units,
                (peakId: string, newValue: boolean) =>
                    onFavoriteClick(
                        peaks,
                        setChallengeDetailState,
                        mapRef.current,
                        theme,
                        units,
                        peakId,
                        newValue
                    )
            );
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
