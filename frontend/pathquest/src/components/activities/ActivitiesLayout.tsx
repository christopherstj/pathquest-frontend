import { Box, SxProps } from "@mui/material";
import React from "react";
import ActivitiesList from "./ActivitiesList";
import ActivitiesSearch from "./ActivitiesSearch";
import LimitToBboxCheckbox from "./LimitToBboxCheckbox";

const cardStyles: SxProps = {
    borderRadius: "12px",
    backgroundColor: `primary.container`,
    paddingRight: "4px",
    paddingLeft: "8px",
    paddingTop: "8px",
    boxShadow: 3,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    width: "100%",
    minHeight: "70vh",
    flex: 1,
    position: "relative",
    overflow: "hidden",
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

const ActivitiesLayout = () => {
    return (
        <Box sx={cardStyles}>
            <ActivitiesSearch />
            <LimitToBboxCheckbox />
            <ActivitiesList />
        </Box>
    );
};

export default ActivitiesLayout;
