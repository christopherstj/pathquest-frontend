"use client";
import { useActivities } from "@/state_old/ActivitiesContext";
import { Box, Button, IconButton, SxProps } from "@mui/material";
import React, { useMemo } from "react";
import { Virtuoso } from "react-virtuoso";
import ActivityRow from "../peaks/ActivityRow";
import ActivityStartListItem from "./ActivityStartListItem";
import { useUser } from "@/state_old/UserContext";
import { Close } from "@mui/icons-material";
import getCoords from "./helpers/getCoords";
import clearCoords from "./helpers/clearCoords";

const cardStyles: SxProps = {
    borderRadius: "12px",
    backgroundColor: "primary.container",
    padding: "8px 0px",
    position: "absolute",
    bottom: "8px",
    left: "8px",
    right: "8px",
    boxShadow: 3,
    height: "160px",
    display: "flex",
    flexDirection: "column",
    zIndex: 10,
    ".peaks-list": {
        flex: 1,
        "&::-webkit-scrollbar": {
            width: "0px",
            height: "8px",
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

const SelectedActivities = () => {
    const [{ selectedActivities, activityStarts, map }, setActivitiesState] =
        useActivities();
    const [{ user }] = useUser();

    const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(
        null
    );

    if (!user) {
        return null;
    }

    const { units } = user;

    const onHover = (activityId: string) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        setTimeoutId(
            setTimeout(() => {
                getCoords(activityId, map);
            }, 500)
        );
    };

    const onClose = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        clearCoords(map);
        setActivitiesState((state) => ({
            ...state,
            selectedActivities: [],
        }));
    };

    const activities = useMemo(() => {
        return selectedActivities
            .map((activityId) => {
                return activityStarts.find(
                    (activity) => activity.id === activityId
                );
            })
            .filter((activity) => !!activity)
            .sort((a, b) => {
                if (!a || !b) {
                    return 0;
                }
                return a.startTime > b.startTime ? -1 : 1;
            });
    }, [selectedActivities, activityStarts]);

    if (activities.length === 0 && selectedActivities.length > 0) {
        onClose();
    }

    return selectedActivities.length > 0 ? (
        <Box sx={cardStyles}>
            <Box
                sx={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    backgroundColor: "primary.containerDim",
                    borderRadius: "50%",
                    zIndex: 11,
                }}
            >
                <IconButton
                    size="small"
                    color="primary"
                    onClick={onClose}
                    sx={{ color: "primary.onContainerDim" }}
                >
                    <Close />
                </IconButton>
            </Box>
            <Virtuoso
                className="peaks-list"
                data={activities}
                horizontalDirection
                itemContent={(_, activity) =>
                    activity ? (
                        <ActivityStartListItem
                            activity={activity}
                            units={units}
                            onClick={() => {}}
                            onHover={onHover}
                            onUnhover={() => {
                                if (timeoutId) {
                                    clearTimeout(timeoutId);
                                }
                                clearCoords(map);
                            }}
                        />
                    ) : null
                }
            />
        </Box>
    ) : null;
};

export default SelectedActivities;
