import metersToFt from "@/helpers/metersToFt";
import { Box, Typography } from "@mui/material";
import React from "react";

type Props = {
    altitude: number;
    units: "metric" | "imperial";
};

const AltitudeCard = ({ altitude, units }: Props) => {
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
                {Math.round(
                    units === "metric" ? altitude : metersToFt(altitude)
                )
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                {units === "metric" ? " m" : " ft"}
            </Typography>
        </Box>
    );
};

export default AltitudeCard;
