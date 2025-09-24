import { Box, Button, SxProps, Typography } from "@mui/material";
import React from "react";
import DistanceCard from "./DistanceCard";
import GainCard from "./GainCard";
import StravaCard from "./StravaCard";
import AddManualSummitCard from "./AddManualSummitCard";

const containerStyles: SxProps = {
    display: "flex",
    width: "100%",
    gap: "16px",
    flexWrap: "wrap",
};

const ActivityDetails = () => {
    return (
        <Box sx={containerStyles}>
            <DistanceCard />
            <GainCard />
            <StravaCard />
            <AddManualSummitCard />
        </Box>
    );
};

export default ActivityDetails;
