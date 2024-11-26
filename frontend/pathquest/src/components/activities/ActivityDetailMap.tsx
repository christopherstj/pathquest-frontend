"use client";
import { useActivityDetail } from "@/state/ActivityDetailsContext";
import { useUser } from "@/state/UserContext";
import { useTheme } from "@mui/material";
import React from "react";
import MapboxContainer from "../common/MapboxContainer";
import mapboxgl from "mapbox-gl";
import addActivityDetailMarkers from "./helpers/addActivityDetailMarkers";

const ActivityDetailMap = () => {
    const [{ activity, peakSummits }, setActivityDetailState] =
        useActivityDetail();
    const [{ user }] = useUser();

    const units = user?.units ?? "metric";

    const theme = useTheme();

    const mapContainerRef = React.useRef<any>(null);
    const mapRef = React.useRef<mapboxgl.Map | null>(null);

    React.useEffect(() => {
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            center: [activity.startLong ?? 0, activity.startLat ?? 0],
            zoom: 8,
        });

        mapRef.current.on("load", () => {
            addActivityDetailMarkers(
                mapRef.current,
                theme,
                activity,
                peakSummits
            );
        });

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

export default ActivityDetailMap;
