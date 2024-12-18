"use client";
import { useActivityDetail } from "@/state/ActivityDetailsContext";
import { Box, Button, SxProps } from "@mui/material";
import Link from "next/link";
import React from "react";

const cardStyles: SxProps = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "12px",
    borderRadius: "12px",
    backgroundColor: "primary.container",
    flex: 1,
};

const stravaButtonStyles: SxProps = {
    borderRadius: "24px",
    backgroundColor: "transparent",
    borderColor: "primary.onContainer",
    color: "#FC4C02",
    paddingLeft: "12px",
    paddingRight: "12px",
    "&:hover": {
        backgroundColor: "primary.containerDim",
    },
};

const StravaCard = () => {
    const [
        {
            activity: { id },
        },
    ] = useActivityDetail();
    return (
        <Box sx={cardStyles}>
            <Button
                sx={stravaButtonStyles}
                size="small"
                LinkComponent={Link}
                href={`https://www.strava.com/activities/${id}`}
                target="_blank"
            >
                View on Strava
            </Button>
        </Box>
    );
};

export default StravaCard;
