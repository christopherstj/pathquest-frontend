"use client";
import { Box, SxProps, Theme, Typography } from "@mui/material";
import React from "react";
import Image from "next/image";
import logo from "../../public/images/logo-no-background.svg";

const backgroundStyles: SxProps<Theme> = (theme) => ({
    background: `radial-gradient(circle closest-side, ${theme.palette.primary.base}, ${theme.palette.background.default})`,
    height: "100%",
    minHeight: {
        xs: "50vh",
        md: "70vh",
    },
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "-8px",
    marginRight: "-8px",
});

const Header = () => {
    return (
        <Box sx={backgroundStyles}>
            <Image src={logo} alt="PathQuest logo" width={300} />
            <Typography
                variant="h2"
                fontWeight="bold"
                component="h1"
                color="primary.onContainer"
            >
                PathQuest
            </Typography>
        </Box>
    );
};

export default Header;
