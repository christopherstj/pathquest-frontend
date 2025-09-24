import { Box, SxProps, Typography } from "@mui/material";
import React from "react";
import Image from "next/image";
import logo from "../../public/images/api_logo_pwrdBy_strava_stack_white.svg";

const containerStyles: SxProps = {
    width: "100%",
    height: "100%",
    maxWidth: "500px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    alignItems: "center",
    justifyContent: {
        xs: "flex-start",
        md: "center",
    },
};

const Title = () => {
    return (
        <Box sx={containerStyles}>
            <Typography
                variant="h4"
                component="h2"
                color="secondary.onContainerDim"
                textAlign="center"
            >
                Your modern adventure catalog and challenge tracker.
            </Typography>
            <Image src={logo} alt="Powered by Strava" height={80} />
        </Box>
    );
};

export default Title;
