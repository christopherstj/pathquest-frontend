import { Box, Typography } from "@mui/material";
import React from "react";

type Props = {
    altitude: number;
};

const AltitudeCard = ({ altitude }: Props) => {
    const color =
        (altitude ?? 0) < 1000
            ? "primary"
            : (altitude ?? 0) < 3000
            ? "secondary"
            : "tertiary";
    return (
        <Box
            sx={{
                backgroundColor: `${color}.onContainerDim`,
                padding: "8px",
                borderRadius: "8px",
            }}
        >
            <Typography variant="body1" color={`${color}.containerDim`}>
                {altitude.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}m
            </Typography>
        </Box>
    );
};

export default AltitudeCard;
