"use client";
import { useActivityDetail } from "@/state/ActivityDetailsContext";
import { Box, Button, ButtonBase, SxProps } from "@mui/material";
import Link from "next/link";
import React from "react";

const cardStyles: SxProps = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "12px",
    borderRadius: "12px",
    backgroundColor: "primary.container",
    flex: { md: 1 },
    color: "#FC4C02",
    flexBasis: { xs: "calc(50% - 8px)", md: "0" },
};

const stravaButtonStyles: SxProps = {
    borderRadius: "24px",
    backgroundColor: "transparent",
    borderColor: "primary.onContainer",
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
        <ButtonBase
            sx={cardStyles}
            onClick={() =>
                window.open(`https://www.strava.com/activities/${id}`)
            }
        >
            View on Strava
        </ButtonBase>
    );
};

export default StravaCard;
