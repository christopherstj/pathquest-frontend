"use client";
import { useActivityDetail } from "@/state/ActivityDetailsContext";
import { useUser } from "@/state/UserContext";
import { useTheme } from "@mui/material";
import React from "react";
import MapboxContainer from "../common/MapboxContainer";
import mapboxgl from "mapbox-gl";
import addActivityDetailMarkers from "./helpers/addActivityDetailMarkers";
import initiateMap from "@/helpers/initiateMap";

const ActivityDetailMap = () => {
    const [{ activity, peakSummits }, setActivityDetailState] =
        useActivityDetail();

    const theme = useTheme();

    const mapContainerRef = React.useRef<any>(null);
    const mapRef = React.useRef<mapboxgl.Map | null>(null);

    React.useEffect(() => {
        initiateMap(
            mapContainerRef,
            mapRef,
            () => {
                addActivityDetailMarkers(
                    mapRef.current,
                    theme,
                    activity,
                    peakSummits
                );
            },
            [activity.startLong ?? 0, activity.startLat ?? 0]
        );

        setActivityDetailState((state) => ({
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
                    xs: "50vh",
                    md: "calc(75vh - 88px)",
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

export default ActivityDetailMap;
