import { Box, Button, SxProps, Typography } from "@mui/material";
import Link from "next/link";
import React from "react";

const cardStyles: SxProps = {
    borderRadius: "12px",
    backgroundColor: "primary.container",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    justifyContent: "center",
    alignItems: "center",
};

const buttonStyles: SxProps = {
    borderRadius: "24px",
    backgroundColor: "transparent",
    borderColor: "primary.onContainer",
    color: "primary.onContainer",
    "&:hover": {
        backgroundColor: "primary.containerDim",
    },
};

const NotAuthorized = () => {
    return (
        <Box sx={cardStyles}>
            <Typography variant="h3" color="primary.onContainer">
                Unauthorized
            </Typography>
            <Typography variant="body1" color="primary.onContainerDim">
                Looks like you haven't subscribed yet! Click the button below to
                get started!
            </Typography>
            <Button LinkComponent={Link} href="/checkout" sx={buttonStyles}>
                Let's Go!
            </Button>
        </Box>
    );
};

export default NotAuthorized;
