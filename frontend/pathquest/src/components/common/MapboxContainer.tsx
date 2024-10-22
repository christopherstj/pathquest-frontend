import { Box, BoxProps, SxProps } from "@mui/material";
import React from "react";

const containerStyles: SxProps = {
    height: {
        xs: "70vh",
        md: "60vh",
    },
    width: "100%",
    borderRadius: "8px",
    overflow: "hidden",
    ".mapboxgl-popup-tip": {
        borderTopColor: "background.paper",
    },
    ".mapboxgl-popup-content": {
        backgroundColor: "background.paper",
        borderRadius: "6px",
        padding: "12px 8px 8px 8px",
        fontFamily: "var(--font-merriweather-sans)",
        ".link-primary": {
            color: "primary.onContainer",
            textDecoration: "none",
            fontFamily: "var(--font-merriweather-sans)",
            padding: "4px 12px",
            borderRadius: "8px",
            border: "1px solid",
            borderColor: "primary.onContainer",
            width: "100%",
            "&:hover": {
                textDecoration: "underline",
            },
        },
        ".tag-primary": {
            color: "primary.onContainer",
            backgroundColor: "primary.containerDim",
            padding: "2px 4px",
            borderRadius: "8px",
            margin: "4px 0",
        },
        ".link-secondary": {
            color: "secondary.onContainer",
            textDecoration: "none",
            fontFamily: "var(--font-merriweather-sans)",
            padding: "4px 12px",
            borderRadius: "8px",
            border: "1px solid",
            borderColor: "secondary.onContainer",
            width: "100%",
            "&:hover": {
                textDecoration: "underline",
            },
        },
        ".button-secondary": {
            color: "secondary.onContainer",
            fontWeight: "bold",
            fontFamily: "var(--font-merriweather-sans)",
            textDecoration: "none",
            padding: "4px",
            borderRadius: "12px",
            width: "100%",
            border: "1px solid",
            borderColor: "secondary.onContainerDim",
            backgroundColor: "transparent",
            marginTop: "8px",
            "&:hover": {
                backgroundColor: "secondary.containerDim",
            },
        },
        ".tag-secondary": {
            color: "secondary.onContainer",
            backgroundColor: "secondary.containerDim",
            padding: "2px 4px",
            borderRadius: "8px",
            margin: "4px 0",
        },
        ".link-tertiary": {
            color: "tertiary.onContainer",
            textDecoration: "none",
            fontFamily: "var(--font-merriweather-sans)",
            padding: "4px 12px",
            borderRadius: "8px",
            border: "1px solid",
            borderColor: "tertiary.onContainer",
            width: "100%",
            "&:hover": {
                textDecoration: "underline",
            },
        },
        ".tag-tertiary": {
            color: "tertiary.onContainer",
            backgroundColor: "tertiary.containerDim",
            padding: "2px 4px",
            borderRadius: "8px",
            margin: "4px 0",
        },
        ".button-tertiary": {
            color: "tertiary.onContainer",
            fontWeight: "bold",
            fontFamily: "var(--font-merriweather-sans)",
            textDecoration: "none",
            padding: "4px",
            borderRadius: "12px",
            width: "100%",
            border: "1px solid",
            borderColor: "tertiary.onContainerDim",
            backgroundColor: "transparent",
            marginTop: "8px",
            "&:hover": {
                backgroundColor: "tertiary.containerDim",
            },
        },
    },
    ".mapboxgl-popup-close-button": {
        right: "4px",
        color: "primary.onContainer",
    },
};

const MapboxContainer = ({ sx, ...props }: BoxProps) => {
    const totalStyles = {
        ...containerStyles,
        ...sx,
    };
    return <Box sx={totalStyles} {...props} />;
};

export default MapboxContainer;