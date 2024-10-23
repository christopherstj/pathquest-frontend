"use client";
import { usePeakDetail } from "@/state/PeakDetailContext";
import { Box, Divider, SxProps, Typography } from "@mui/material";
import React from "react";
import ActivityRow from "./ActivityRow";
import { useUser } from "@/state/UserContext";
import { GeoJSONSource } from "mapbox-gl";

const containerStyles: SxProps = {
    padding: "0px 4px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxHeight: {
        xs: "70vh",
        md: "calc(100vh - 32px)",
    },
};

const listStyles: SxProps = {
    borderRadius: "12px",
    backgroundColor: "primary.container",
    padding: 0,
    paddingRight: "4px",
    paddingLeft: "8px",
    flex: 1,
    overflowY: "scroll",
    "&::-webkit-scrollbar": {
        width: "8px",
    },
    "&::-webkit-scrollbar-thumb": {
        backgroundColor: "primary.onContainer",
        borderRadius: "8px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
        backgroundColor: "primary.onContainerDim",
    },
    "&::-webkit-scrollbar-track": {
        backgroundColor: "transparent",
    },
};

const ActivityList = () => {
    const [{ activities, summits, map }] = usePeakDetail();
    const [{ user }] = useUser();

    if (!activities || !user) return null;

    const { units } = user;

    const activitiesWithSummits = activities
        .map((a) => ({
            ...a,
            summits: summits.filter((s) => s.activityId === a.id),
        }))
        .sort((a, b) => {
            return (
                new Date(b.startTime).getTime() -
                new Date(a.startTime).getTime()
            );
        });

    const onRowHover = (activityId: string) => {
        if (map) {
            const activity = activities.find((a) => a.id === activityId);
            if (!activity) return;
            (map.getSource("selectedActivities") as GeoJSONSource).setData({
                type: "FeatureCollection",
                features: [
                    {
                        type: "Feature",
                        geometry: {
                            type: "LineString",
                            coordinates: (
                                activity.coords as [number, number][]
                            ).map((c) => [c[1], c[0]]),
                        },
                        properties: {
                            id: activity.id,
                        },
                    },
                ],
            });
        }
    };

    const clearSelectedActivities = () => {
        if (map) {
            (map.getSource("selectedActivities") as GeoJSONSource).setData({
                type: "FeatureCollection",
                features: [],
            });
        }
    };

    return (
        <Box sx={containerStyles}>
            <Typography variant="h5" color="primary.onContainer">
                Your summits
            </Typography>
            <Divider
                sx={{ backgroundColor: "primary.onContainer", width: "100%" }}
            />
            <Box sx={listStyles}>
                {activitiesWithSummits.map((activity) => (
                    <ActivityRow
                        key={activity.id}
                        activity={activity}
                        units={units}
                        onMouseOver={onRowHover}
                        onMouseOut={clearSelectedActivities}
                    />
                ))}
            </Box>
        </Box>
    );
};

export default ActivityList;
