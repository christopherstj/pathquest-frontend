import { Box, SxProps } from "@mui/material";
import { borderRadius } from "@mui/system";
import React from "react";

export type CardColors =
    | "primary"
    | "primaryDim"
    | "secondary"
    | "secondaryDim"
    | "tertiary"
    | "tertiaryDim"
    | "background";

type Props = {
    children?: React.ReactNode;
    sx?: SxProps;
    color?: CardColors;
};

const getColorStyles = (color: CardColors) => {
    switch (color) {
        case "primary":
            return {
                backgroundColor: "primary.container",
                color: "primary.onContainer",
            };
        case "primaryDim":
            return {
                backgroundColor: "primary.containerDim",
                color: "primary.onContainerDim",
            };
        case "secondary":
            return {
                backgroundColor: "secondary.container",
                color: "secondary.onContainer",
            };
        case "secondaryDim":
            return {
                backgroundColor: "secondary.containerDim",
                color: "secondary.onContainerDim",
            };
        case "tertiary":
            return {
                backgroundColor: "tertiary.container",
                color: "tertiary.onContainer",
            };
        case "tertiaryDim":
            return {
                backgroundColor: "tertiary.containerDim",
                color: "tertiary.onContainerDim",
            };
        case "background":
            return {
                backgroundColor: "background.paper",
                color: "primary.onContainer",
            };
    }
};

const cardStyles = (color: CardColors) => ({
    borderRadius: "12px",
    padding: "1.5rem",
    ...getColorStyles(color),
    boxShadow: 3,
});

const Card = ({ children, sx, color = "primary" }: Props) => {
    const totalStyles = {
        ...cardStyles(color),
        ...sx,
    };
    return <Box sx={totalStyles}>{children}</Box>;
};

export default Card;
