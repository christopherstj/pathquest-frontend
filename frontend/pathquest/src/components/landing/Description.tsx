import { Box, Button, SxProps, Typography } from "@mui/material";
import Link from "next/link";
import React from "react";

const containerStyles: SxProps = {
    width: "100%",
    height: "100%",
    maxWidth: "500px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: {
        xs: "flex-start",
        md: "center",
    },
    gap: "16px",
};

const buttonStyles: SxProps = {
    backgroundColor: "tertiary.base",
    color: "tertiary.onContainer",
    borderRadius: "24px",
};

const Description = () => {
    return (
        <Box sx={containerStyles}>
            <Typography
                variant="h4"
                component="h2"
                color="primary.onContainerDim"
                textAlign="center"
            >
                Your path forward
            </Typography>
            <Button
                variant="contained"
                sx={buttonStyles}
                LinkComponent={Link}
                href="/app"
            >
                Explore
            </Button>
        </Box>
    );
};

export default Description;
