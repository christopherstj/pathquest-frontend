import { Box, SxProps } from "@mui/material";
import React from "react";
import LimitToBboxCheckbox from "./LimitToBboxCheckbox";
import ChallengeList from "./ChallengeList";
import ChallengeTypeButtons from "./ChallengeTypeButtons";
import ChallengeSearch from "./ChallengeSearch";

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
    ".challenge-list": {
        height: "100%",
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

const ChallengeLayout = () => {
    return (
        <Box sx={cardStyles}>
            <ChallengeTypeButtons />
            <ChallengeSearch />
            <LimitToBboxCheckbox />
            <ChallengeList />
        </Box>
    );
};

export default ChallengeLayout;
