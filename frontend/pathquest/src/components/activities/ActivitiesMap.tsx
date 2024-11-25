"use client";
import React, { useCallback } from "react";
import MapboxContainer from "../common/MapboxContainer";
import { useUser } from "@/state/UserContext";
import { useActivities } from "@/state/ActivitiesContext";
import mapboxgl, { MapMouseEvent } from "mapbox-gl";
import { useTheme } from "@mui/material";
import "mapbox-gl/dist/mapbox-gl.css";
import addActivitiesMarkers from "./helpers/addActivitiesMarkers";
import getNewData from "./helpers/getNewData";
import { useMessage } from "@/state/MessageContext";
import { ActivityStart } from "@/typeDefs/ActivityStart";
import SelectedActivities from "./SelectedActivities";
import ActivityPopup from "./ActivityPopup";
import { useRouter } from "next/navigation";
import getActivityCoords from "@/actions/getActivityCoords";

const ActivitiesMap = () => {
    const [{ search, limitToBbox }, setActivitiesState] = useActivities();
    const [{ user }] = useUser();
    const [, dispatch] = useMessage();

    const mapContainerRef = React.useRef<any>(null);
    const mapRef = React.useRef<mapboxgl.Map | null>(null);

    const theme = useTheme();

    const router = useRouter();

    if (!user) return null;

    const redirect = (url: string) => router.push(url);

    const refreshData = useCallback(() => {
        getNewData(
            mapRef.current,
            search,
            limitToBbox,
            dispatch,
            setActivitiesState
        );
    }, [search, mapRef.current, limitToBbox, dispatch, setActivitiesState]);

    const onClusterClick = useCallback(
        (e: MapMouseEvent) => {
            const features = e.target.queryRenderedFeatures(e.point, {
                layers: ["clusters"],
            });
            const feature = features?.[0];

            if (feature?.geometry.type === "Point" && e.target) {
                const source = e?.target.getSource(
                    "activityStarts"
                ) as mapboxgl.GeoJSONSource;
                const clusterId = features?.[0].properties?.cluster_id;
                const pointCount = features?.[0].properties?.point_count;

                source.getClusterLeaves(
                    clusterId,
                    pointCount,
                    0,
                    (err, clusterFeatures) => {
                        const clusterActivityStarts = (
                            clusterFeatures ?? []
                        ).map((f) => f.properties as ActivityStart);

                        setActivitiesState((state) => ({
                            ...state,
                            selectedActivities: clusterActivityStarts.map(
                                (activity) => activity.id
                            ),
                        }));
                    }
                );
            }
        },
        [setActivitiesState]
    );

    const onActivityClick = useCallback(
        (e: MapMouseEvent) => {
            const feature = e.features?.[0];

            const activity = feature?.properties as ActivityStart;

            setActivitiesState((state) => ({
                ...state,
                selectedActivities: [activity.id],
            }));

            getActivityCoords(activity.id).then((coords) => {
                if (coords) {
                    const source = e.target?.getSource(
                        "activities"
                    ) as mapboxgl.GeoJSONSource;

                    if (source) {
                        source.setData({
                            type: "FeatureCollection",
                            features: [
                                {
                                    type: "Feature",
                                    geometry: {
                                        type: "LineString",
                                        coordinates: coords.coords.map((c) => [
                                            c[1],
                                            c[0],
                                        ]),
                                    },
                                    properties: {
                                        id: activity.id,
                                    },
                                },
                            ],
                        });
                    }
                }
            });

            if (feature?.geometry.type === "Point" && e.target) {
                const coordinates = feature?.geometry.coordinates.slice();

                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] +=
                        e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                const popup = new mapboxgl.Popup()
                    .setLngLat(coordinates as [number, number])
                    .setDOMContent(
                        ActivityPopup({
                            activity,
                            theme,
                            units: user.units,
                            redirect,
                        })
                    )
                    .addTo(e.target);

                popup.on("close", () => {
                    setActivitiesState((state) => ({
                        ...state,
                        selectedActivities: [],
                    }));

                    const source = e.target?.getSource(
                        "activities"
                    ) as mapboxgl.GeoJSONSource;

                    if (source) {
                        source.setData({
                            type: "FeatureCollection",
                            features: [],
                        });
                    }
                });
            }
        },
        [setActivitiesState, getActivityCoords, user.units]
    );

    React.useEffect(() => {
        if (mapRef.current) {
            mapRef.current.on("moveend", refreshData);
        }
        return () => {
            mapRef.current?.off("moveend", refreshData);
        };
    }, [mapRef.current, refreshData]);

    React.useEffect(() => {
        if (mapRef.current) {
            mapRef.current.on("click", "clusters", onClusterClick);
        }
        return () => {
            mapRef.current?.off("click", "clusters", onClusterClick);
        };
    }, [mapRef.current, onClusterClick]);

    React.useEffect(() => {
        if (mapRef.current) {
            mapRef.current.on("click", "activityStarts", onActivityClick);
        }
        return () => {
            mapRef.current?.off("click", "activityStarts", onActivityClick);
        };
    }, [mapRef.current, onActivityClick]);

    React.useEffect(() => {
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            center: [user.long ?? -111.651302, user.lat ?? 35.198284],
            zoom: 8,
        });

        mapRef.current.on("load", () => {
            addActivitiesMarkers(mapRef.current, theme);
            refreshData();
        });

        setActivitiesState((state) => ({
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
            <SelectedActivities />
        </MapboxContainer>
    );
};

export default ActivitiesMap;
