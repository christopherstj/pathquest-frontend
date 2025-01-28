"use client";
import { useActivityDetail } from "@/state/ActivityDetailsContext";
import { Box, Divider, Typography } from "@mui/material";
import React from "react";
import ActivityMenu from "./ActivityMenu";
import dayjs from "@/helpers/dayjs";

const tz = dayjs.tz.guess();

const ActivityTitle = () => {
    const [
        {
            activity: { name, id, reprocessing, startTime, timezone },
        },
        setActivityDetailState,
    ] = useActivityDetail();

    const timezoneToUse = timezone ? timezone.split(" ").slice(-1)[0] : tz;

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    pr: {
                        xs: "48px",
                        md: "0px",
                    },
                }}
            >
                <Box flex="1" display="flex" flexDirection="column">
                    <Typography variant="h4" color="primary.onContainer">
                        {name}
                    </Typography>
                    <Typography
                        variant="caption"
                        color="primary.onContainerDim"
                    >
                        {dayjs(startTime)
                            .tz(timezoneToUse)
                            .format("MMM D, YYYY h:mm A")}
                    </Typography>
                </Box>
                <ActivityMenu
                    activityId={id}
                    isReprocessing={reprocessing}
                    setActivityDetailState={setActivityDetailState}
                />
            </Box>
            <Divider
                color="primary"
                sx={{
                    margin: "12px 0px",
                }}
            />
        </>
    );
};

export default ActivityTitle;
