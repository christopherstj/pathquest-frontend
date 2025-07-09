"use client";
import { useDashboard } from "@/state/DashboardContext";
import React from "react";
import { Virtuoso } from "react-virtuoso";
import ActivityRow from "../peaks/ActivityRow";
import getCoords from "../activities/helpers/getCoords";
import clearCoords from "../activities/helpers/clearCoords";
import { useUser } from "@/state/UserContext";
import { Box, Button, Divider, SxProps, Typography } from "@mui/material";
import Link from "next/link";

const containerStyles: SxProps = {
    borderRadius: "12px",
    backgroundColor: "primary.container",
    padding: "0px 4px",
    boxShadow: 3,
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: {
        xs: "70vh",
        md: "calc(60vh - 66px)",
    },
    ".activities-list": {
        // height: "100%",
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
    },
};

const RecentActivities = () => {
    const [{ activities, map }] = useDashboard();
    const [{ user }] = useUser();

    const [coordsTimeoutId, setCoordsTimeoutId] =
        React.useState<NodeJS.Timeout | null>(null);

    if (!activities || !user) {
        return null;
    }

    const onHover = (activityId: string) => {
        if (coordsTimeoutId) {
            clearTimeout(coordsTimeoutId);
        }

        setCoordsTimeoutId(setTimeout(() => getCoords(activityId, map), 500));
    };

    const onClick = (lat: number, long: number) => {
        map?.flyTo({ center: [long, lat], zoom: 12 });
    };

    return (
        <>
            <Box width="100%">
                <Box display="flex" justifyContent="space-between">
                    <Typography
                        variant="h5"
                        component="h4"
                        color="primary.onContainer"
                    >
                        Activities with Summits
                    </Typography>
                    <Button
                        size="small"
                        color="primary"
                        variant="text"
                        LinkComponent={Link}
                        href="/app/activities"
                    >
                        All Activities
                    </Button>
                </Box>
                <Divider
                    sx={{
                        backgroundColor: "primary.onContainer",
                        height: "2px",
                        marginTop: "12px",
                    }}
                />
            </Box>
            <Box sx={containerStyles}>
                <Virtuoso
                    className="activities-list"
                    data={activities.sort((a, b) => {
                        if (!a || !b) {
                            return 0;
                        }
                        return a.startTime > b.startTime ? -1 : 1;
                    })}
                    itemContent={(_, activity) => (
                        <ActivityRow
                            activity={activity}
                            key={activity.id}
                            units={user.units}
                            onMouseOut={() => {
                                clearTimeout(coordsTimeoutId!);
                                clearCoords(map);
                            }}
                            onMouseOver={onHover}
                            onClick={onClick}
                        />
                    )}
                />
            </Box>
        </>
    );
};

export default RecentActivities;
