import { Box, SxProps, Typography } from "@mui/material";
import React from "react";

const rowStyles: SxProps = {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    width: "100%",
};

type Props = {
    label: string;
    value: string | number;
    color?: "primary" | "secondary" | "tertiary";
};

const DataRow = ({ label, value, color = "primary" }: Props) => {
    return (
        <Box sx={rowStyles}>
            <Typography variant="caption" color={`${color}.onContainerDim`}>
                {label}
            </Typography>
            <Typography
                variant="caption"
                color={`${color}.onContainerDim`}
                fontWeight="bold"
            >
                {value}
            </Typography>
        </Box>
    );
};

export default DataRow;
