"use client";
import getDistanceString from "@/helpers/getDistanceString";
import { useActivityDetail } from "@/state_old/ActivityDetailsContext";
import { useUser } from "@/state_old/UserContext";
import { Box, SxProps, Typography } from "@mui/material";
import React from "react";

const cardStyles: SxProps = {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "12px",
    borderRadius: "12px",
    backgroundColor: "primary.container",
    flex: { md: 1 },
    flexBasis: { xs: "calc(50% - 8px)", md: "0" },
};

const DistanceCard = () => {
    const [{ user }] = useUser();
    const [
        {
            activity: { distance },
        },
    ] = useActivityDetail();

    if (!user) return null;

    const units = user.units;

    const distanceString = getDistanceString(distance, units);

    return (
        <Box sx={cardStyles}>
            <Typography variant="body1" color="primary.onContainer">
                Distance
            </Typography>
            <Typography variant="h6" color="primary.onContainerDim">
                {distanceString}
            </Typography>
        </Box>
    );
};

export default DistanceCard;
