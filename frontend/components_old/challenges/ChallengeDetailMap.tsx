"use client";
import React from "react";
import MapboxContainer from "../common/MapboxContainer";
import mapboxgl from "mapbox-gl";
import { useChallengeDetail } from "@/state_old/ChallengeDetailContext";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTheme } from "@mui/material";
import { useUser } from "@/state_old/UserContext";
import addChallengeDetailMarkers from "./helpers/addChallengeDetailMarkers";
import onFavoriteClick from "./helpers/onFavoriteClick";
import initiateMap from "@/helpers/initiateMap";

const ChallengeDetailMap = () => {
    const [{ challenge, peaks, activityCoords }, setChallengeDetailState] =
        useChallengeDetail();
    const [{ user }] = useUser();

    const units = user?.units ?? "metric";

    const theme = useTheme();

    const mapContainerRef = React.useRef<any>(null);
    const mapRef = React.useRef<mapboxgl.Map | null>(null);

    React.useEffect(() => {
        initiateMap(
            mapContainerRef,
            mapRef,
            () => {
                addChallengeDetailMarkers(
                    mapRef.current,
                    { peaks, activityCoords },
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
            },
            [challenge.centerLong ?? 0, challenge.centerLat ?? 0]
        );

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
                    md: "calc(100vh - 88px)",
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
